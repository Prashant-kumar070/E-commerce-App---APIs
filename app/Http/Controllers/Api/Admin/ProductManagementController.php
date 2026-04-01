<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Services\ProductService;

class ProductManagementController extends Controller
{
    public function __construct(protected ProductService $productService)
    {
    }

    public function index()
    {
        return $this->paginatedResponse($this->productService->paginateAll(), ProductResource::class, 'Products fetched successfully.');
    }

    public function show(int $product)
    {
        return $this->success(new ProductResource($this->productService->find($product)));
    }
}
