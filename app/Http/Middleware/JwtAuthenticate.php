<?php

namespace App\Http\Middleware;

use App\Exceptions\ApiException;
use App\Models\User;
use App\Support\Jwt\JwtManager;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class JwtAuthenticate
{
    public function __construct(protected JwtManager $jwtManager)
    {
    }

    public function handle(Request $request, Closure $next): Response
    {
        $header = $request->bearerToken();

        if (! $header) {
            throw new ApiException('Authentication token is required.', 401);
        }

        $payload = $this->jwtManager->decode($header);
        $user = User::query()
            ->with('role.permissions')
            ->find($payload['sub'] ?? 0);

        if (! $user) {
            throw new ApiException('Authenticated user could not be found.', 401);
        }

        Auth::setUser($user);
        $request->attributes->set('jwt_payload', $payload);

        return $next($request);
    }
}
