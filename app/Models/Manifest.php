<?php

namespace App\Models;

use App\Enums\ManifestStatusEnum;
use App\Enums\ManifestTypeEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Manifest extends Model
{
    use HasFactory;

    protected $primaryKey  = 'manifest_code';
    public    $incrementing = false;
    protected $keyType     = 'string';

    protected $guarded = [];

    protected $casts = [
        'type'          => ManifestTypeEnum::class,
        'status'        => ManifestStatusEnum::class,
        'eta_timestamp' => 'datetime',
    ];

    public function originHub()
    {
        return $this->belongsTo(Hub::class, 'origin_hub_id', 'id');
    }

    public function destinationHub()
    {
        return $this->belongsTo(Hub::class, 'destination_hub_id', 'id');
    }

    public function packages()
    {
        return $this->belongsToMany(Package::class, 'manifest_packages', 'manifest_code', 'tracking_id');
    }
}
