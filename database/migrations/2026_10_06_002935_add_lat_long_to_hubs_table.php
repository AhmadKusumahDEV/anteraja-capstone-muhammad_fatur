<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('hubs', function (Blueprint $table) {
            if (!Schema::hasColumn('hubs', 'latitude')) {
                $table->decimal('latitude', 10, 7)->nullable()->after('location_tag');
            }
            if (!Schema::hasColumn('hubs', 'longitude')) {
                $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hubs', function (Blueprint $table) {
            if (Schema::hasColumn('hubs', 'latitude')) {
                $table->dropColumn('latitude');
            }
            if (Schema::hasColumn('hubs', 'longitude')) {
                $table->dropColumn('longitude');
            }
        });
    }
};
