<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Jadwalkan Robot SLA Scanner untuk berjalan setiap 1 menit
\Illuminate\Support\Facades\Schedule::command('sla:scan-breach')->everyMinute();
