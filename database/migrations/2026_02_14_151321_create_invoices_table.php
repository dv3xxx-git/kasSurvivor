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
      Schema::create('invoices', function (Blueprint $table) {
          $table->id();

          $table->string('status')->default('pending');

          $table->string('receive_address');
          $table->double('amount_sompi');

          $table->string('product');
          $table->string('client_ref')->nullable();

          $table->string('txid')->nullable();
          $table->unsignedInteger('confirmations')->default(0);

          $table->timestamp('expires_at')->nullable();
          $table->timestamp('paid_at')->nullable();

          $table->timestamps();
      });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
