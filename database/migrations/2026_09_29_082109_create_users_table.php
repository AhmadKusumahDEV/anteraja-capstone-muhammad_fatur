<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->string('id', 50)->primary();
            $table->string('nik', 50)->unique();
            $table->string('name', 255);
            $table->enum('role', ['HUB_ADMIN', 'SUPER_ADMIN']);
            $table->string('hub_id', 50)->nullable();
            $table->foreign('hub_id')->references('id')->on('hubs')->onDelete('set null');
            $table->text('password_hash');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('users');
    }
};
