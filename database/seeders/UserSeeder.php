<?php

namespace Database\Seeders;

use App\Enums\RoleType;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name' => 'System Admin',
                'email' => 'admin@example.com',
                'role' => RoleType::Admin->value,
            ],
            [
                'name' => 'Demo Seller',
                'email' => 'seller@example.com',
                'role' => RoleType::Seller->value,
            ],
            [
                'name' => 'Demo Customer',
                'email' => 'customer@example.com',
                'role' => RoleType::Customer->value,
            ],
            [
                'name' => 'Demo Delivery',
                'email' => 'delivery@example.com',
                'role' => RoleType::DeliveryPerson->value,
            ],
        ];

        foreach ($users as $userData) {
            $role = Role::query()->where('slug', $userData['role'])->firstOrFail();

            User::query()->updateOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'password' => 'password',
                    'role_id' => $role->id,
                    'phone' => '0000000000',
                    'address' => 'Demo address',
                ]
            );
        }
    }
}
