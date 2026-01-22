'use client';

import { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { ProcessedMarket } from '@/lib/kalshi/types';
import { cn, cleanMarketTitle } from '@/lib/utils';

interface TradeDialogProps {
  market: ProcessedMarket;
  isOpen: boolean;
  onClose: () => void;
  onTrade: (params: {
    position: 'yes' | 'no';
    quantity: number;
    price: number;
  }) => void;
}

export function TradeDialog({ market, isOpen, onClose, onTrade }: TradeDialogProps) {
  const [position, setPosition] = useState<'yes' | 'no'>('yes');
  const [quantity, setQuantity] = useState(10);

  const price = position === 'yes' ? market.yesAsk : market.noAsk;
  const totalCost = price * quantity;
  const maxProfit = (100 - price) * quantity;
  const maxLoss = price * quantity;

  const handleSubmit = () => {
    onTrade({ position, quantity, price });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md mx-4 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Paper Trade
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Market Info */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
            {market.category}
          </div>
          <div className="font-semibold text-zinc-900 dark:text-white">
            {cleanMarketTitle(market.title)}
          </div>
        </div>

        {/* Position Selection */}
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Position
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPosition('yes')}
                className={cn(
                  'px-4 py-3 rounded-xl font-semibold transition-all',
                  position === 'yes'
                    ? 'bg-green-500 text-white ring-2 ring-green-500 ring-offset-2 dark:ring-offset-zinc-900'
                    : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                )}
              >
                YES @ {market.yesAsk}¢
              </button>
              <button
                onClick={() => setPosition('no')}
                className={cn(
                  'px-4 py-3 rounded-xl font-semibold transition-all',
                  position === 'no'
                    ? 'bg-red-500 text-white ring-2 ring-red-500 ring-offset-2 dark:ring-offset-zinc-900'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                )}
              >
                NO @ {market.noAsk}¢
              </button>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Quantity (contracts)
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 10))}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                disabled={quantity <= 1}
              >
                <Minus className="w-5 h-5" />
              </button>
              <input
                type="number"
                min="1"
                max="1000"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(1000, parseInt(e.target.value) || 1)))}
                className="flex-1 text-center text-xl font-bold py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg"
              />
              <button
                onClick={() => setQuantity(Math.min(1000, quantity + 10))}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                disabled={quantity >= 1000}
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex justify-center gap-2 mt-2">
              {[10, 25, 50, 100].map((qty) => (
                <button
                  key={qty}
                  onClick={() => setQuantity(qty)}
                  className={cn(
                    'px-3 py-1 rounded text-sm font-medium transition-colors',
                    quantity === qty
                      ? 'bg-blue-500 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  )}
                >
                  {qty}
                </button>
              ))}
            </div>
          </div>

          {/* Cost/Profit Summary */}
          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500 dark:text-zinc-400">Total Cost</span>
              <span className="font-semibold text-zinc-900 dark:text-white">
                ${(totalCost / 100).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500 dark:text-zinc-400">Max Profit</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                +${(maxProfit / 100).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500 dark:text-zinc-400">Max Loss</span>
              <span className="font-semibold text-red-600 dark:text-red-400">
                -${(maxLoss / 100).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Note */}
          <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
            This is a paper trade for practice only. No real money is involved.
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={handleSubmit}
            className={cn(
              'w-full py-3 rounded-xl font-semibold text-white transition-colors',
              position === 'yes'
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-red-500 hover:bg-red-600'
            )}
          >
            Buy {position.toUpperCase()} - ${(totalCost / 100).toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
}
