<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\PlaceOrderRequest;
use App\Http\Resources\OrderResource;
use App\Services\OrderService;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(protected OrderService $orderService)
    {
    }

    public function index(Request $request)
    {
        return $this->paginatedResponse(
            $this->orderService->paginateCustomerOrders($request->user()),
            OrderResource::class,
            'Customer orders fetched successfully.'
        );
    }

    public function store(PlaceOrderRequest $request)
    {
        $order = $this->orderService->placeOrder($request->user(), $request->validated());

        return $this->success(new OrderResource($order), 'Order placed successfully.', 201);
    }
}
