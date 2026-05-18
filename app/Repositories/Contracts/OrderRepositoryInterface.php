<?php

namespace App\Repositories\Contracts;

use App\Models\Order;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface OrderRepositoryInterface
{
    public function create(array $data): Order;

    public function update(Order $order, array $data): Order;

    public function findOrFail(int $id): Order;

    public function paginateAll(int $perPage = 15, array $filters = []): LengthAwarePaginator;

    public function paginateByCustomer(int $customerId, int $perPage = 15): LengthAwarePaginator;

    public function paginateAssigned(int $deliveryPersonId, int $perPage = 15): LengthAwarePaginator;

    public function paginateForSeller(int $sellerId, int $perPage = 15): LengthAwarePaginator;
}
