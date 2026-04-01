<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AssignDeliveryRequest;
use App\Http\Requests\Admin\UpdateOrderStatusRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;

class OrderManagementController extends Controller
{
    public function __construct(protected OrderService $orderService)
    {
    }

    public function index()
    {
        return $this->paginatedResponse($this->orderService->paginateAll(), OrderResource::class, 'Orders fetched successfully.');
    }

    public function show(Order $order)
    {
        return $this->success(new OrderResource($order->load(['customer.role', 'deliveryPerson.role', 'items.product.images', 'items.seller.role'])));
    }

    public function assignDelivery(AssignDeliveryRequest $request, Order $order)
    {
        $order = $this->orderService->assignDelivery($order, $request->validated()['delivery_person_id']);

        return $this->success(new OrderResource($order), 'Delivery person assigned successfully.');
    }

    public function updateStatus(UpdateOrderStatusRequest $request, Order $order)
    {
        $order = $this->orderService->updateStatus($order, $request->validated()['status']);

        return $this->success(new OrderResource($order), 'Order status updated successfully.');
    }
}
