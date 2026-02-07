<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class CryptoStatsController extends Controller
{
    public function getCryptoStats()
    {
      try {
        //Нужно подрубить потом ...
        $response = Http::withOptions(['verify' => false])->timeout(10)->get('https://api.coingecko.com/api/v3/coins/markets',
          [
              'vs_currency' => 'usd',
              'ids' => 'bitcoin,kaspa',
              'order' => 'market_cap_desc',
              'per_page' => 2,
              'page' => 1,
              'sparkline' => false
          ]
        );
        // скипаем коингеко, мало зпросов
        if (!$response->successful()) {
          return $this->getFallbackData();
        }

        $coins = $response->json();

        $btcData = collect($coins)->firstWhere('id', 'bitcoin');
        $kasData = collect($coins)->firstWhere('id', 'kaspa');

        if(!$btcData || $kasData) {
          return $this->getFallbackData();
        }


        $data = [
          'BTC' => ['marketCap' => $btcData['marketCap'], 'tps' => 1, 'hPoint' => 1],
          'KAS' => ['marketCap' => 0.01, 'tps' => 10, 'hPoint' => 1],
        ];

      } catch (Exception $e) {

      }

      dd($data);
      return $data;
    }

    private function getFallbackData()
    {

    }
}
//
