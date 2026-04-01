<?php

namespace Database\Seeders;

use App\Enums\PermissionType;
use App\Enums\RoleType;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        foreach (RoleType::cases() as $roleType) {
            Role::query()->updateOrCreate(
                ['slug' => $roleType->value],
                ['name' => $roleType->label(), 'description' => $roleType->label().' role']
            );
        }

        foreach (PermissionType::cases() as $permissionType) {
            Permission::query()->updateOrCreate(
                ['slug' => $permissionType->value],
                ['name' => str($permissionType->value)->headline()->toString(), 'description' => $permissionType->description()]
            );
        }

        $rolePermissions = [
            RoleType::Admin->value => PermissionType::cases(),
            RoleType::Seller->value => [
                PermissionType::ProductManageOwn,
                PermissionType::ProductViewOwn,
                PermissionType::OrderViewOwn,
            ],
            RoleType::Customer->value => [],
            RoleType::DeliveryPerson->value => [
                PermissionType::OrderDeliverAssigned,
            ],
        ];

        foreach ($rolePermissions as $roleSlug => $permissions) {
            $role = Role::query()->where('slug', $roleSlug)->firstOrFail();
            $permissionIds = collect($permissions)
                ->map(fn ($permission) => Permission::query()->where('slug', $permission->value)->value('id'))
                ->filter()
                ->all();

            $role->permissions()->sync($permissionIds);
        }
    }
}
