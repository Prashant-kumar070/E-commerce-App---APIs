<?php

namespace App\Services;

use App\Exceptions\ApiException;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\User;
use App\Repositories\Contracts\ProductRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductService
{
    public function __construct(protected ProductRepositoryInterface $products)
    {
    }

    public function paginateCatalog(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return $this->products->paginateCatalog($filters, $perPage);
    }

    public function paginateSellerProducts(User $seller, int $perPage = 15): LengthAwarePaginator
    {
        return $this->products->paginateSellerProducts($seller->id, $perPage);
    }

    public function paginateAll(int $perPage = 15): LengthAwarePaginator
    {
        return $this->products->paginateAll($perPage);
    }

    public function find(int $id): Product
    {
        return $this->products->findOrFail($id);
    }

    public function create(User $seller, array $data): Product
    {
        return DB::transaction(function () use ($seller, $data): Product {
            $product = $this->products->create([
                'seller_id' => $seller->id,
                'name' => $data['name'],
                'slug' => Str::slug($data['name']).'-'.Str::lower(Str::random(6)),
                'description' => $data['description'] ?? null,
                'price' => $data['price'],
                'stock' => $data['stock'],
                'is_active' => $data['is_active'] ?? true,
            ]);

            if (! empty($data['image']) && $data['image'] instanceof UploadedFile) {
                $this->storeImage($product, $data['image']);
            }

            return $product->fresh(['images', 'seller.role']);
        });
    }

    public function update(User $seller, int $productId, array $data): Product
    {
        return DB::transaction(function () use ($seller, $productId, $data): Product {
            $product = $this->products->findSellerProductOrFail($productId, $seller->id);

            $product = $this->products->update($product, [
                'name' => $data['name'] ?? $product->name,
                'description' => $data['description'] ?? $product->description,
                'price' => $data['price'] ?? $product->price,
                'stock' => $data['stock'] ?? $product->stock,
                'is_active' => $data['is_active'] ?? $product->is_active,
            ]);

            if (! empty($data['image']) && $data['image'] instanceof UploadedFile) {
                $this->storeImage($product, $data['image'], true);
            }

            return $product->fresh(['images', 'seller.role']);
        });
    }

    public function delete(User $seller, int $productId): bool
    {
        $product = $this->products->findSellerProductOrFail($productId, $seller->id);

        foreach ($product->images as $image) {
            Storage::disk('public')->delete($image->path);
        }

        return $this->products->delete($product);
    }

    protected function storeImage(Product $product, UploadedFile $image, bool $replace = false): void
    {
        if ($replace) {
            foreach ($product->images as $existingImage) {
                Storage::disk('public')->delete($existingImage->path);
            }

            $product->images()->delete();
        }

        $path = $image->store('uploads/products', 'public');

        ProductImage::query()->create([
            'product_id' => $product->id,
            'path' => $path,
            'is_primary' => true,
        ]);
    }

    public function ensureAvailable(Product $product, int $quantity): void
    {
        if (! $product->is_active) {
            throw new ApiException('The selected product is not active.', 422);
        }

        if ($product->stock < $quantity) {
            throw new ApiException('Insufficient stock for product: '.$product->name, 422);
        }
    }
}
