<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Hub extends Model
{
    use HasFactory;

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $guarded = [];

    /**
     * Paket yang sedang berada di Hub ini.
     */
    public function packages()
    {
        return $this->hasMany(Package::class, 'current_hub_id', 'id');
    }
}
