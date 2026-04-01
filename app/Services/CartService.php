<?php

namespace App\Services;

use App\Exceptions\ApiException;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\User;
use App\Repositories\Contracts\CartRepositoryInterface;
use App\Repositories\Contracts\ProductRepositoryInterface;
use Illuminate\Support\Facades\DB;

class CartService
{
    public function __construct(
        protected CartRepositoryInterface $carts,
        protected ProductRepositoryInterface $products,
        protected ProductService $productService,
    ) {
    }

    public function getCart(User $customer): Cart
    {
        return $this->carts->getOrCreateByCustomer($customer->id);
    }

    public function addItem(User $customer, array $data): Cart
    {
        return DB::transaction(function () use ($customer, $data): Cart {
            $cart = $this->carts->getOrCreateByCustomer($customer->id);
            $product = $this->products->findOrFail($data['product_id']);

            $this->productService->ensureAvailable($product, (int) $data['quantity']);

            $existingItem = $cart->items()->where('product_id', $product->id)->first();
            $quantity = (int) $data['quantity'] + (int) ($existingItem?->quantity ?? 0);

            $this->productService->ensureAvailable($product, $quantity);

            $cart->items()->updateOrCreate(
                ['product_id' => $product->id],
                ['quantity' => $quantity, 'unit_price' => $product->price]
            );

            return $this->carts->refresh($cart);
        });
    }

    public function updateItem(User $customer, int $cartItemId, array $data): Cart
    {
        return DB::transaction(function () use ($customer, $cartItemId, $data): Cart {
            $cart = $this->carts->getOrCreateByCustomer($customer->id);
            $item = $cart->items()->with('product')->findOrFail($cartItemId);

            $this->productService->ensureAvailable($item->product, (int) $data['quantity']);
            $item->update(['quantity' => $data['quantity']]);

            return $this->carts->refresh($cart);
        });
    }

    public function removeItem(User $customer, int $cartItemId): Cart
    {
        return DB::transaction(function () use ($customer, $cartItemId): Cart {
            $cart = $this->carts->getOrCreateByCustomer($customer->id);
            $item = $cart->items()->findOrFail($cartItemId);
            $item->delete();

            return $this->carts->refresh($cart);
        });
    }

    public function clear(Cart $cart): void
    {
        $cart->items()->delete();
    }

    public function ensureNotEmpty(Cart $cart): void
    {
        if (! $cart->items()->exists()) {
            throw new ApiException('Cart is empty.', 422);
        }
    }
}
