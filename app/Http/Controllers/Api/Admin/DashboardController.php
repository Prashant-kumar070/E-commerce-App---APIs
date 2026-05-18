<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $customerRoleId = Role::query()->where('slug', 'customer')->value('id');
        $sellerRoleId = Role::query()->where('slug', 'seller')->value('id');

        $revenue = (float) (Order::query()->sum('total_amount') ?? 0);
        $orderCount = Order::query()->count();
        $avgOrder = $orderCount > 0 ? round($revenue / $orderCount, 2) : 0.0;

        return $this->success([
            'total_revenue' => round($revenue, 2),
            'orders_count' => $orderCount,
            'users_count' => User::query()->count(),
            'customers_count' => $customerRoleId
                ? User::query()->where('role_id', $customerRoleId)->count()
                : 0,
            'sellers_count' => $sellerRoleId
                ? User::query()->where('role_id', $sellerRoleId)->count()
                : 0,
            'products_count' => Product::query()->count(),
            'avg_order_value' => $avgOrder,
        ], 'Admin dashboard stats fetched successfully.');
    }
}
