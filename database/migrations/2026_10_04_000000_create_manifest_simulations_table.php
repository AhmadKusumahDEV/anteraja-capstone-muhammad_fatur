<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('manifest_simulations', function (Blueprint $table) {
            $table->id();
            $table->string('manifest_code', 50); // FK to manifests
            $table->integer('eta_minutes')->default(5);
            $table->jsonb('route_waypoints')->nullable();
            $table->jsonb('current_location')->nullable();
            $table->enum('status', ['pending', 'traveling', 'completed'])->default('pending');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->foreign('manifest_code')->references('manifest_code')->on('manifests')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('manifest_simulations');
    }
};
