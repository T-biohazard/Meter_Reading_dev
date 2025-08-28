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
        // Drop the existing 'users' table if it exists.
        // This is useful if you are re-running migrations from scratch.
        Schema::dropIfExists('users');

        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // This will be the unique username, all lowercase with no spaces.
            $table->string('first_name')->nullable(); // Added new field
            $table->string('last_name')->nullable(); // Added new field
            $table->string('email')->unique();
            $table->string('mobile')->unique();
            $table->unsignedBigInteger('primary_role_id')->nullable();
            $table->unsignedBigInteger('team_id');
            $table->unsignedBigInteger('dept_id')->nullable();
            $table->string('password');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
