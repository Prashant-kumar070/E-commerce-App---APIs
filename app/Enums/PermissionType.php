<?php

namespace App\Enums;

enum PermissionType: string
{
    case UserManage = 'users.manage';
    case ProductManageAll = 'products.manage-all';
    case ProductManageOwn = 'products.manage-own';
    case ProductViewOwn = 'products.view-own';
    case OrderManageAll = 'orders.manage-all';
    case OrderViewOwn = 'orders.view-own';
    case OrderDeliverAssigned = 'orders.deliver-assigned';

    public function description(): string
    {
        return match ($this) {
            self::UserManage => 'Create and manage all users',
            self::ProductManageAll => 'Manage all products',
            self::ProductManageOwn => 'Manage own products',
            self::ProductViewOwn => 'View own products',
            self::OrderManageAll => 'Manage all orders',
            self::OrderViewOwn => 'View own orders',
            self::OrderDeliverAssigned => 'View and update assigned deliveries',
        };
    }
}
