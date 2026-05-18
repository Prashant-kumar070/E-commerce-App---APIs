<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\Request;

class UserManagementController extends Controller
{
    public function __construct(protected UserService $userService) {}

    public function index(Request $request)
    {
        $filters = [];
        if ($request->filled('role')) {
            $filters['role'] = $request->query('role');
        }
        if ($request->filled('search')) {
            $filters['search'] = $request->query('search');
        }

        return $this->paginatedResponse(
            $this->userService->paginate($request->integer('per_page', 15), $filters),
            UserResource::class,
            'Users fetched successfully.'
        );
    }

    public function store(StoreUserRequest $request)
    {
        $user = $this->userService->create($request->validated());

        return $this->success(new UserResource($user), 'User created successfully.', 201);
    }

    public function show(User $user)
    {
        return $this->success(new UserResource($user->load('role.permissions')));
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $user = $this->userService->update($user, $request->validated());

        return $this->success(new UserResource($user), 'User updated successfully.');
    }

    public function destroy(Request $request, User $user)
    {
        $this->userService->assertCanDelete($request->user(), $user);
        $this->userService->delete($user);

        return $this->success(null, 'User deleted successfully.');
    }
}
