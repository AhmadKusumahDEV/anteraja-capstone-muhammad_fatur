<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GenerateManifestRequest extends FormRequest
{
    /**
     * Semua request di-authorize tanpa auth check (bisa dikonfigurasi nanti).
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'manifest_code'      => 'nullable|string|max:50|unique:manifests,manifest_code',
            'origin_hub_id'      => 'nullable|string|exists:hubs,id',
            'destination_hub_id' => 'required|string|exists:hubs,id',
            'total_packages'     => 'required|integer|min:1|max:150',
            'eta_offset_minutes' => 'required|integer|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'destination_hub_id.required' => 'Hub tujuan wajib dipilih.',
            'destination_hub_id.exists'   => 'Hub tujuan tidak ditemukan.',
            'total_packages.required'     => 'Jumlah paket wajib diisi.',
            'total_packages.min'          => 'Jumlah paket minimal 1.',
            'total_packages.max'          => 'Jumlah paket maksimal 150.',
            'eta_offset_minutes.required' => 'ETA offset wajib diisi.',
            'eta_offset_minutes.min'      => 'ETA offset tidak boleh negatif.',
            'manifest_code.unique'        => 'Kode manifest sudah digunakan.',
        ];
    }
}
