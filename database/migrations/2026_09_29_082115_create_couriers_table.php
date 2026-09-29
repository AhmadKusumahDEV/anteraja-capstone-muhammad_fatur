<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('couriers', function (Blueprint $table) {
            $table->string('id', 50)->primary();
            $table->string('name', 255);
            $table->enum('fleet_type', ['MOTORCYCLE', 'VAN']);
            $table->enum('status', ['STANDBY', 'ON_DUTY', 'OFFLINE']);
            $table->string('current_hub_id', 50)->nullable();
            $table->foreign('current_hub_id')->references('id')->on('hubs')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('couriers');
    }
};
