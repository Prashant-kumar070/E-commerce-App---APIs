<?php

namespace App\Repositories\Eloquent;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class EloquentUserRepository implements UserRepositoryInterface
{
    public function create(array $data): User
    {
        return User::query()->create($data)->load('role.permissions');
    }

    public function update(User $user, array $data): User
    {
        $user->update($data);

        return $user->fresh(['role.permissions']);
    }

    public function delete(User $user): bool
    {
        return (bool) $user->delete();
    }

    public function paginate(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        return User::query()
            ->with('role.permissions')
            ->when(! empty($filters['role']), function ($query) use ($filters): void {
                $query->whereHas('role', fn ($roleQuery) => $roleQuery->where('slug', $filters['role']));
            })
            ->when(! empty($filters['search']), function ($query) use ($filters): void {
                $term = '%'.$filters['search'].'%';
                $query->where(function ($inner) use ($term): void {
                    $inner->where('name', 'like', $term)->orWhere('email', 'like', $term);
                });
            })
            ->latest('id')
            ->paginate($perPage);
    }

    public function findOrFail(int $id): User
    {
        return User::query()->with('role.permissions')->findOrFail($id);
    }

    public function findByEmail(string $email): ?User
    {
        return User::query()
            ->with('role.permissions')
            ->where('email', $email)
            ->first();
    }

    public function getByIds(array $ids): Collection
    {
        return User::query()
            ->with('role.permissions')
            ->whereIn('id', $ids)
            ->get();
    }
}
