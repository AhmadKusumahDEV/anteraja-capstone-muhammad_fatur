<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        if (!Schema::hasTable('hub_notifications')) {
            Schema::create('hub_notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('hub_id', 50);
            $table->string('title', 100);
            $table->text('message');
            $table->enum('type', ['INFO', 'WARNING', 'CRITICAL', 'SUCCESS'])->default('INFO');
            $table->boolean('is_read')->default(false);
            
            $table->foreign('hub_id')->references('id')->on('hubs')->onDelete('cascade');
            
            $table->timestamps();
        });
        }
    }

    public function down()
    {
        Schema::dropIfExists('hub_notifications');
    }
};
