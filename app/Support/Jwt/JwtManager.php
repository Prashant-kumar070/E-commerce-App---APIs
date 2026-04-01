<?php

namespace App\Support\Jwt;

use App\Exceptions\ApiException;
use App\Models\JwtBlacklist;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Config;

class JwtManager
{
    public function generateToken(User $user): array
    {
        $ttl = (int) Config::get('jwt.ttl', 60);
        $now = CarbonImmutable::now();
        $expiresAt = $now->addMinutes($ttl);
        $payload = [
            'iss' => Config::get('app.url'),
            'sub' => $user->id,
            'email' => $user->email,
            'role' => $user->role?->slug,
            'iat' => $now->timestamp,
            'nbf' => $now->timestamp,
            'exp' => $expiresAt->timestamp,
            'jti' => (string) str()->uuid(),
        ];

        return [
            'token' => $this->encode($payload),
            'expires_at' => $expiresAt->toIso8601String(),
            'token_type' => 'Bearer',
            'payload' => $payload,
        ];
    }

    public function decode(string $token): array
    {
        $segments = explode('.', $token);

        if (count($segments) !== 3) {
            throw new ApiException('Invalid token format.', 401);
        }

        [$encodedHeader, $encodedPayload, $signature] = $segments;
        $expectedSignature = $this->sign($encodedHeader.'.'.$encodedPayload);

        if (! hash_equals($expectedSignature, $signature)) {
            throw new ApiException('Invalid token signature.', 401);
        }

        $payload = json_decode($this->base64UrlDecode($encodedPayload), true);

        if (! is_array($payload)) {
            throw new ApiException('Invalid token payload.', 401);
        }

        $now = CarbonImmutable::now()->timestamp;

        if (($payload['nbf'] ?? 0) > $now || ($payload['exp'] ?? 0) < $now) {
            throw new ApiException('Token has expired or is not active yet.', 401);
        }

        if ($this->isBlacklisted((string) Arr::get($payload, 'jti'))) {
            throw new ApiException('Token has been invalidated.', 401);
        }

        return $payload;
    }

    public function invalidate(array $payload): void
    {
        JwtBlacklist::query()->updateOrCreate(
            ['jti' => (string) Arr::get($payload, 'jti')],
            ['expires_at' => CarbonImmutable::createFromTimestamp((int) Arr::get($payload, 'exp'))]
        );
    }

    protected function isBlacklisted(string $jti): bool
    {
        return JwtBlacklist::query()
            ->where('jti', $jti)
            ->where('expires_at', '>', now())
            ->exists();
    }

    protected function encode(array $payload): string
    {
        $header = ['alg' => 'HS256', 'typ' => 'JWT'];
        $encodedHeader = $this->base64UrlEncode(json_encode($header, JSON_THROW_ON_ERROR));
        $encodedPayload = $this->base64UrlEncode(json_encode($payload, JSON_THROW_ON_ERROR));

        return $encodedHeader.'.'.$encodedPayload.'.'.$this->sign($encodedHeader.'.'.$encodedPayload);
    }

    protected function sign(string $value): string
    {
        $secret = (string) Config::get('jwt.secret', config('app.key'));

        return $this->base64UrlEncode(hash_hmac('sha256', $value, $secret, true));
    }

    protected function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }

    protected function base64UrlDecode(string $value): string
    {
        return base64_decode(strtr($value, '-_', '+/'), true) ?: '';
    }
}
