'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { TrendingUp, Loader2 } from 'lucide-react';
import { MarketList } from '@/components/markets/market-list';
import { ProcessedMarket } from '@/lib/kalshi/types';

function MarketsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams?.get('category') || '';
  const initialQuery = searchParams?.get('q') || '';

  const [markets, setMarkets] = useState<ProcessedMarket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMarkets() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (initialCategory) params.set('category', initialCategory);
        if (initialQuery) params.set('q', initialQuery);
        params.set('limit', '100');

        const response = await fetch(`/api/kalshi/markets?${params}`);
        if (!response.ok) throw new Error('Failed to fetch markets');

        const data = await response.json();
        setMarkets(data.markets || []);
      } catch (err) {
        console.error('Failed to fetch markets:', err);
        setError('Failed to load markets. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchMarkets();
  }, [initialCategory, initialQuery]);

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-blue-500 hover:text-blue-600 font-medium"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <MarketList
      markets={markets}
      isLoading={isLoading}
      onSelectMarket={(market) => {
        window.location.href = `/markets/${market.ticker}`;
      }}
    />
  );
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  );
}

export default function MarketsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Navigation */}
      <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-zinc-900 dark:text-white">
                Kalshify
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/markets"
                className="text-sm font-medium text-blue-600 dark:text-blue-400"
              >
                Markets
              </Link>
              <Link
                href="/portfolio"
                className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                Portfolio
              </Link>
              <Link
                href="/leaderboard"
                className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                Leaderboard
              </Link>
              <Link
                href="/for-you"
                className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                AI Picks
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            Markets
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Browse prediction markets and find trading opportunities
          </p>
        </div>

        <Suspense fallback={<LoadingFallback />}>
          <MarketsContent />
        </Suspense>
      </main>
    </div>
  );
}
