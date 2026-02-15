<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CryptoStatsController;
use App\Http\Controllers\InvoiceController;

Route::get('getCryptoStats', [CryptoStatsController::class, 'getCryptoStats']);

Route::get('invoices', [InvoiceController::class, 'create']);
Route::get('invoices/{clientRef}', [InvoiceController::class, 'show']);
Route::get('invoices/{clientRef}/check', [InvoiceController::class, 'check']);

Route::get('/', function () {
    return view('game');
});
