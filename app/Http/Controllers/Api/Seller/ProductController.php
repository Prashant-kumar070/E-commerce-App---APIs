<?php

namespace App\Http\Controllers\Api\Seller;

use App\Http\Controllers\Controller;
use App\Http\Requests\Seller\StoreProductRequest;
use App\Http\Requests\Seller\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Services\ProductService;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(protected ProductService $productService)
    {
    }

    public function index(Request $request)
    {
        return $this->paginatedResponse(
            $this->productService->paginateSellerProducts($request->user()),
            ProductResource::class,
            'Seller products fetched successfully.'
        );
    }

    public function store(StoreProductRequest $request)
    {
        $product = $this->productService->create($request->user(), $request->validated());

        return $this->success(new ProductResource($product), 'Product created successfully.', 201);
    }

    public function update(UpdateProductRequest $request, int $product)
    {
        $product = $this->productService->update($request->user(), $product, $request->validated());

        return $this->success(new ProductResource($product), 'Product updated successfully.');
    }

    public function destroy(Request $request, int $product)
    {
        $this->productService->delete($request->user(), $product);

        return $this->success(null, 'Product deleted successfully.');
    }
}
