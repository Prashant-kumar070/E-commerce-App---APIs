<?php

namespace App\Repositories\Eloquent;

use App\Models\Order;
use App\Repositories\Contracts\OrderRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class EloquentOrderRepository implements OrderRepositoryInterface
{
    public function create(array $data): Order
    {
        return Order::query()->create($data)->load($this->relations());
    }

    public function update(Order $order, array $data): Order
    {
        $order->update($data);

        return $order->fresh($this->relations());
    }

    public function findOrFail(int $id): Order
    {
        return Order::query()->with($this->relations())->findOrFail($id);
    }

    public function paginateAll(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        return Order::query()
            ->with($this->relations())
            ->when(! empty($filters['status']), fn ($query) => $query->where('status', $filters['status']))
            ->when(! empty($filters['search']), function ($query) use ($filters): void {
                $term = '%'.$filters['search'].'%';
                $query->where(function ($inner) use ($term): void {
                    $inner->where('order_number', 'like', $term)
                        ->orWhereHas('customer', function ($customerQuery) use ($term): void {
                            $customerQuery->where('name', 'like', $term)->orWhere('email', 'like', $term);
                        });
                });
            })
            ->orderByDesc('placed_at')
            ->orderByDesc('id')
            ->paginate($perPage);
    }

    public function paginateByCustomer(int $customerId, int $perPage = 15): LengthAwarePaginator
    {
        return Order::query()
            ->with($this->relations())
            ->where('customer_id', $customerId)
            ->latest()
            ->paginate($perPage);
    }

    public function paginateAssigned(int $deliveryPersonId, int $perPage = 15): LengthAwarePaginator
    {
        return Order::query()
            ->with($this->relations())
            ->where('delivery_person_id', $deliveryPersonId)
            ->latest()
            ->paginate($perPage);
    }

    public function paginateForSeller(int $sellerId, int $perPage = 15): LengthAwarePaginator
    {
        return Order::query()
            ->with($this->relations())
            ->whereHas('items', fn ($query) => $query->where('seller_id', $sellerId))
            ->orderByDesc('placed_at')
            ->orderByDesc('id')
            ->paginate($perPage);
    }

    protected function relations(): array
    {
        return [
            'customer.role',
            'deliveryPerson.role',
            'items.product.images',
            'items.seller.role',
        ];
    }
}
