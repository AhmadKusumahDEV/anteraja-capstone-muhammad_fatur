<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreShipmentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'tracking_number' => 'required|string|max:50',
            'weight_kg'       => 'required|numeric|gt:0',
            'distance_km'     => 'required|numeric|gt:0',
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     */
    public function messages(): array
    {
        return [
            'tracking_number.required' => 'Tracking Number tidak boleh kosong.',
            'tracking_number.string'   => 'Tracking Number harus berupa teks.',
            'weight_kg.required'       => 'Berat (weight) tidak boleh kosong.',
            'weight_kg.numeric'        => 'Berat harus berupa angka.',
            'weight_kg.gt'             => 'Berat harus lebih dari 0.',
            'distance_km.required'     => 'Jarak (distance) tidak boleh kosong.',
            'distance_km.numeric'      => 'Jarak harus berupa angka.',
            'distance_km.gt'           => 'Jarak harus lebih dari 0.',
        ];
    }
}
