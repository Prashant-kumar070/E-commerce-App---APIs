<?php

use App\Http\Controllers\Api\Admin\OrderManagementController;
use App\Http\Controllers\Api\Admin\ProductManagementController;
use App\Http\Controllers\Api\Admin\UserManagementController;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Customer\CartController;
use App\Http\Controllers\Api\Customer\OrderController as CustomerOrderController;
use App\Http\Controllers\Api\Customer\ProductController as CustomerProductController;
use App\Http\Controllers\Api\Delivery\OrderController as DeliveryOrderController;
use App\Http\Controllers\Api\Seller\ProductController as SellerProductController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::post('auth/register', [AuthController::class, 'register']);
    Route::post('auth/login', [AuthController::class, 'login']);
    Route::get('docs/openapi', function () {
        return response()->file(base_path('docs/openapi.yaml'), [
            'Content-Type' => 'application/yaml',
        ]);
    });

    Route::get('products', [CustomerProductController::class, 'index']);
    Route::get('products/{product}', [CustomerProductController::class, 'show']);

    Route::middleware('jwt.auth')->group(function (): void {
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('auth/profile', [AuthController::class, 'profile']);

        Route::prefix('admin')
            ->middleware(['role:admin', 'permission:users.manage'])
            ->group(function (): void {
                Route::apiResource('users', UserManagementController::class);
            });

        Route::prefix('admin')
            ->middleware(['role:admin'])
            ->group(function (): void {
                Route::get('products', [ProductManagementController::class, 'index']);
                Route::get('products/{product}', [ProductManagementController::class, 'show']);

                Route::get('orders', [OrderManagementController::class, 'index']);
                Route::get('orders/{order}', [OrderManagementController::class, 'show']);
                Route::patch('orders/{order}/assign-delivery', [OrderManagementController::class, 'assignDelivery']);
                Route::patch('orders/{order}/status', [OrderManagementController::class, 'updateStatus']);
            });

        Route::prefix('seller')
            ->middleware(['role:seller'])
            ->group(function (): void {
                Route::get('products', [SellerProductController::class, 'index']);
                Route::post('products', [SellerProductController::class, 'store']);
                Route::patch('products/{product}', [SellerProductController::class, 'update']);
                Route::delete('products/{product}', [SellerProductController::class, 'destroy']);
            });

        Route::prefix('customer')
            ->middleware(['role:customer'])
            ->group(function (): void {
                Route::get('cart', [CartController::class, 'index']);
                Route::post('cart/items', [CartController::class, 'store']);
                Route::patch('cart/items/{cartItem}', [CartController::class, 'update']);
                Route::delete('cart/items/{cartItem}', [CartController::class, 'destroy']);

                Route::get('orders', [CustomerOrderController::class, 'index']);
                Route::post('orders', [CustomerOrderController::class, 'store']);
            });

        Route::prefix('delivery')
            ->middleware(['role:delivery_person'])
            ->group(function (): void {
                Route::get('orders', [DeliveryOrderController::class, 'index']);
                Route::patch('orders/{order}/status', [DeliveryOrderController::class, 'updateStatus']);
            });
    });
});
