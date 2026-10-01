<?php

namespace App\Enums;

enum ManifestStatusEnum: string
{
    case MENUNGGU_KEDATANGAN = 'MENUNGGU_KEDATANGAN';
    case MENUNGGU_KONFIRMASI = 'MENUNGGU_KONFIRMASI';
    case SUDAH_DITERIMA      = 'SUDAH_DITERIMA';
    case SIAP_BERANGKAT      = 'SIAP_BERANGKAT';
    case DALAM_PENGANTARAN   = 'DALAM_PENGANTARAN';
    case SELESAI             = 'SELESAI';
}
