<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreAdminProductRequest;
use App\Http\Requests\Admin\UpdateAdminProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\Request;

class ProductManagementController extends Controller
{
    public function __construct(protected ProductService $productService) {}

    public function index(Request $request)
    {
        $filters = [];
        if ($request->filled('seller_id')) {
            $filters['seller_id'] = $request->query('seller_id');
        }
        if ($request->filled('search')) {
            $filters['search'] = $request->query('search');
        }
        if ($request->has('is_active') && $request->query('is_active') !== '') {
            $filters['is_active'] = $request->query('is_active');
        }

        return $this->paginatedResponse(
            $this->productService->paginateAll($request->integer('per_page', 15), $filters),
            ProductResource::class,
            'Products fetched successfully.'
        );
    }

    public function show(Product $product)
    {
        return $this->success(new ProductResource($this->productService->find($product->id)));
    }

    public function store(StoreAdminProductRequest $request)
    {
        $data = $request->validated();
        $data['image'] = $request->file('image');
        $sellerId = (int) $data['seller_id'];
        unset($data['seller_id']);

        $product = $this->productService->createForSellerByAdmin($sellerId, $data);

        return $this->success(new ProductResource($product), 'Product created successfully.', 201);
    }

    public function update(UpdateAdminProductRequest $request, Product $product)
    {
        $data = $request->validated();
        $data['image'] = $request->file('image');
        $product = $this->productService->updateByAdmin($product->id, $data);

        return $this->success(new ProductResource($product), 'Product updated successfully.');
    }

    public function destroy(Product $product)
    {
        $this->productService->deleteByAdmin($product->id);

        return $this->success(null, 'Product deleted successfully.');
    }
}
