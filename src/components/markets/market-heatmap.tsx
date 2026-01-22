'use client';

import { useMemo } from 'react';
import { ProcessedMarket } from '@/lib/kalshi/types';
import { cn, cleanMarketTitle } from '@/lib/utils';

interface MarketHeatmapProps {
  markets: ProcessedMarket[];
  onSelectMarket?: (market: ProcessedMarket) => void;
  colorBy?: 'change' | 'probability';
  className?: string;
}

export function MarketHeatmap({
  markets,
  onSelectMarket,
  colorBy = 'change',
  className,
}: MarketHeatmapProps) {
  // Group markets by category
  const categorizedMarkets = useMemo(() => {
    const grouped = new Map<string, ProcessedMarket[]>();

    markets.forEach((market) => {
      const category = market.category || 'Other';
      const existing = grouped.get(category) || [];
      grouped.set(category, [...existing, market]);
    });

    // Sort categories by total volume
    return Array.from(grouped.entries())
      .map(([category, mkts]) => ({
        category,
        markets: mkts.sort((a, b) => b.volume24h - a.volume24h),
        totalVolume: mkts.reduce((sum, m) => sum + m.volume24h, 0),
      }))
      .sort((a, b) => b.totalVolume - a.totalVolume);
  }, [markets]);

  // Get color based on value
  const getColor = (market: ProcessedMarket) => {
    if (colorBy === 'change') {
      const change = market.probabilityChange;
      if (change > 10) return 'bg-green-600 hover:bg-green-500';
      if (change > 5) return 'bg-green-500 hover:bg-green-400';
      if (change > 2) return 'bg-green-400/80 hover:bg-green-400';
      if (change > 0) return 'bg-green-400/50 hover:bg-green-400/70';
      if (change < -10) return 'bg-red-600 hover:bg-red-500';
      if (change < -5) return 'bg-red-500 hover:bg-red-400';
      if (change < -2) return 'bg-red-400/80 hover:bg-red-400';
      if (change < 0) return 'bg-red-400/50 hover:bg-red-400/70';
      return 'bg-zinc-400/50 hover:bg-zinc-400/70';
    } else {
      // Color by probability
      const prob = market.probability;
      if (prob >= 80) return 'bg-green-600 hover:bg-green-500';
      if (prob >= 60) return 'bg-green-400/80 hover:bg-green-400';
      if (prob >= 40) return 'bg-yellow-500/80 hover:bg-yellow-500';
      if (prob >= 20) return 'bg-orange-500/80 hover:bg-orange-500';
      return 'bg-red-500/80 hover:bg-red-500';
    }
  };

  // Get size based on volume
  const getSize = (volume: number, maxVolume: number) => {
    const ratio = maxVolume > 0 ? volume / maxVolume : 0;
    if (ratio > 0.5) return 'col-span-2 row-span-2';
    if (ratio > 0.25) return 'col-span-2';
    return '';
  };

  const maxVolume = useMemo(
    () => Math.max(...markets.map((m) => m.volume24h), 1),
    [markets]
  );

  return (
    <div className={cn('space-y-6', className)}>
      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {colorBy === 'change' ? 'Price Change' : 'Probability'}
          </span>
          <div className="flex items-center gap-1">
            <div className="w-6 h-4 rounded bg-red-600" />
            <div className="w-6 h-4 rounded bg-red-400/80" />
            <div className="w-6 h-4 rounded bg-zinc-400/50" />
            <div className="w-6 h-4 rounded bg-green-400/80" />
            <div className="w-6 h-4 rounded bg-green-600" />
          </div>
          <span className="text-xs text-zinc-400">
            {colorBy === 'change' ? 'Bearish to Bullish' : 'Low to High'}
          </span>
        </div>
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          Size = 24h Volume
        </div>
      </div>

      {/* Heatmap Grid by Category */}
      {categorizedMarkets.map(({ category, markets: categoryMarkets }) => (
        <div key={category}>
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
            {category}
            <span className="text-xs font-normal text-zinc-400">
              ({categoryMarkets.length} markets)
            </span>
          </h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1 auto-rows-fr">
            {categoryMarkets.slice(0, 20).map((market) => {
              const size = getSize(market.volume24h, maxVolume);
              return (
                <button
                  key={market.ticker}
                  onClick={() => onSelectMarket?.(market)}
                  className={cn(
                    'relative p-2 rounded-lg transition-all cursor-pointer text-white overflow-hidden group min-h-[60px]',
                    getColor(market),
                    size
                  )}
                  title={`${cleanMarketTitle(market.title)} - ${market.probability}% (${market.probabilityChange > 0 ? '+' : ''}${market.probabilityChange.toFixed(1)}%)`}
                >
                  {/* Content */}
                  <div className="flex flex-col h-full">
                    <div className="text-xs font-medium truncate opacity-90 data-ticker">
                      {market.ticker.length > 12
                        ? market.ticker.substring(0, 10) + '...'
                        : market.ticker}
                    </div>
                    <div className="mt-auto">
                      <div className="text-lg font-bold data-probability">
                        {market.probability.toFixed(0)}%
                      </div>
                      <div className="text-xs opacity-75 data-percent">
                        {market.probabilityChange > 0 ? '+' : ''}
                        {market.probabilityChange.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {/* Hover tooltip */}
                  <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                    <div className="text-center">
                      <div className="text-xs font-medium line-clamp-2 mb-1">
                        {cleanMarketTitle(market.title)}
                      </div>
                      <div className="text-xs opacity-75">
                        Vol: ${(market.volume24h / 100).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Empty state */}
      {categorizedMarkets.length === 0 && (
        <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
          No markets to display
        </div>
      )}
    </div>
  );
}
