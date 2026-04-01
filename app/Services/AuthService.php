<?php

namespace App\Services;

use App\Exceptions\ApiException;
use App\Models\Role;
use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Support\Jwt\JwtManager;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function __construct(
        protected UserRepositoryInterface $users,
        protected JwtManager $jwtManager,
    ) {
    }

    public function register(array $data): array
    {
        return DB::transaction(function () use ($data): array {
            $role = Role::query()->where('slug', $data['role'])->firstOrFail();

            /** @var User $user */
            $user = $this->users->create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'password' => $data['password'],
                'role_id' => $role->id,
                'address' => $data['address'] ?? null,
            ]);

            $token = $this->jwtManager->generateToken($user);

            return [
                'user' => $user,
                'auth' => ArrangedAuthData::fromToken($token),
            ];
        });
    }

    public function login(array $credentials): array
    {
        $user = $this->users->findByEmail($credentials['email']);

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw new ApiException('Invalid login credentials.', 401);
        }

        $token = $this->jwtManager->generateToken($user);

        return [
            'user' => $user,
            'auth' => ArrangedAuthData::fromToken($token),
        ];
    }

    public function logout(array $payload): void
    {
        $this->jwtManager->invalidate($payload);
    }
}
