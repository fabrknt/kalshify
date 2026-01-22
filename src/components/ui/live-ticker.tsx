'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cleanMarketTitle } from '@/lib/utils';

interface TickerMarket {
  ticker: string;
  title: string;
  probability: number;
  change: number;
}

export function LiveTicker() {
  const [markets, setMarkets] = useState<TickerMarket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const response = await fetch('/api/markets/trending?limit=10');
        if (response.ok) {
          const data = await response.json();
          setMarkets(data.markets || []);
        }
      } catch (error) {
        console.error('Failed to fetch ticker data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarkets();
    // Refresh every 30 seconds
    const interval = setInterval(fetchMarkets, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading || markets.length === 0) {
    return null;
  }

  // Duplicate markets for seamless loop
  const tickerItems = [...markets, ...markets];

  return (
    <div className="bg-zinc-900 border-b border-zinc-800 overflow-hidden">
      <div className="flex items-center">
        {/* Live indicator */}
        <div className="flex-shrink-0 px-3 py-1.5 bg-red-500/20 border-r border-zinc-800 flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-red-400 text-xs font-bold">LIVE</span>
        </div>

        {/* Scrolling ticker */}
        <div className="flex-1 overflow-hidden">
          <div className="flex animate-ticker">
            {tickerItems.map((market, index) => (
              <Link
                key={`${market.ticker}-${index}`}
                href={`/markets/${market.ticker}`}
                className="flex-shrink-0 flex items-center gap-3 px-4 py-1.5 hover:bg-zinc-800/50 transition-colors border-r border-zinc-800/50"
              >
                <span className="text-zinc-400 text-xs font-medium truncate max-w-[150px]">
                  {cleanMarketTitle(market.title)}
                </span>
                <span className="text-white text-xs font-bold data-probability">
                  {market.probability}%
                </span>
                {market.change !== 0 && (
                  <span
                    className={`flex items-center gap-0.5 text-xs font-medium ${
                      market.change > 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {market.change > 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {Math.abs(market.change).toFixed(1)}%
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
