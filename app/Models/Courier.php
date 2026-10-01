<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Courier extends Model
{
    use HasFactory;

    protected $primaryKey  = 'id';
    public    $incrementing = false;
    protected $keyType     = 'string';

    protected $guarded = [];

    /**
     * Relasi ke Hub tempat kurir bertugas saat ini.
     */
    public function currentHub()
    {
        return $this->belongsTo(Hub::class, 'current_hub_id', 'id');
    }
}
