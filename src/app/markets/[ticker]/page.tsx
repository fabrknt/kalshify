'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, ArrowLeft, Loader2, Clock, BarChart3, Users, CheckCircle } from 'lucide-react';
import { ProcessedMarket } from '@/lib/kalshi/types';
import { ProbabilityChart } from '@/components/markets/probability-chart';
import { OrderbookDisplay } from '@/components/markets/orderbook-display';
import { TradeDialog } from '@/components/portfolio/trade-dialog';
import { cn } from '@/lib/utils';

interface MarketDetailPageProps {
  params: Promise<{ ticker: string }>;
}

export default function MarketDetailPage({ params }: MarketDetailPageProps) {
  const [ticker, setTicker] = useState<string | null>(null);
  const [market, setMarket] = useState<ProcessedMarket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTradeDialog, setShowTradeDialog] = useState(false);
  const [initialPosition, setInitialPosition] = useState<'yes' | 'no'>('yes');
  const [tradeSuccess, setTradeSuccess] = useState(false);

  useEffect(() => {
    params.then((p) => setTicker(p.ticker));
  }, [params]);

  useEffect(() => {
    if (!ticker) return;

    async function fetchMarket() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/kalshi/markets/${ticker}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Market not found');
          }
          throw new Error('Failed to fetch market');
        }
        const data = await response.json();
        setMarket(data.market);
      } catch (err) {
        console.error('Failed to fetch market:', err);
        setError(err instanceof Error ? err.message : 'Failed to load market');
      } finally {
        setIsLoading(false);
      }
    }

    fetchMarket();
  }, [ticker]);

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleOpenTrade = (position: 'yes' | 'no') => {
    setInitialPosition(position);
    setShowTradeDialog(true);
  };

  const handleTrade = async (tradeParams: { position: 'yes' | 'no'; quantity: number; price: number }) => {
    if (!market) return;

    try {
      const response = await fetch('/api/portfolio/paper/positions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          marketId: market.ticker,
          marketTitle: market.title,
          eventTicker: market.eventTicker,
          position: tradeParams.position,
          quantity: tradeParams.quantity,
          price: tradeParams.price,
        }),
      });

      if (!response.ok) throw new Error('Failed to create position');

      setTradeSuccess(true);
      setTimeout(() => setTradeSuccess(false), 3000);
    } catch (err) {
      console.error('Trade failed:', err);
      alert('Failed to create paper position. Please try again.');
    }
  };

  const getTimeRemaining = (closeTime: string | Date) => {
    const now = new Date();
    const close = new Date(closeTime);
    const diff = close.getTime() - now.getTime();

    if (diff <= 0) return 'Closed';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h remaining`;
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${minutes}m remaining`;
  };

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
                For You
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          href="/markets"
          className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Markets
        </Link>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="text-center py-24">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Link
              href="/markets"
              className="text-blue-500 hover:text-blue-600 font-medium"
            >
              Back to Markets
            </Link>
          </div>
        ) : market ? (
          <>
          {/* Trade Dialog */}
          <TradeDialog
            market={market}
            isOpen={showTradeDialog}
            onClose={() => setShowTradeDialog(false)}
            onTrade={handleTrade}
          />
          <div className="space-y-8">
            {/* Market Header */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                      {market.category}
                    </span>
                    <span
                      className={cn(
                        'px-2 py-1 text-xs font-medium rounded-full',
                        market.status === 'open'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                      )}
                    >
                      {market.status.charAt(0).toUpperCase() + market.status.slice(1)}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                    {market.title}
                  </h1>
                  {market.subtitle && (
                    <p className="text-zinc-600 dark:text-zinc-400">
                      {market.subtitle}
                    </p>
                  )}
                  <p className="text-sm text-zinc-500 mt-2">
                    Ticker: {market.ticker}
                  </p>
                </div>

                {/* Probability Display */}
                <div className="text-center lg:text-right">
                  <div className="text-5xl font-bold text-zinc-900 dark:text-white">
                    {market.probability}%
                  </div>
                  <div
                    className={cn(
                      'text-sm font-medium',
                      market.probabilityChange > 0
                        ? 'text-green-600'
                        : market.probabilityChange < 0
                        ? 'text-red-600'
                        : 'text-zinc-500'
                    )}
                  >
                    {market.probabilityChange > 0 ? '+' : ''}
                    {market.probabilityChange.toFixed(1)}% change
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Closes</span>
                </div>
                <div className="text-lg font-semibold text-zinc-900 dark:text-white">
                  {getTimeRemaining(market.closeTime)}
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  {formatDate(market.closeTime)}
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-1">
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-sm">24h Volume</span>
                </div>
                <div className="text-lg font-semibold text-zinc-900 dark:text-white">
                  ${market.volume24h.toLocaleString()}
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">Open Interest</span>
                </div>
                <div className="text-lg font-semibold text-zinc-900 dark:text-white">
                  {market.openInterest.toLocaleString()}
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">Spread</span>
                </div>
                <div className="text-lg font-semibold text-zinc-900 dark:text-white">
                  {market.spread}¢
                </div>
              </div>
            </div>

            {/* Trading Panel */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Yes/No Prices */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                  Current Prices
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                    <div className="text-sm text-green-700 dark:text-green-400 mb-1">
                      YES
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-green-700 dark:text-green-400">
                        {market.yesAsk}¢
                      </span>
                      <span className="text-sm text-green-600/70 dark:text-green-400/70">
                        ask
                      </span>
                    </div>
                    <div className="text-sm text-green-600/70 dark:text-green-400/70 mt-1">
                      Bid: {market.yesBid}¢
                    </div>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                    <div className="text-sm text-red-700 dark:text-red-400 mb-1">
                      NO
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-red-700 dark:text-red-400">
                        {market.noAsk}¢
                      </span>
                      <span className="text-sm text-red-600/70 dark:text-red-400/70">
                        ask
                      </span>
                    </div>
                    <div className="text-sm text-red-600/70 dark:text-red-400/70 mt-1">
                      Bid: {market.noBid}¢
                    </div>
                  </div>
                </div>

                {/* Paper Trade Buttons */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <button
                    onClick={() => handleOpenTrade('yes')}
                    className="py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors"
                  >
                    Buy YES
                  </button>
                  <button
                    onClick={() => handleOpenTrade('no')}
                    className="py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors"
                  >
                    Buy NO
                  </button>
                </div>
                <p className="text-xs text-center text-zinc-500 mt-3">
                  Paper trading - no real money involved
                </p>

                {/* Success Message */}
                {tradeSuccess && (
                  <div className="flex items-center justify-center gap-2 mt-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-700 dark:text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Position created! View in Portfolio</span>
                  </div>
                )}
              </div>

              {/* Orderbook Preview */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                  Order Book
                </h2>
                <OrderbookDisplay
                  orderbook={{
                    ticker: market.ticker,
                    yes_bids: [{ price: market.yesBid, count: 100 }],
                    yes_asks: [{ price: market.yesAsk, count: 100 }],
                    no_bids: [{ price: market.noBid, count: 100 }],
                    no_asks: [{ price: market.noAsk, count: 100 }],
                  }}
                />
              </div>
            </div>

            {/* Price History Chart */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                Probability History
              </h2>
              <ProbabilityChart
                data={[
                  { timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), open: market.probability - 6, high: market.probability - 3, low: market.probability - 7, close: market.probability - 5, volume: 1200 },
                  { timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), open: market.probability - 5, high: market.probability - 1, low: market.probability - 5, close: market.probability - 3, volume: 1500 },
                  { timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), open: market.probability - 3, high: market.probability - 1, low: market.probability - 4, close: market.probability - 2, volume: 1800 },
                  { timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), open: market.probability - 2, high: market.probability + 3, low: market.probability - 2, close: market.probability + 2, volume: 2200 },
                  { timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), open: market.probability + 2, high: market.probability + 2, low: market.probability - 2, close: market.probability - 1, volume: 1900 },
                  { timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), open: market.probability - 1, high: market.probability + 2, low: market.probability - 1, close: market.probability + 1, volume: 1600 },
                  { timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), open: market.probability + 1, high: market.probability + 1, low: market.probability - 3, close: market.probability - 2, volume: 2100 },
                  { timestamp: new Date(), open: market.probability - 2, high: market.probability + 1, low: market.probability - 2, close: market.probability, volume: 2500 },
                ]}
                height={300}
              />
            </div>
          </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
