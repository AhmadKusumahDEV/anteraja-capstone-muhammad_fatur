<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        if (!Schema::hasTable('packages')) {
            Schema::create('packages', function (Blueprint $table) {
            $table->string('tracking_id', 50)->primary();
            $table->string('current_hub_id', 50);
            $table->string('destination_area', 255)->nullable();
            $table->enum('service_type', ['SAME_DAY', 'NEXT_DAY', 'REGULAR']);
            $table->enum('status', ['IN_TRANSIT', 'IN_HUB', 'OUT_FOR_DELIVERY', 'DELIVERED']);
            $table->timestamp('hub_arrival_timestamp')->nullable();
            $table->timestamp('sla_deadline')->nullable();
            $table->boolean('is_priority')->default(false);
            
            $table->foreign('current_hub_id')->references('id')->on('hubs')->onDelete('restrict');
            
            $table->timestamps();
            
            $table->index(['status', 'current_hub_id']);
            $table->index(['is_priority', 'sla_deadline']);
        });
        }
    }

    public function down()
    {
        Schema::dropIfExists('packages');
    }
};
