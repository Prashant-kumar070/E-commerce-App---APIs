<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AssignDeliveryRequest;
use App\Http\Requests\Admin\StoreAdminOrderRequest;
use App\Http\Requests\Admin\UpdateAdminOrderRequest;
use App\Http\Requests\Admin\UpdateOrderStatusRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\User;
use App\Services\OrderService;
use Illuminate\Http\Request;

class OrderManagementController extends Controller
{
    public function __construct(protected OrderService $orderService) {}

    public function index(Request $request)
    {
        $filters = [];
        if ($request->filled('status')) {
            $filters['status'] = $request->query('status');
        }
        if ($request->filled('search')) {
            $filters['search'] = $request->query('search');
        }

        return $this->paginatedResponse(
            $this->orderService->paginateAll($request->integer('per_page', 15), $filters),
            OrderResource::class,
            'Orders fetched successfully.'
        );
    }

    public function store(StoreAdminOrderRequest $request)
    {
        $validated = $request->validated();
        $customer = User::query()->findOrFail($validated['customer_id']);
        unset($validated['customer_id']);
        $order = $this->orderService->createAdminOrder($customer, $validated);

        return $this->success(new OrderResource($order), 'Order created successfully.', 201);
    }

    public function show(Order $order)
    {
        return $this->success(new OrderResource($order->load(['customer.role', 'deliveryPerson.role', 'items.product.images', 'items.seller.role'])));
    }

    public function update(UpdateAdminOrderRequest $request, Order $order)
    {
        $order = $this->orderService->updateAdminOrder($order, $request->validated());

        return $this->success(new OrderResource($order), 'Order updated successfully.');
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
