<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        if (!Schema::hasTable('manifest_packages')) {
            Schema::create('manifest_packages', function (Blueprint $table) {
            $table->id();
            $table->string('manifest_code', 50);
            $table->string('tracking_id', 50);
            
            $table->foreign('manifest_code')->references('manifest_code')->on('manifests')->onDelete('cascade');
            $table->foreign('tracking_id')->references('tracking_id')->on('packages')->onDelete('cascade');
            
            $table->timestamps();
        });
        }
    }

    public function down()
    {
        Schema::dropIfExists('manifest_packages');
    }
};
