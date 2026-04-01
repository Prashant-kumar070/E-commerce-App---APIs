<?php

namespace App\Repositories\Contracts;

use App\Models\Cart;

interface CartRepositoryInterface
{
    public function getOrCreateByCustomer(int $customerId): Cart;

    public function refresh(Cart $cart): Cart;
}
