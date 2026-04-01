<?php

namespace App\Enums;

enum RoleType: string
{
    case Admin = 'admin';
    case Seller = 'seller';
    case Customer = 'customer';
    case DeliveryPerson = 'delivery_person';

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Admin',
            self::Seller => 'Seller',
            self::Customer => 'Customer',
            self::DeliveryPerson => 'Delivery Person',
        };
    }
}
