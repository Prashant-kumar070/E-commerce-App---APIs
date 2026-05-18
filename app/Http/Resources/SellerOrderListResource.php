<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SellerOrderListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $sellerId = (int) $request->user()->id;
        $sellerSubtotal = collect($this->items ?? [])
            ->where('seller_id', $sellerId)
            ->sum(fn ($row) => (float) $row->subtotal);

        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'status' => $this->status,
            'seller_subtotal' => round($sellerSubtotal, 2),
            'placed_at' => $this->placed_at?->toIso8601String(),
            'customer' => new UserResource($this->whenLoaded('customer')),
        ];
    }
}
