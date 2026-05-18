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
            ->when(! empty($filters['category']), fn ($query) => $query->where('category', $filters['category']))
            ->when(isset($filters['is_deal']) && filter_var($filters['is_deal'], FILTER_VALIDATE_BOOLEAN), function ($query): void {
                $query->whereNotNull('original_price')->whereColumn('original_price', '>', 'price');
            })
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

    public function paginateAll(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        return Product::query()
            ->with(['images', 'seller.role'])
            ->when(isset($filters['seller_id']) && $filters['seller_id'] !== '', fn ($query) => $query->where('seller_id', (int) $filters['seller_id']))
            ->when(array_key_exists('is_active', $filters) && $filters['is_active'] !== null && $filters['is_active'] !== '', function ($query) use ($filters): void {
                $raw = $filters['is_active'];
                if (is_bool($raw)) {
                    $query->where('is_active', $raw);

                    return;
                }
                $active = filter_var($raw, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
                if ($active !== null) {
                    $query->where('is_active', $active);
                }
            })
            ->when(! empty($filters['search']), function ($query) use ($filters): void {
                $term = '%'.$filters['search'].'%';
                $query->where(function ($inner) use ($term): void {
                    $inner->where('name', 'like', $term)->orWhere('description', 'like', $term);
                });
            })
            ->latest('id')
            ->paginate($perPage);
    }
}
