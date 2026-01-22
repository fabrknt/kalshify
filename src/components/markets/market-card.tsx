'use client';

import { format } from 'date-fns';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { ProcessedMarket } from '@/lib/kalshi/types';
import { cn, cleanMarketTitle } from '@/lib/utils';

interface MarketCardProps {
  market: ProcessedMarket;
  onSelect?: (market: ProcessedMarket) => void;
  showDetails?: boolean;
  className?: string;
}

// Category icons/colors mapping
const categoryStyles: Record<string, { bg: string; emoji: string }> = {
  Politics: { bg: 'bg-blue-100 dark:bg-blue-900/40', emoji: '🏛️' },
  Economics: { bg: 'bg-green-100 dark:bg-green-900/40', emoji: '📈' },
  Sports: { bg: 'bg-orange-100 dark:bg-orange-900/40', emoji: '🏈' },
  Climate: { bg: 'bg-teal-100 dark:bg-teal-900/40', emoji: '🌍' },
  Entertainment: { bg: 'bg-purple-100 dark:bg-purple-900/40', emoji: '🎬' },
  Tech: { bg: 'bg-indigo-100 dark:bg-indigo-900/40', emoji: '💻' },
  Finance: { bg: 'bg-emerald-100 dark:bg-emerald-900/40', emoji: '💰' },
  Companies: { bg: 'bg-slate-100 dark:bg-slate-900/40', emoji: '🏢' },
  default: { bg: 'bg-zinc-100 dark:bg-zinc-800', emoji: '📊' },
};

function getCategoryStyle(category: string) {
  return categoryStyles[category] || categoryStyles.default;
}

export function MarketCard({
  market,
  onSelect,
  showDetails = true,
  className,
}: MarketCardProps) {
  const isProbabilityUp = market.probabilityChange > 0;
  const isProbabilityDown = market.probabilityChange < 0;
  const categoryStyle = getCategoryStyle(market.category);

  return (
    <div
      className={cn(
        'bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-600 transition-all cursor-pointer',
        className
      )}
      onClick={() => onSelect?.(market)}
    >
      {/* Header with icon and title */}
      <div className="flex items-start gap-3 mb-4">
        <div className={cn(
          'w-11 h-11 rounded-lg flex items-center justify-center text-2xl flex-shrink-0',
          categoryStyle.bg
        )}>
          {categoryStyle.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5">
            {market.category}
          </p>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white line-clamp-2 leading-snug">
            {cleanMarketTitle(market.title)}
          </h3>
        </div>
      </div>

      {/* Probability row */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl font-bold text-zinc-900 dark:text-white">
          {market.probability.toFixed(0)}%
        </span>
        {market.probabilityChange !== 0 && (
          <span
            className={cn(
              'flex items-center gap-0.5 text-sm font-medium',
              isProbabilityUp && 'text-green-600 dark:text-green-400',
              isProbabilityDown && 'text-red-500 dark:text-red-400'
            )}
          >
            {isProbabilityUp ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            {Math.abs(market.probabilityChange).toFixed(0)}
          </span>
        )}
      </div>

      {/* YES/NO Buttons - Kalshi style */}
      <div className="flex items-center gap-2">
        <button
          className="flex-1 py-2 px-3 rounded-lg bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold text-sm transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(market);
          }}
        >
          Yes {market.yesBid}¢
        </button>
        <button
          className="flex-1 py-2 px-3 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-semibold text-sm transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(market);
          }}
        >
          No {market.noBid}¢
        </button>
      </div>

      {/* Bottom stats */}
      {showDetails && (
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <span>${(market.volume24h / 100).toLocaleString()} vol</span>
          <span>{format(market.closeTime, 'MMM d')}</span>
        </div>
      )}
    </div>
  );
}

// Compact version for lists - Kalshi style horizontal row
export function MarketCardCompact({
  market,
  onSelect,
}: MarketCardProps) {
  const isProbabilityUp = market.probabilityChange > 0;
  const isProbabilityDown = market.probabilityChange < 0;
  const categoryStyle = getCategoryStyle(market.category);

  return (
    <div
      className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-600 transition-all cursor-pointer"
      onClick={() => onSelect?.(market)}
    >
      {/* Category icon */}
      <div className={cn(
        'w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0',
        categoryStyle.bg
      )}>
        {categoryStyle.emoji}
      </div>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-zinc-900 dark:text-white truncate text-sm">
          {cleanMarketTitle(market.title)}
        </div>
      </div>

      {/* Probability + Change */}
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-zinc-900 dark:text-white">
          {market.probability.toFixed(0)}%
        </span>
        {market.probabilityChange !== 0 && (
          <span
            className={cn(
              'flex items-center gap-0.5 text-xs font-medium',
              isProbabilityUp && 'text-green-600 dark:text-green-400',
              isProbabilityDown && 'text-red-500 dark:text-red-400'
            )}
          >
            {isProbabilityUp ? '↑' : '↓'}
            {Math.abs(market.probabilityChange).toFixed(0)}
          </span>
        )}
      </div>

      {/* YES/NO buttons */}
      <div className="flex items-center gap-1.5">
        <button
          className="px-3 py-1.5 rounded-md text-xs font-semibold bg-[#16a34a] hover:bg-[#15803d] text-white transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(market);
          }}
        >
          Yes {market.yesBid}¢
        </button>
        <button
          className="px-3 py-1.5 rounded-md text-xs font-semibold bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(market);
          }}
        >
          No {market.noBid}¢
        </button>
      </div>
    </div>
  );
}
