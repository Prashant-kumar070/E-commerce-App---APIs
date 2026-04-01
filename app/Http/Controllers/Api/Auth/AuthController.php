<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(protected AuthService $authService)
    {
    }

    public function register(RegisterRequest $request)
    {
        $result = $this->authService->register($request->validated());

        return $this->success([
            'user' => new UserResource($result['user']),
            'auth' => $result['auth'],
        ], 'Registration completed successfully.', 201);
    }

    public function login(LoginRequest $request)
    {
        $result = $this->authService->login($request->validated());

        return $this->success([
            'user' => new UserResource($result['user']),
            'auth' => $result['auth'],
        ], 'Login completed successfully.');
    }

    public function logout(Request $request)
    {
        $this->authService->logout($request->attributes->get('jwt_payload', []));

        return $this->success(null, 'Logout completed successfully.');
    }

    public function profile(Request $request)
    {
        return $this->success(new UserResource($request->user()->load('role.permissions')));
    }
}
