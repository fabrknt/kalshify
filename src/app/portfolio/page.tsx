'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, Plus, Trophy, Target, Flame } from 'lucide-react';
import { PaperPortfolioDashboard } from '@/components/portfolio/paper-portfolio-dashboard';
import { PaperPositionData } from '@/components/portfolio/paper-position-card';

interface TraderStats {
  visitorId: string;
  displayName: string;
  totalTrades: number;
  winCount: number;
  lossCount: number;
  totalPnl: number;
  currentStreak: number;
  bestStreak: number;
}

export default function PortfolioPage() {
  const [positions, setPositions] = useState<PaperPositionData[]>([]);
  const [stats, setStats] = useState<TraderStats | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/portfolio/paper/snapshots?stats=true');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setRank(data.rank);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchPositions = async () => {
    try {
      const response = await fetch('/api/portfolio/paper/positions');
      if (response.ok) {
        const data = await response.json();
        setPositions(data.positions || []);
      }
    } catch (error) {
      console.error('Failed to fetch positions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
    fetchStats();
  }, []);

  const handleSimulatePrices = async () => {
    setIsSimulating(true);
    try {
      const response = await fetch('/api/portfolio/paper/positions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'simulate_all' }),
      });

      if (response.ok) {
        // Refetch positions with new simulated prices
        await fetchPositions();
      }
    } catch (error) {
      console.error('Failed to simulate prices:', error);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleClosePosition = async (positionId: string) => {
    try {
      const response = await fetch(`/api/portfolio/paper/positions?id=${positionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh positions
        const data = await response.json();
        setPositions((prev) =>
          prev.map((p) => (p.id === positionId ? { ...p, ...data.position } : p))
        );
        // Refresh stats after closing a position
        fetchStats();
      }
    } catch (error) {
      console.error('Failed to close position:', error);
    }
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
                className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                Markets
              </Link>
              <Link
                href="/portfolio"
                className="text-sm font-medium text-blue-600 dark:text-blue-400"
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
        {/* Trader Stats Card */}
        {stats && stats.totalTrades > 0 && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 mb-8 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-lg">{stats.displayName}</p>
                  {rank && (
                    <p className="text-blue-100 text-sm">Rank #{rank}</p>
                  )}
                </div>
              </div>
              <Link
                href="/leaderboard"
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
              >
                View Leaderboard
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-100 text-xs mb-1">
                  <Target className="w-3 h-3" />
                  Win Rate
                </div>
                <p className="text-xl font-bold">
                  {stats.totalTrades > 0
                    ? Math.round((stats.winCount / stats.totalTrades) * 100)
                    : 0}%
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-blue-100 text-xs mb-1">Total Trades</p>
                <p className="text-xl font-bold">{stats.totalTrades}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-blue-100 text-xs mb-1">W / L</p>
                <p className="text-xl font-bold">
                  <span className="text-green-300">{stats.winCount}</span>
                  {' / '}
                  <span className="text-red-300">{stats.lossCount}</span>
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-100 text-xs mb-1">
                  <Flame className="w-3 h-3" />
                  Current Streak
                </div>
                <p className="text-xl font-bold">
                  {stats.currentStreak > 0 ? '+' : ''}{stats.currentStreak}
                </p>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <PaperPortfolioDashboard
            positions={positions}
            onClosePosition={handleClosePosition}
            onAddPosition={() => {
              window.location.href = '/markets';
            }}
            onSimulatePrices={handleSimulatePrices}
            isSimulating={isSimulating}
          />
        )}
      </main>
    </div>
  );
}
