<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\AddToCartRequest;
use App\Http\Requests\Customer\UpdateCartItemRequest;
use App\Http\Resources\CartResource;
use App\Services\CartService;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function __construct(protected CartService $cartService)
    {
    }

    public function index(Request $request)
    {
        return $this->success(new CartResource($this->cartService->getCart($request->user())));
    }

    public function store(AddToCartRequest $request)
    {
        $cart = $this->cartService->addItem($request->user(), $request->validated());

        return $this->success(new CartResource($cart), 'Item added to cart successfully.');
    }

    public function update(UpdateCartItemRequest $request, int $cartItem)
    {
        $cart = $this->cartService->updateItem($request->user(), $cartItem, $request->validated());

        return $this->success(new CartResource($cart), 'Cart item updated successfully.');
    }

    public function destroy(Request $request, int $cartItem)
    {
        $cart = $this->cartService->removeItem($request->user(), $cartItem);

        return $this->success(new CartResource($cart), 'Cart item removed successfully.');
    }
}
