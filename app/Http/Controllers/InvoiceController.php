<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function create()
    {
      //for mvp
      $addr = config('kaspa.receive_address');
      // add later...
    }
}
