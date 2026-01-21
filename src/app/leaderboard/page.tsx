'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Trophy,
  Medal,
  Award,
  Flame,
  Target,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  rank: number;
  visitorId: string;
  displayName: string;
  totalPnl: number;
  winRate: number;
  totalTrades: number;
  streak: number;
  trend: 'up' | 'down' | 'stable';
}

type SortOption = 'pnl' | 'winRate' | 'trades' | 'streak';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [userPercentile, setUserPercentile] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('pnl');
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`/api/leaderboard?sortBy=${sortBy}&limit=50`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
        setUserRank(data.userRank || null);
        setUserPercentile(data.userPercentile || null);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [sortBy]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-zinc-500 font-mono">#{rank}</span>;
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ArrowUpRight className="w-4 h-4 text-green-500" />;
      case 'down':
        return <ArrowDownRight className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-zinc-400" />;
    }
  };

  const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
    { value: 'pnl', label: 'Total P&L', icon: <TrendingUp className="w-4 h-4" /> },
    { value: 'winRate', label: 'Win Rate', icon: <Target className="w-4 h-4" /> },
    { value: 'trades', label: 'Total Trades', icon: <BarChart2 className="w-4 h-4" /> },
    { value: 'streak', label: 'Best Streak', icon: <Flame className="w-4 h-4" /> },
  ];

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
                className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                Portfolio
              </Link>
              <Link
                href="/leaderboard"
                className="text-sm font-medium text-blue-600 dark:text-blue-400"
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-medium mb-4">
            <Trophy className="w-4 h-4" />
            Paper Trading Competition
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            Leaderboard
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            See how your paper trading performance compares to other traders worldwide
          </p>
        </div>

        {/* User Rank Card */}
        {userRank && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Your Rank</p>
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-bold">#{userRank.rank}</span>
                  {userPercentile !== null && (
                    <span className="text-blue-100 text-sm">
                      Top {100 - userPercentile}%
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-blue-100 text-sm mb-1">Total P&L</p>
                <p className={cn(
                  'text-2xl font-bold',
                  userRank.totalPnl >= 0 ? 'text-green-300' : 'text-red-300'
                )}>
                  {userRank.totalPnl >= 0 ? '+' : ''}${(userRank.totalPnl / 100).toFixed(2)}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/20">
              <div>
                <p className="text-blue-100 text-xs">Win Rate</p>
                <p className="font-semibold">{userRank.winRate}%</p>
              </div>
              <div>
                <p className="text-blue-100 text-xs">Trades</p>
                <p className="font-semibold">{userRank.totalTrades}</p>
              </div>
              <div>
                <p className="text-blue-100 text-xs">Streak</p>
                <p className="font-semibold flex items-center gap-1">
                  {userRank.streak > 0 ? '+' : ''}{userRank.streak}
                  {getTrendIcon(userRank.trend)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Sort Options */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSortBy(option.value)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                sortBy === option.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-blue-500'
              )}
            >
              {option.icon}
              {option.label}
            </button>
          ))}
        </div>

        {/* Leaderboard Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl">
            <Trophy className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
            <p className="text-zinc-500 dark:text-zinc-400 mb-2">
              No traders yet
            </p>
            <Link
              href="/markets"
              className="text-blue-500 hover:text-blue-600 font-medium"
            >
              Start paper trading to join the leaderboard
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              <div className="col-span-1">Rank</div>
              <div className="col-span-4">Trader</div>
              <div className="col-span-2 text-right">P&L</div>
              <div className="col-span-2 text-right">Win Rate</div>
              <div className="col-span-2 text-right">Trades</div>
              <div className="col-span-1 text-right">Trend</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {leaderboard.map((entry) => (
                <div
                  key={entry.visitorId}
                  className={cn(
                    'grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors',
                    entry.rank <= 3 && 'bg-gradient-to-r from-yellow-50/50 to-transparent dark:from-yellow-900/10'
                  )}
                >
                  <div className="col-span-1 flex items-center">
                    {getRankIcon(entry.rank)}
                  </div>
                  <div className="col-span-4">
                    <p className="font-medium text-zinc-900 dark:text-white">
                      {entry.displayName}
                    </p>
                    {entry.streak > 3 && (
                      <div className="flex items-center gap-1 text-xs text-orange-500 mt-0.5">
                        <Flame className="w-3 h-3" />
                        {entry.streak} win streak
                      </div>
                    )}
                  </div>
                  <div className={cn(
                    'col-span-2 text-right font-semibold',
                    entry.totalPnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  )}>
                    {entry.totalPnl >= 0 ? '+' : ''}${(entry.totalPnl / 100).toFixed(2)}
                  </div>
                  <div className="col-span-2 text-right text-zinc-600 dark:text-zinc-400">
                    {entry.winRate}%
                  </div>
                  <div className="col-span-2 text-right text-zinc-600 dark:text-zinc-400">
                    {entry.totalTrades}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    {getTrendIcon(entry.trend)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-8 py-8 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl">
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            Want to climb the leaderboard?
          </p>
          <Link
            href="/markets"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            Start Paper Trading
            <TrendingUp className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
