<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResponse;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;

abstract class Controller
{
    protected function success(
        mixed $data = null,
        string $message = 'Request completed successfully.',
        int $status = 200,
        array $meta = [],
    ): JsonResponse {
        return ApiResponse::success($data, $message, $status, $meta);
    }

    protected function paginatedResponse(
        LengthAwarePaginator $paginator,
        string $resourceClass,
        string $message = 'Request completed successfully.',
    ): JsonResponse {
        /** @var JsonResource $resourceClass */
        return $this->success(
            $resourceClass::collection($paginator->items()),
            $message,
            200,
            [
                'pagination' => [
                    'current_page' => $paginator->currentPage(),
                    'last_page' => $paginator->lastPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                ],
            ]
        );
    }
}
