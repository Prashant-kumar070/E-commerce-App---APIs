<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ProductImageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // Files under public/products/ are served by the app host (e.g. :8000). Using the
        // current request origin avoids wrong URLs when APP_URL is http://localhost without port.
        $url = str_starts_with($this->path, 'products/')
            ? $request->getSchemeAndHttpHost().'/'.ltrim($this->path, '/')
            : $request->getSchemeAndHttpHost().'/storage/'.ltrim($this->path, '/');

        return [
            'id' => $this->id,
            'path' => $this->path,
            'url' => $url,
            'is_primary' => $this->is_primary,
        ];
    }
}
