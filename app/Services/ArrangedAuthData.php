<?php

namespace App\Services;

class ArrangedAuthData
{
    public static function fromToken(array $token): array
    {
        return [
            'access_token' => $token['token'],
            'token_type' => $token['token_type'],
            'expires_at' => $token['expires_at'],
        ];
    }
}
