<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Enums\NotificationTypeEnum;
use Illuminate\Support\Str;

class HubNotification extends Model
{
    protected $primaryKey = 'id';
    public $incrementing  = false;
    protected $keyType    = 'string';

    protected $guarded = [];

    protected $casts = [
        'type'    => NotificationTypeEnum::class,
        'is_read' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = (string) Str::uuid();
            }
        });
    }
}
