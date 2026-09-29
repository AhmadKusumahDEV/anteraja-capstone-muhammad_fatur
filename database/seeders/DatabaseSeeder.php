<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $this->call([
            HubSeeder::class,
            UserSeeder::class,
            CourierSeeder::class,
            PackageSeeder::class,
        ]);
    }
}
