<?php

namespace App\Repositories\Contracts;

use App\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface ProductRepositoryInterface
{
    public function create(array $data): Product;

    public function update(Product $product, array $data): Product;

    public function delete(Product $product): bool;

    public function findOrFail(int $id): Product;

    public function findSellerProductOrFail(int $id, int $sellerId): Product;

    public function paginateCatalog(array $filters, int $perPage = 15): LengthAwarePaginator;

    public function paginateSellerProducts(int $sellerId, int $perPage = 15): LengthAwarePaginator;

    public function paginateAll(int $perPage = 15): LengthAwarePaginator;
}
