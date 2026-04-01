<?php

namespace App\Repositories\Eloquent;

use App\Models\Product;
use App\Repositories\Contracts\ProductRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class EloquentProductRepository implements ProductRepositoryInterface
{
    public function create(array $data): Product
    {
        return Product::query()->create($data)->load(['images', 'seller.role']);
    }

    public function update(Product $product, array $data): Product
    {
        $product->update($data);

        return $product->fresh(['images', 'seller.role']);
    }

    public function delete(Product $product): bool
    {
        return (bool) $product->delete();
    }

    public function findOrFail(int $id): Product
    {
        return Product::query()->with(['images', 'seller.role'])->findOrFail($id);
    }

    public function findSellerProductOrFail(int $id, int $sellerId): Product
    {
        return Product::query()
            ->with(['images', 'seller.role'])
            ->where('seller_id', $sellerId)
            ->findOrFail($id);
    }

    public function paginateCatalog(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return Product::query()
            ->with(['images', 'seller.role'])
            ->when(isset($filters['seller_id']), fn ($query) => $query->where('seller_id', $filters['seller_id']))
            ->when(isset($filters['search']), fn ($query) => $query->where(function ($builder) use ($filters): void {
                $builder
                    ->where('name', 'like', '%'.$filters['search'].'%')
                    ->orWhere('description', 'like', '%'.$filters['search'].'%');
            }))
            ->where('is_active', true)
            ->latest()
            ->paginate($perPage);
    }

    public function paginateSellerProducts(int $sellerId, int $perPage = 15): LengthAwarePaginator
    {
        return Product::query()
            ->with(['images', 'seller.role'])
            ->where('seller_id', $sellerId)
            ->latest()
            ->paginate($perPage);
    }

    public function paginateAll(int $perPage = 15): LengthAwarePaginator
    {
        return Product::query()
            ->with(['images', 'seller.role'])
            ->latest()
            ->paginate($perPage);
    }
}
