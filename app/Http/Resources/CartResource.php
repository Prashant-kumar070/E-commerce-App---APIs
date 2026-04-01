<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $items = $this->whenLoaded('items');

        return [
            'id' => $this->id,
            'customer' => new UserResource($this->whenLoaded('customer')),
            'items' => CartItemResource::collection($items),
            'total_amount' => number_format(collect($items)->sum(fn ($item) => $item->quantity * $item->unit_price), 2, '.', ''),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
