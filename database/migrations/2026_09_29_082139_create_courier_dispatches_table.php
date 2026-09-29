<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('courier_dispatches', function (Blueprint $table) {
            $table->string('dispatch_id', 50)->primary();
            $table->string('courier_id', 50);
            $table->string('manifest_code', 50);
            $table->integer('acceptance_timeout_minutes');
            $table->enum('status', ['PENDING_ACCEPT', 'ACCEPTED', 'TIMEOUT_FAILED']);
            $table->timestamp('dispatched_at')->nullable();
            
            $table->foreign('courier_id')->references('id')->on('couriers')->onDelete('cascade');
            $table->foreign('manifest_code')->references('manifest_code')->on('manifests')->onDelete('cascade');
            
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('courier_dispatches');
    }
};
