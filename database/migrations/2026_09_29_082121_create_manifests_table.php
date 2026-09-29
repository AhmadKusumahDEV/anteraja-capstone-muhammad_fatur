<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('manifests', function (Blueprint $table) {
            $table->string('manifest_code', 50)->primary();
            $table->enum('type', ['INBOUND_FEEDER', 'OUTBOUND_DISPATCH']);
            $table->string('origin_hub_id', 50);
            $table->string('destination_hub_id', 50)->nullable();
            $table->string('vehicle_plate', 20)->nullable();
            $table->string('vehicle_type', 50)->nullable();
            $table->enum('status', [
                'MENUNGGU_KEDATANGAN', 
                'MENUNGGU_KONFIRMASI', 
                'SUDAH_DITERIMA', 
                'SIAP_BERANGKAT', 
                'DALAM_PENGANTARAN', 
                'SELESAI'
            ]);
            $table->timestamp('eta_timestamp')->nullable();
            $table->string('operator_id', 50)->nullable();
            
            $table->foreign('origin_hub_id')->references('id')->on('hubs')->onDelete('cascade');
            $table->foreign('destination_hub_id')->references('id')->on('hubs')->onDelete('set null');
            $table->foreign('operator_id')->references('id')->on('users')->onDelete('set null');
            
            $table->timestamps();
            
            $table->index(['status', 'destination_hub_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('manifests');
    }
};
