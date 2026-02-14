<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class CryptoStatsController extends Controller
{
    public function getCryptoStats()
    {
      // пока отрубаем не мучать сеть
      return $this->getFallbackData();
      try {
        //Нужно подрубить потом ...
        // нужно сделать параметром и передавать в роуте!!!
        $responseBtc = Http::withHeader('X-API-Key', env('API_NINJAS_SECRET_KEY'))->withOptions(['verify' => false])->timeout(2)->get('https://api.api-ninjas.com/v1/marketcap',
          [
              'ticker' => 'BTC',
          ]
        );
        $responseBtcPrice = Http::withHeader('X-API-Key', env('API_NINJAS_SECRET_KEY'))->withOptions(['verify' => false])->timeout(2)->get('https://api.api-ninjas.com/v1/bitcoin');

        $responseKas = Http::withOptions(['verify' => false])->timeout(2)->get('https://api.kaspa.org/info/marketcap');
        $responseKasPrice = Http::withOptions(['verify' => false])->timeout(2)->get('https://api.kaspa.org/info/price');

        // скипаем коингеко, мало зпросов
        if (!$responseKas->successful() || !$responseBtc->successful() || !$responseKasPrice->successful() || !$responseBtcPrice->successful()) {
          return $this->getFallbackData();
        }

        $dataBtc = $responseBtc->json();
        $dataKas = $responseKas->json();
        $dataKasPrice = $responseKasPrice->json();
        $dataBtcPrice = $responseBtcPrice->json();

        $btcMarketCap = is_array($dataBtc) && isset($dataBtc['market_cap'])
          ? $dataBtc['market_cap']
               : null;

        $kasMarketCap = isset($dataKas['marketcap'])
          ? $dataKas['marketcap']
          : null;

        $kasPrice = isset($dataKasPrice['price'])
          ? $dataKasPrice['price']
          : null;

        $btcPrice = isset($dataBtcPrice['price'])
            ? $dataBtcPrice['price']
            : null;

        if(!$btcMarketCap || !$kasMarketCap || !$kasPrice || !$btcPrice) {
          return $this->getFallbackData();
        }

        $kasHPoint = round($kasMarketCap / 100000000);

        $btcHPoint = round($btcMarketCap / 100000000);

        $kasDamage = max(1,round($kasPrice / 10000));

        $btcDamage = round($btcPrice / 10000);

        $res = [
          'BTC' => ['marketCap' => $btcMarketCap, 'hPoint' => $btcHPoint, 'damage' => $btcDamage, 'price' => $btcPrice],
          'KAS' => ['marketCap' => $kasMarketCap, 'hPoint' => $kasHPoint, 'damage' => $kasDamage, 'price' => $kasPrice],
        ];

        return response()->json($res);

      } catch (Exception $e) {
        Log::error('CryptoStatsError:' . $e->getMessage());
        return $this->getFallbackData();
      }

    }

    private function getFallbackData()
    {
      return [
        'BTC' => ['marketCap' => 13743853192350, 'hPoint' => 39, 'damage' => 10, 'price' => 68859],
        'KAS' => ['marketCap' => 862943551, 'hPoint' => 9, 'damage' => 1, 'price' => 0.0323],
        'ETH' => ['marketCap' => 24755660111, 'hPoint' => 50, 'damage' => 5, 'price' => 2000],
      ];
    }
}
//
