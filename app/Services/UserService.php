<?php

namespace App\Services;

use App\Models\Role;
use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class UserService
{
    public function __construct(protected UserRepositoryInterface $users)
    {
    }

    public function paginate(int $perPage = 15): LengthAwarePaginator
    {
        return $this->users->paginate($perPage);
    }

    public function create(array $data): User
    {
        return DB::transaction(function () use ($data): User {
            $role = Role::query()->where('slug', $data['role'])->firstOrFail();

            return $this->users->create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'password' => $data['password'],
                'role_id' => $role->id,
                'address' => $data['address'] ?? null,
            ]);
        });
    }

    public function update(User $user, array $data): User
    {
        return DB::transaction(function () use ($user, $data): User {
            if (isset($data['role'])) {
                $role = Role::query()->where('slug', $data['role'])->firstOrFail();
                $data['role_id'] = $role->id;
            }

            unset($data['role']);

            return $this->users->update($user, $data);
        });
    }

    public function delete(User $user): bool
    {
        return $this->users->delete($user);
    }
}
