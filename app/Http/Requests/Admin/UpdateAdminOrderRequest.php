<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAdminOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'recipient_name' => ['sometimes', 'string', 'max:255'],
            'recipient_phone' => ['sometimes', 'string', 'max:30'],
            'shipping_address' => ['sometimes', 'string', 'max:255'],
            'shipping_city' => ['sometimes', 'string', 'max:255'],
            'shipping_state' => ['sometimes', 'string', 'max:255'],
            'shipping_postal_code' => ['sometimes', 'string', 'max:20'],
            'shipping_country' => ['sometimes', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
