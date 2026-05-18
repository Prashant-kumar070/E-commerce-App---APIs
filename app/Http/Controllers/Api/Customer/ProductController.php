<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
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
            $this->productService->paginateCatalog($request->only(['search', 'seller_id', 'category', 'is_deal'])),
            ProductResource::class,
            'Product catalog fetched successfully.'
        );
    }

    public function show(int $product)
    {
        return $this->success(new ProductResource($this->productService->find($product)));
    }
}
