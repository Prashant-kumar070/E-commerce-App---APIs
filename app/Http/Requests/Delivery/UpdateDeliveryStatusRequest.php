<?php

namespace App\Http\Requests\Delivery;

use App\Enums\OrderStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDeliveryStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in([
                OrderStatus::Assigned->value,
                OrderStatus::OutForDelivery->value,
                OrderStatus::Delivered->value,
            ])],
        ];
    }
}
