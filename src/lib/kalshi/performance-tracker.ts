/**
 * Performance Tracker for Paper Trading
 * Tracks historical performance of paper trading portfolios
 * with leaderboard support for gamification
 *
 * Uses Prisma for persistent storage
 */

import { prisma } from '@/lib/db';

export interface PerformanceSnapshot {
  id: string;
  visitorId: string;
  date: Date;
  portfolioValue: number;
  totalCost: number;
  unrealizedPnl: number;
  realizedPnl: number;
  openPositions: number;
  closedPositions: number;
  winCount: number;
  lossCount: number;
}

export interface TraderStats {
  visitorId: string;
  displayName: string;
  totalTrades: number;
  winCount: number;
  lossCount: number;
  totalPnl: number;
  bestTrade: number;
  worstTrade: number;
  currentStreak: number;
  bestStreak: number;
  joinedAt: Date;
  lastActiveAt: Date;
}

export interface LeaderboardEntry {
  rank: number;
  visitorId: string;
  displayName: string;
  totalPnl: number;
  winRate: number;
  totalTrades: number;
  streak: number;
  trend: 'up' | 'down' | 'stable';
}

// Generate display name from visitor ID
function generateDisplayName(visitorId: string): string {
  const adjectives = ['Swift', 'Bold', 'Wise', 'Lucky', 'Sharp', 'Keen', 'Quick', 'Smart'];
  const nouns = ['Trader', 'Prophet', 'Oracle', 'Analyst', 'Predictor', 'Sage', 'Maven', 'Guru'];

  const hash = visitorId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const adj = adjectives[hash % adjectives.length];
  const noun = nouns[(hash * 7) % nouns.length];
  const num = (hash % 999) + 1;

  return `${adj}${noun}${num}`;
}

/**
 * Create a performance snapshot for a user
 */
export async function createSnapshot(
  userId: string,
  portfolioData: {
    portfolioValue: number;
    totalCost: number;
    unrealizedPnl: number;
    realizedPnl: number;
    openPositions: number;
    closedPositions: number;
    winCount: number;
    lossCount: number;
  }
): Promise<PerformanceSnapshot> {
  const snapshot = await prisma.portfolioSnapshot.create({
    data: {
      userId,
      totalValue: portfolioData.portfolioValue,
      totalCost: portfolioData.totalCost,
      unrealizedPnl: portfolioData.unrealizedPnl,
      realizedPnl: portfolioData.realizedPnl,
      openPositions: portfolioData.openPositions,
      closedPositions: portfolioData.closedPositions,
      winCount: portfolioData.winCount,
      lossCount: portfolioData.lossCount,
    },
    include: {
      user: true,
    },
  });

  // Update trader stats
  await updateTraderStats(userId, portfolioData);

  return {
    id: snapshot.id,
    visitorId: snapshot.user.visitorId || snapshot.userId,
    date: snapshot.snapshotAt,
    portfolioValue: snapshot.totalValue,
    totalCost: snapshot.totalCost,
    unrealizedPnl: snapshot.unrealizedPnl,
    realizedPnl: snapshot.realizedPnl,
    openPositions: snapshot.openPositions,
    closedPositions: snapshot.closedPositions,
    winCount: snapshot.winCount,
    lossCount: snapshot.lossCount,
  };
}

/**
 * Update trader statistics
 */
async function updateTraderStats(
  userId: string,
  data: {
    realizedPnl: number;
    winCount: number;
    lossCount: number;
    openPositions: number;
    closedPositions: number;
  }
): Promise<void> {
  const existing = await prisma.traderStats.findUnique({
    where: { userId },
  });

  const now = new Date();
  const totalTrades = data.winCount + data.lossCount;

  if (existing) {
    const newWins = data.winCount - existing.winCount;
    const newLosses = data.lossCount - existing.lossCount;

    // Calculate streak
    let currentStreak = existing.currentStreak;
    if (newWins > 0 && newLosses === 0) {
      currentStreak = Math.max(0, currentStreak) + newWins;
    } else if (newLosses > 0 && newWins === 0) {
      currentStreak = Math.min(0, currentStreak) - newLosses;
    } else if (newWins > 0 && newLosses > 0) {
      currentStreak = newWins > newLosses ? newWins : -newLosses;
    }

    await prisma.traderStats.update({
      where: { userId },
      data: {
        totalTrades,
        winCount: data.winCount,
        lossCount: data.lossCount,
        totalPnl: data.realizedPnl,
        currentStreak,
        bestStreak: Math.max(existing.bestStreak, currentStreak),
        lastActiveAt: now,
      },
    });
  } else {
    // Get user's display name
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { displayName: true, visitorId: true },
    });

    const displayName = user?.displayName || generateDisplayName(user?.visitorId || userId);

    await prisma.traderStats.create({
      data: {
        userId,
        displayName,
        totalTrades,
        winCount: data.winCount,
        lossCount: data.lossCount,
        totalPnl: data.realizedPnl,
        bestTrade: 0,
        worstTrade: 0,
        currentStreak: data.winCount > 0 ? data.winCount : (data.lossCount > 0 ? -data.lossCount : 0),
        bestStreak: data.winCount,
        joinedAt: now,
        lastActiveAt: now,
      },
    });
  }
}

/**
 * Record a completed trade for stats tracking
 */
export async function recordTrade(
  userId: string,
  pnl: number
): Promise<void> {
  const stats = await prisma.traderStats.findUnique({
    where: { userId },
  });

  if (!stats) return;

  const isWin = pnl > 0;
  const newBestTrade = pnl > stats.bestTrade ? pnl : stats.bestTrade;
  const newWorstTrade = pnl < stats.worstTrade ? pnl : stats.worstTrade;

  let newStreak = stats.currentStreak;
  if (isWin) {
    newStreak = Math.max(0, newStreak) + 1;
  } else {
    newStreak = Math.min(0, newStreak) - 1;
  }

  await prisma.traderStats.update({
    where: { userId },
    data: {
      bestTrade: newBestTrade,
      worstTrade: newWorstTrade,
      currentStreak: newStreak,
      bestStreak: Math.max(stats.bestStreak, newStreak),
      winCount: isWin ? stats.winCount + 1 : stats.winCount,
      lossCount: isWin ? stats.lossCount : stats.lossCount + 1,
      totalTrades: stats.totalTrades + 1,
      totalPnl: stats.totalPnl + pnl,
      lastActiveAt: new Date(),
    },
  });
}

/**
 * Get snapshots for a user
 */
export async function getSnapshots(
  userId: string,
  limit: number = 30
): Promise<PerformanceSnapshot[]> {
  const snapshots = await prisma.portfolioSnapshot.findMany({
    where: { userId },
    orderBy: { snapshotAt: 'desc' },
    take: limit,
    include: { user: true },
  });

  return snapshots.reverse().map((s) => ({
    id: s.id,
    visitorId: s.user.visitorId || s.userId,
    date: s.snapshotAt,
    portfolioValue: s.totalValue,
    totalCost: s.totalCost,
    unrealizedPnl: s.unrealizedPnl,
    realizedPnl: s.realizedPnl,
    openPositions: s.openPositions,
    closedPositions: s.closedPositions,
    winCount: s.winCount,
    lossCount: s.lossCount,
  }));
}

/**
 * Get trader stats
 */
export async function getTraderStats(userId: string): Promise<TraderStats | null> {
  const stats = await prisma.traderStats.findUnique({
    where: { userId },
    include: { user: true },
  });

  if (!stats) return null;

  return {
    visitorId: stats.user.visitorId || stats.userId,
    displayName: stats.displayName,
    totalTrades: stats.totalTrades,
    winCount: stats.winCount,
    lossCount: stats.lossCount,
    totalPnl: stats.totalPnl,
    bestTrade: stats.bestTrade,
    worstTrade: stats.worstTrade,
    currentStreak: stats.currentStreak,
    bestStreak: stats.bestStreak,
    joinedAt: stats.joinedAt,
    lastActiveAt: stats.lastActiveAt,
  };
}

/**
 * Get or create trader stats
 */
export async function getOrCreateTraderStats(userId: string): Promise<TraderStats> {
  let stats = await prisma.traderStats.findUnique({
    where: { userId },
    include: { user: true },
  });

  if (!stats) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { displayName: true, visitorId: true },
    });

    const displayName = user?.displayName || generateDisplayName(user?.visitorId || userId);
    const now = new Date();

    stats = await prisma.traderStats.create({
      data: {
        userId,
        displayName,
        totalTrades: 0,
        winCount: 0,
        lossCount: 0,
        totalPnl: 0,
        bestTrade: 0,
        worstTrade: 0,
        currentStreak: 0,
        bestStreak: 0,
        joinedAt: now,
        lastActiveAt: now,
      },
      include: { user: true },
    });
  }

  return {
    visitorId: stats.user.visitorId || stats.userId,
    displayName: stats.displayName,
    totalTrades: stats.totalTrades,
    winCount: stats.winCount,
    lossCount: stats.lossCount,
    totalPnl: stats.totalPnl,
    bestTrade: stats.bestTrade,
    worstTrade: stats.worstTrade,
    currentStreak: stats.currentStreak,
    bestStreak: stats.bestStreak,
    joinedAt: stats.joinedAt,
    lastActiveAt: stats.lastActiveAt,
  };
}

/**
 * Get leaderboard sorted by specified metric
 */
export async function getLeaderboard(
  sortBy: 'pnl' | 'winRate' | 'trades' | 'streak' = 'pnl',
  limit: number = 50
): Promise<LeaderboardEntry[]> {
  // Build orderBy clause based on sortBy
  let orderBy: any = { totalPnl: 'desc' };
  if (sortBy === 'trades') {
    orderBy = { totalTrades: 'desc' };
  } else if (sortBy === 'streak') {
    orderBy = { bestStreak: 'desc' };
  }
  // For winRate, we'll sort in memory after fetching

  const allStats = await prisma.traderStats.findMany({
    orderBy,
    take: sortBy === 'winRate' ? 1000 : limit,
    include: { user: true },
  });

  let sorted = allStats;

  // Sort by win rate in memory if needed
  if (sortBy === 'winRate') {
    sorted = allStats.sort((a, b) => {
      const aWinRate = a.totalTrades > 0 ? a.winCount / a.totalTrades : 0;
      const bWinRate = b.totalTrades > 0 ? b.winCount / b.totalTrades : 0;
      return bWinRate - aWinRate;
    }).slice(0, limit);
  }

  return sorted.map((stats, index) => {
    const winRate = stats.totalTrades > 0
      ? (stats.winCount / stats.totalTrades) * 100
      : 0;

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (stats.currentStreak > 2) trend = 'up';
    else if (stats.currentStreak < -2) trend = 'down';

    return {
      rank: index + 1,
      visitorId: stats.user.visitorId || stats.userId,
      displayName: stats.displayName,
      totalPnl: stats.totalPnl,
      winRate: Math.round(winRate * 10) / 10,
      totalTrades: stats.totalTrades,
      streak: stats.currentStreak,
      trend,
    };
  });
}

/**
 * Seed demo leaderboard data
 */
export async function seedDemoLeaderboard(): Promise<void> {
  const demoTraders = [
    { pnl: 4523, wins: 28, losses: 12, streak: 5 },
    { pnl: 3891, wins: 35, losses: 20, streak: 3 },
    { pnl: 2156, wins: 19, losses: 11, streak: -2 },
    { pnl: 1832, wins: 42, losses: 38, streak: 1 },
    { pnl: 1245, wins: 15, losses: 9, streak: 4 },
    { pnl: 987, wins: 22, losses: 18, streak: -1 },
    { pnl: 654, wins: 31, losses: 29, streak: 2 },
    { pnl: 421, wins: 18, losses: 17, streak: 0 },
    { pnl: -156, wins: 12, losses: 15, streak: -3 },
    { pnl: -523, wins: 8, losses: 14, streak: -4 },
  ];

  const now = new Date();

  for (let i = 0; i < demoTraders.length; i++) {
    const trader = demoTraders[i];
    const visitorId = `demo_${i}_${Date.now()}`;
    const displayName = generateDisplayName(visitorId);
    const joinedAt = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);

    // Create demo user
    const user = await prisma.user.create({
      data: {
        visitorId,
        displayName,
        isDemo: true,
      },
    });

    // Create trader stats
    await prisma.traderStats.create({
      data: {
        userId: user.id,
        displayName,
        totalTrades: trader.wins + trader.losses,
        winCount: trader.wins,
        lossCount: trader.losses,
        totalPnl: trader.pnl,
        bestTrade: Math.abs(trader.pnl) * 0.3,
        worstTrade: -Math.abs(trader.pnl) * 0.1,
        currentStreak: trader.streak,
        bestStreak: Math.max(trader.streak, 5),
        joinedAt,
        lastActiveAt: now,
      },
    });
  }
}

/**
 * Check if demo data has already been seeded
 */
export async function isDemoSeeded(): Promise<boolean> {
  const count = await prisma.user.count({
    where: { isDemo: true },
  });
  return count > 0;
}

/**
 * Get performance summary for a user
 */
export async function getPerformanceSummary(userId: string): Promise<{
  stats: TraderStats | null;
  snapshots: PerformanceSnapshot[];
  rank: number | null;
  percentile: number | null;
}> {
  const stats = await getTraderStats(userId);
  const snapshots = await getSnapshots(userId, 30);

  let rank: number | null = null;
  let percentile: number | null = null;

  if (stats) {
    const leaderboard = await getLeaderboard('pnl', 1000);
    const entry = leaderboard.find(e => e.visitorId === (stats.visitorId));
    if (entry) {
      rank = entry.rank;
      percentile = Math.round((1 - (rank - 1) / leaderboard.length) * 100);
    }
  }

  return {
    stats,
    snapshots,
    rank,
    percentile,
  };
}
