'use client';

import { format } from 'date-fns';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PaperPositionData {
  id: string;
  marketId: string;
  marketTitle: string;
  eventTicker?: string;
  position: 'yes' | 'no';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  status: 'open' | 'closed';
  createdAt: Date;
  closedAt?: Date;
  realizedPnl?: number;
}

interface PaperPositionCardProps {
  position: PaperPositionData;
  onClose?: (positionId: string) => void;
  className?: string;
}

export function PaperPositionCard({
  position,
  onClose,
  className,
}: PaperPositionCardProps) {
  const unrealizedPnl = (position.currentPrice - position.entryPrice) * position.quantity;
  const unrealizedPnlPercent = ((position.currentPrice - position.entryPrice) / position.entryPrice) * 100;
  const isProfit = unrealizedPnl > 0;
  const isLoss = unrealizedPnl < 0;

  const currentValue = position.currentPrice * position.quantity;
  const costBasis = position.entryPrice * position.quantity;

  return (
    <div
      className={cn(
        'bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4',
        position.status === 'closed' && 'opacity-75',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-xs font-bold uppercase',
                position.position === 'yes'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              )}
            >
              {position.position}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {position.quantity} contracts
            </span>
          </div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white line-clamp-2">
            {position.marketTitle}
          </h3>
        </div>

        {position.status === 'open' && onClose && (
          <button
            onClick={() => onClose(position.id)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 rounded-lg transition-colors text-amber-700 dark:text-amber-400 text-xs font-medium"
          >
            <DollarSign className="w-3.5 h-3.5" />
            Sell
          </button>
        )}
      </div>

      {/* Price info */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5">Entry</div>
          <div className="text-sm font-medium text-zinc-900 dark:text-white">
            {position.entryPrice}¢
          </div>
        </div>
        <div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5">Current</div>
          <div className="text-sm font-medium text-zinc-900 dark:text-white">
            {position.currentPrice}¢
          </div>
        </div>
      </div>

      {/* P&L */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
        <div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5">
            {position.status === 'closed' ? 'Realized P&L' : 'Unrealized P&L'}
          </div>
          <div
            className={cn(
              'flex items-center gap-1.5 font-bold',
              isProfit && 'text-green-600 dark:text-green-400',
              isLoss && 'text-red-600 dark:text-red-400',
              !isProfit && !isLoss && 'text-zinc-600 dark:text-zinc-400'
            )}
          >
            {isProfit ? (
              <TrendingUp className="w-4 h-4" />
            ) : isLoss ? (
              <TrendingDown className="w-4 h-4" />
            ) : null}
            <span>
              {isProfit ? '+' : ''}${(unrealizedPnl / 100).toFixed(2)}
            </span>
            <span className="text-xs font-normal">
              ({isProfit ? '+' : ''}{unrealizedPnlPercent.toFixed(1)}%)
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5">Value</div>
          <div className="text-sm font-semibold text-zinc-900 dark:text-white">
            ${(currentValue / 100).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Date */}
      <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          {position.status === 'closed' ? (
            <>Closed {format(position.closedAt!, 'MMM d, h:mm a')}</>
          ) : (
            <>Opened {format(position.createdAt, 'MMM d, h:mm a')}</>
          )}
        </div>
      </div>
    </div>
  );
}

// Compact row version
export function PaperPositionRow({
  position,
  onClose,
}: PaperPositionCardProps) {
  const unrealizedPnl = (position.currentPrice - position.entryPrice) * position.quantity;
  const unrealizedPnlPercent = ((position.currentPrice - position.entryPrice) / position.entryPrice) * 100;
  const isProfit = unrealizedPnl > 0;
  const isLoss = unrealizedPnl < 0;

  return (
    <div className="flex items-center gap-4 p-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
      <span
        className={cn(
          'w-12 text-center px-2 py-1 rounded text-xs font-bold uppercase',
          position.position === 'yes'
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
        )}
      >
        {position.position}
      </span>

      <div className="flex-1 min-w-0">
        <div className="font-medium text-zinc-900 dark:text-white truncate">
          {position.marketTitle}
        </div>
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          {position.quantity} @ {position.entryPrice}¢
        </div>
      </div>

      <div className="text-right">
        <div
          className={cn(
            'font-bold',
            isProfit && 'text-green-600 dark:text-green-400',
            isLoss && 'text-red-600 dark:text-red-400',
            !isProfit && !isLoss && 'text-zinc-600'
          )}
        >
          {isProfit ? '+' : ''}${(unrealizedPnl / 100).toFixed(2)}
        </div>
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          {isProfit ? '+' : ''}{unrealizedPnlPercent.toFixed(1)}%
        </div>
      </div>

      {position.status === 'open' && onClose && (
        <button
          onClick={() => onClose(position.id)}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 rounded-lg transition-colors text-amber-700 dark:text-amber-400 text-xs font-medium"
        >
          <DollarSign className="w-3.5 h-3.5" />
          Sell
        </button>
      )}
    </div>
  );
}
