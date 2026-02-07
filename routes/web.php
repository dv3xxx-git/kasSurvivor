<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CryptoStatsController;

Route::get('getCryptoStats', [CryptoStatsController::class, 'getCryptoStats']);

Route::get('/', function () {
    return view('game');
});
