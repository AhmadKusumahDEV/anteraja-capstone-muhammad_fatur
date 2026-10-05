<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        if (!Schema::hasTable('hubs')) {
            Schema::create('hubs', function (Blueprint $table) {
            $table->string('id', 50)->primary();
            $table->string('name', 255);
            $table->string('region_name', 100);
            $table->string('location_tag', 50);
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->integer('max_capacity');
            $table->string('timezone', 50);
            $table->timestamps();
        });
        }
    }

    public function down()
    {
        Schema::dropIfExists('hubs');
    }
};
