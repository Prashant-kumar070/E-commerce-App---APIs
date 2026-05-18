<?php

namespace App\Http\Controllers\Api\Seller;

use App\Http\Controllers\Controller;
use App\Http\Resources\SellerOrderListResource;
use App\Services\OrderService;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(protected OrderService $orderService) {}

    public function index(Request $request)
    {
        return $this->paginatedResponse(
            $this->orderService->paginateSellerOrders($request->user()),
            SellerOrderListResource::class,
            'Seller orders fetched successfully.'
        );
    }
}
