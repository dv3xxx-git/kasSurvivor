<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
  public const STATUS_PENDING = 'pending';
  public const STATUS_PAID = 'paid';
  public const STATUS_EXPIRED = 'expired';
  public const STATUS_FAILED = 'failed';

  protected $fillable = [
    'status',
    'receive_address',
    'amount_sompi',
    'product',
    'client_ref',
    'txid',
    'confirmations',
    'expires_at',
    'paid_at'
  ];

  protected $casts = [
    'amount_sompi' => 'integer',
    'confirmations' => 'integer',
    'expires_at' => 'datetime',
    'paid_at' => 'datetime',
  ];
}
