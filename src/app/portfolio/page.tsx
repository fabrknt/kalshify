'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Plus, Trophy, Target, Flame } from 'lucide-react';
import { PaperPortfolioDashboard } from '@/components/portfolio/paper-portfolio-dashboard';
import { PaperPositionData } from '@/components/portfolio/paper-position-card';
import { WinCelebration, WinCelebrationData } from '@/components/portfolio/win-celebration';
import { AchievementQueue } from '@/components/achievements/achievement-toast';
import { Achievement } from '@/lib/achievements/definitions';
import { getLoadingMessage } from '@/lib/copy/microcopy';

// LocalStorage key for unlocked achievements
const ACHIEVEMENTS_STORAGE_KEY = 'kalshify_unlocked_achievements';

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
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const [celebration, setCelebration] = useState<WinCelebrationData | null>(null);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);

  // Load unlocked achievements from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    if (stored) {
      try {
        setUnlockedAchievements(JSON.parse(stored));
      } catch {
        setUnlockedAchievements([]);
      }
    }
  }, []);

  // Rotate loading messages
  useEffect(() => {
    if (isLoading) {
      setLoadingMessage(getLoadingMessage());
      const interval = setInterval(() => {
        setLoadingMessage(getLoadingMessage());
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

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
        headers: {
          'x-unlocked-achievements': unlockedAchievements.join(','),
        },
      });

      if (response.ok) {
        const data = await response.json();

        // Update positions
        setPositions((prev) =>
          prev.map((p) => (p.id === positionId ? { ...p, ...data.position } : p))
        );

        // Refresh stats after closing a position
        fetchStats();

        // Show celebration for winning trades
        if (data.celebration) {
          setCelebration(data.celebration);
        }

        // Handle new achievements
        if (data.newAchievements && data.newAchievements.length > 0) {
          // Add to unlocked list and save to localStorage
          const newUnlockedIds = data.newAchievements.map((a: Achievement) => a.id);
          const updatedUnlocked = [...unlockedAchievements, ...newUnlockedIds];
          setUnlockedAchievements(updatedUnlocked);
          localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(updatedUnlocked));

          // Queue achievements for display (show after celebration closes)
          setTimeout(() => {
            setNewAchievements(data.newAchievements);
          }, data.celebration ? 2000 : 0);
        }
      }
    } catch (error) {
      console.error('Failed to close position:', error);
    }
  };

  const handleCloseCelebration = () => {
    setCelebration(null);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Navigation */}
      <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="hidden sm:block text-xl font-bold text-zinc-900 dark:text-white">
                Kalshify
              </span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/markets"
                className="text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                Markets
              </Link>
              <Link
                href="/portfolio"
                className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400"
              >
                Portfolio
              </Link>
              <Link
                href="/leaderboard"
                className="text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                <span className="hidden sm:inline">Leaderboard</span>
                <span className="sm:hidden">Ranks</span>
              </Link>
              <Link
                href="/for-you"
                className="text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                <span className="hidden sm:inline">AI Picks</span>
                <span className="sm:hidden">AI</span>
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
                  <motion.div
                    animate={stats.currentStreak >= 3 ? {
                      scale: [1, 1.2, 1],
                      rotate: [0, -5, 5, 0],
                    } : {}}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <Flame className={`w-3 h-3 ${stats.currentStreak >= 5 ? 'text-yellow-300' : stats.currentStreak >= 3 ? 'text-orange-300' : ''}`} />
                  </motion.div>
                  Current Streak
                </div>
                <motion.p
                  className="text-xl font-bold"
                  key={stats.currentStreak}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  {stats.currentStreak > 0 ? '+' : ''}{stats.currentStreak}
                  {stats.currentStreak >= 5 && ' 🔥'}
                </motion.p>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <motion.div
            className="flex flex-col items-center justify-center py-12 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <AnimatePresence mode="wait">
              <motion.p
                key={loadingMessage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-zinc-500 dark:text-zinc-400 text-sm"
              >
                {loadingMessage}
              </motion.p>
            </AnimatePresence>
          </motion.div>
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

      {/* Win Celebration Modal */}
      <WinCelebration
        data={celebration}
        onClose={handleCloseCelebration}
      />

      {/* Achievement Toasts */}
      {newAchievements.length > 0 && (
        <AchievementQueue
          achievements={newAchievements}
          onClear={() => setNewAchievements([])}
        />
      )}
    </div>
  );
}
