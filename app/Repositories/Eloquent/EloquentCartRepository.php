<?php

namespace App\Repositories\Eloquent;

use App\Models\Cart;
use App\Repositories\Contracts\CartRepositoryInterface;

class EloquentCartRepository implements CartRepositoryInterface
{
    public function getOrCreateByCustomer(int $customerId): Cart
    {
        $cart = Cart::query()->firstOrCreate(['customer_id' => $customerId]);

        return $this->refresh($cart);
    }

    public function refresh(Cart $cart): Cart
    {
        return $cart->fresh(['items.product.images', 'items.product.seller.role', 'customer.role']);
    }
}
