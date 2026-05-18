<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\RoleType;
use App\Exceptions\ApiException;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Repositories\Contracts\CartRepositoryInterface;
use App\Repositories\Contracts\OrderRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderService
{
    public function __construct(
        protected OrderRepositoryInterface $orders,
        protected CartRepositoryInterface $carts,
        protected UserRepositoryInterface $users,
        protected CartService $cartService,
        protected ProductService $productService,
    ) {}

    public function placeOrder(User $customer, array $data): Order
    {
        return DB::transaction(function () use ($customer, $data): Order {
            $cart = $this->carts->getOrCreateByCustomer($customer->id);
            $this->cartService->ensureNotEmpty($cart);

            $cart = $this->carts->refresh($cart);
            $totalAmount = $cart->items->sum(fn ($item) => $item->quantity * $item->unit_price);

            $order = $this->orders->create([
                'order_number' => 'ORD-'.Str::upper(Str::random(10)),
                'customer_id' => $customer->id,
                'status' => OrderStatus::Pending->value,
                'total_amount' => $totalAmount,
                'recipient_name' => $data['recipient_name'],
                'recipient_phone' => $data['recipient_phone'],
                'shipping_address' => $data['shipping_address'],
                'shipping_city' => $data['shipping_city'],
                'shipping_state' => $data['shipping_state'],
                'shipping_postal_code' => $data['shipping_postal_code'],
                'shipping_country' => $data['shipping_country'],
                'notes' => $data['notes'] ?? null,
                'placed_at' => now(),
            ]);

            foreach ($cart->items as $item) {
                $item->product->decrement('stock', $item->quantity);

                $order->items()->create([
                    'product_id' => $item->product_id,
                    'seller_id' => $item->product->seller_id,
                    'product_name' => $item->product->name,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'subtotal' => $item->quantity * $item->unit_price,
                ]);
            }

            $this->cartService->clear($cart);

            return $order->fresh(['customer.role', 'deliveryPerson.role', 'items.product.images', 'items.seller.role']);
        });
    }

    public function paginateCustomerOrders(User $customer, int $perPage = 15): LengthAwarePaginator
    {
        return $this->orders->paginateByCustomer($customer->id, $perPage);
    }

    public function paginateAll(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        return $this->orders->paginateAll($perPage, $filters);
    }

    public function paginateAssigned(User $deliveryPerson, int $perPage = 15): LengthAwarePaginator
    {
        return $this->orders->paginateAssigned($deliveryPerson->id, $perPage);
    }

    public function paginateSellerOrders(User $seller, int $perPage = 15): LengthAwarePaginator
    {
        return $this->orders->paginateForSeller($seller->id, $perPage);
    }

    public function createAdminOrder(User $customer, array $data): Order
    {
        if (! $customer->hasRole(RoleType::Customer)) {
            throw new ApiException('Orders can only be created for customer accounts.', 422);
        }

        return DB::transaction(function () use ($customer, $data): Order {
            $totalAmount = 0.0;
            $lines = [];

            foreach ($data['items'] as $row) {
                /** @var Product $product */
                $product = Product::query()->lockForUpdate()->findOrFail($row['product_id']);
                $quantity = (int) $row['quantity'];
                $this->productService->ensureAvailable($product, $quantity);
                $unitPrice = (float) $product->price;
                $subtotal = round($unitPrice * $quantity, 2);
                $totalAmount += $subtotal;
                $lines[] = [$product, $quantity, $unitPrice, $subtotal];
            }

            $order = $this->orders->create([
                'order_number' => 'ORD-'.Str::upper(Str::random(10)),
                'customer_id' => $customer->id,
                'status' => OrderStatus::Pending->value,
                'total_amount' => round($totalAmount, 2),
                'recipient_name' => $data['recipient_name'],
                'recipient_phone' => $data['recipient_phone'],
                'shipping_address' => $data['shipping_address'],
                'shipping_city' => $data['shipping_city'],
                'shipping_state' => $data['shipping_state'],
                'shipping_postal_code' => $data['shipping_postal_code'],
                'shipping_country' => $data['shipping_country'],
                'notes' => $data['notes'] ?? null,
                'placed_at' => now(),
            ]);

            foreach ($lines as [$product, $quantity, $unitPrice, $subtotal]) {
                $order->items()->create([
                    'product_id' => $product->id,
                    'seller_id' => $product->seller_id,
                    'product_name' => $product->name,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'subtotal' => $subtotal,
                ]);

                $product->decrement('stock', $quantity);
            }

            return $order->fresh(['customer.role', 'deliveryPerson.role', 'items.product.images', 'items.seller.role']);
        });
    }

    public function updateAdminOrder(Order $order, array $data): Order
    {
        $payload = array_filter([
            'recipient_name' => $data['recipient_name'] ?? null,
            'recipient_phone' => $data['recipient_phone'] ?? null,
            'shipping_address' => $data['shipping_address'] ?? null,
            'shipping_city' => $data['shipping_city'] ?? null,
            'shipping_state' => $data['shipping_state'] ?? null,
            'shipping_postal_code' => $data['shipping_postal_code'] ?? null,
            'shipping_country' => $data['shipping_country'] ?? null,
            'notes' => $data['notes'] ?? null,
        ], fn ($value) => $value !== null);

        if ($payload === []) {
            return $order->fresh(['customer.role', 'deliveryPerson.role', 'items.product.images', 'items.seller.role']);
        }

        return $this->orders->update($order, $payload);
    }

    public function assignDelivery(Order $order, int $deliveryPersonId): Order
    {
        $deliveryPerson = $this->users->findOrFail($deliveryPersonId);

        if (! $deliveryPerson->hasRole(RoleType::DeliveryPerson)) {
            throw new ApiException('Assigned user must be a delivery person.', 422);
        }

        return $this->orders->update($order, [
            'delivery_person_id' => $deliveryPersonId,
            'status' => OrderStatus::Assigned->value,
        ]);
    }

    public function updateStatus(Order $order, string $status, ?User $actor = null): Order
    {
        if ($actor && $actor->hasRole(RoleType::DeliveryPerson) && $order->delivery_person_id !== $actor->id) {
            throw new ApiException('You can only update your assigned orders.', 403);
        }

        $payload = ['status' => $status];

        if ($status === OrderStatus::Delivered->value) {
            $payload['delivered_at'] = now();
        }

        return $this->orders->update($order, $payload);
    }
}
