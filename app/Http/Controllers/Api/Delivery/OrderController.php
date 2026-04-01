<?php

namespace App\Http\Controllers\Api\Delivery;

use App\Http\Controllers\Controller;
use App\Http\Requests\Delivery\UpdateDeliveryStatusRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
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
            $this->orderService->paginateAssigned($request->user()),
            OrderResource::class,
            'Assigned orders fetched successfully.'
        );
    }

    public function updateStatus(UpdateDeliveryStatusRequest $request, Order $order)
    {
        $order = $this->orderService->updateStatus($order, $request->validated()['status'], $request->user());

        return $this->success(new OrderResource($order), 'Delivery status updated successfully.');
    }
}
