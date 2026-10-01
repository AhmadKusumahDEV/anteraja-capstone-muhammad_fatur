<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Primary key sesuai DDL capstone (VARCHAR string, bukan auto-increment).
     */
    protected $primaryKey  = 'id';
    public    $incrementing = false;
    protected $keyType     = 'string';

    /**
     * Kolom yang boleh di-mass assign, sesuai DDL tabel users capstone.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'id',
        'nik',
        'name',
        'role',
        'hub_id',
        'password_hash',
    ];

    /**
     * Kolom yang disembunyikan dari serialisasi.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password_hash',
        'remember_token',
    ];

    /**
     * Kolom yang akan dicast ke tipe tertentu.
     *
     * @var array<string, string>
     */
    protected $casts = [
        //
    ];

    /**
     * Override nama kolom password untuk Sanctum/Auth agar mengarah ke password_hash.
     */
    public function getAuthPassword(): string
    {
        return $this->password_hash;
    }

    /**
     * Relasi ke Hub (user bisa bertugas di satu hub).
     */
    public function hub()
    {
        return $this->belongsTo(Hub::class, 'hub_id', 'id');
    }
}
