/**
 * Achievement System Definitions
 * Gamification badges and milestones for the trading experience
 */

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type AchievementCategory =
  | 'trade'
  | 'streak'
  | 'volume'
  | 'rank'
  | 'milestone'
  | 'special';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  category: AchievementCategory;
  requirement: AchievementRequirement;
  message: string; // Celebratory message when unlocked
}

export type AchievementRequirement =
  | { type: 'trades'; count: number }
  | { type: 'wins'; count: number }
  | { type: 'streak'; count: number }
  | { type: 'pnl'; amount: number } // in cents
  | { type: 'rank'; position: number }
  | { type: 'firstTrade' }
  | { type: 'firstWin' };

export interface UserAchievement {
  achievementId: string;
  unlockedAt: Date;
}

// All achievements in the system
export const ACHIEVEMENTS: Achievement[] = [
  // First milestones
  {
    id: 'first_trade',
    name: 'Welcome to the Game',
    description: 'Complete your first trade',
    icon: '🎮',
    rarity: 'common',
    category: 'milestone',
    requirement: { type: 'firstTrade' },
    message: "You've entered the arena!",
  },
  {
    id: 'first_win',
    name: 'Winner Winner',
    description: 'Win your first trade',
    icon: '🏆',
    rarity: 'common',
    category: 'milestone',
    requirement: { type: 'firstWin' },
    message: "First of many! Let's go!",
  },

  // Trade volume achievements
  {
    id: 'trades_10',
    name: 'Getting Started',
    description: 'Complete 10 trades',
    icon: '📈',
    rarity: 'common',
    category: 'volume',
    requirement: { type: 'trades', count: 10 },
    message: 'Double digits! Keep it up!',
  },
  {
    id: 'trades_50',
    name: 'Active Trader',
    description: 'Complete 50 trades',
    icon: '⚡',
    rarity: 'rare',
    category: 'volume',
    requirement: { type: 'trades', count: 50 },
    message: "You're getting serious!",
  },
  {
    id: 'trades_100',
    name: 'Centurion',
    description: 'Complete 100 trades',
    icon: '💯',
    rarity: 'epic',
    category: 'volume',
    requirement: { type: 'trades', count: 100 },
    message: 'A hundred trades strong!',
  },
  {
    id: 'trades_500',
    name: 'Trading Machine',
    description: 'Complete 500 trades',
    icon: '🤖',
    rarity: 'legendary',
    category: 'volume',
    requirement: { type: 'trades', count: 500 },
    message: 'Built different.',
  },

  // Streak achievements
  {
    id: 'streak_3',
    name: 'Hat Trick',
    description: 'Win 3 trades in a row',
    icon: '🎯',
    rarity: 'common',
    category: 'streak',
    requirement: { type: 'streak', count: 3 },
    message: 'Three in a row! Nice!',
  },
  {
    id: 'streak_5',
    name: 'High Five',
    description: 'Win 5 trades in a row',
    icon: '🖐️',
    rarity: 'rare',
    category: 'streak',
    requirement: { type: 'streak', count: 5 },
    message: "You're on fire!",
  },
  {
    id: 'streak_10',
    name: 'Perfect Ten',
    description: 'Win 10 trades in a row',
    icon: '🔥',
    rarity: 'epic',
    category: 'streak',
    requirement: { type: 'streak', count: 10 },
    message: 'Unstoppable!',
  },
  {
    id: 'streak_25',
    name: 'Legendary Streak',
    description: 'Win 25 trades in a row',
    icon: '👑',
    rarity: 'legendary',
    category: 'streak',
    requirement: { type: 'streak', count: 25 },
    message: 'Are you from the future?!',
  },

  // P&L achievements (in cents)
  {
    id: 'pnl_1000',
    name: 'Ten Bagger',
    description: 'Earn $10 in total profits',
    icon: '💵',
    rarity: 'common',
    category: 'trade',
    requirement: { type: 'pnl', amount: 1000 },
    message: 'First 10 bucks!',
  },
  {
    id: 'pnl_5000',
    name: 'Fifty Dollar Flex',
    description: 'Earn $50 in total profits',
    icon: '💰',
    rarity: 'rare',
    category: 'trade',
    requirement: { type: 'pnl', amount: 5000 },
    message: "Now we're cooking!",
  },
  {
    id: 'pnl_10000',
    name: 'Benjamin Hunter',
    description: 'Earn $100 in total profits',
    icon: '🤑',
    rarity: 'epic',
    category: 'trade',
    requirement: { type: 'pnl', amount: 10000 },
    message: 'Triple digits profits!',
  },
  {
    id: 'pnl_50000',
    name: 'Big Money',
    description: 'Earn $500 in total profits',
    icon: '💎',
    rarity: 'legendary',
    category: 'trade',
    requirement: { type: 'pnl', amount: 50000 },
    message: 'You absolute legend!',
  },

  // Rank achievements
  {
    id: 'rank_50',
    name: 'Top 50',
    description: 'Reach top 50 on the leaderboard',
    icon: '📊',
    rarity: 'rare',
    category: 'rank',
    requirement: { type: 'rank', position: 50 },
    message: 'Top 50! Keep climbing!',
  },
  {
    id: 'rank_10',
    name: 'Top 10',
    description: 'Reach top 10 on the leaderboard',
    icon: '🏅',
    rarity: 'epic',
    category: 'rank',
    requirement: { type: 'rank', position: 10 },
    message: 'Elite status achieved!',
  },
  {
    id: 'rank_1',
    name: 'Number One',
    description: 'Reach #1 on the leaderboard',
    icon: '👑',
    rarity: 'legendary',
    category: 'rank',
    requirement: { type: 'rank', position: 1 },
    message: 'THE BEST! Absolute king!',
  },
];

// Helper to get achievement by ID
export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

// Helper to get achievements by rarity
export function getAchievementsByRarity(rarity: AchievementRarity): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.rarity === rarity);
}

// Helper to get achievements by category
export function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.category === category);
}

// Get rarity colors for styling
export function getRarityColor(rarity: AchievementRarity): {
  bg: string;
  text: string;
  border: string;
  glow: string;
} {
  switch (rarity) {
    case 'legendary':
      return {
        bg: 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500',
        text: 'text-yellow-100',
        border: 'border-yellow-400',
        glow: 'shadow-lg shadow-yellow-500/50',
      };
    case 'epic':
      return {
        bg: 'bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-500',
        text: 'text-purple-100',
        border: 'border-purple-400',
        glow: 'shadow-lg shadow-purple-500/50',
      };
    case 'rare':
      return {
        bg: 'bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500',
        text: 'text-blue-100',
        border: 'border-blue-400',
        glow: 'shadow-lg shadow-blue-500/50',
      };
    case 'common':
    default:
      return {
        bg: 'bg-gradient-to-br from-zinc-500 to-zinc-700',
        text: 'text-zinc-100',
        border: 'border-zinc-400',
        glow: '',
      };
  }
}

// Check if an achievement is unlocked based on current stats
export interface TraderProgress {
  totalTrades: number;
  winCount: number;
  currentStreak: number;
  bestStreak: number;
  totalPnl: number;
  rank: number | null;
  hasFirstTrade: boolean;
  hasFirstWin: boolean;
}

export function checkAchievement(
  achievement: Achievement,
  progress: TraderProgress
): boolean {
  const req = achievement.requirement;

  switch (req.type) {
    case 'firstTrade':
      return progress.hasFirstTrade;
    case 'firstWin':
      return progress.hasFirstWin;
    case 'trades':
      return progress.totalTrades >= req.count;
    case 'wins':
      return progress.winCount >= req.count;
    case 'streak':
      return progress.bestStreak >= req.count;
    case 'pnl':
      return progress.totalPnl >= req.amount;
    case 'rank':
      return progress.rank !== null && progress.rank <= req.position;
    default:
      return false;
  }
}

// Get all unlocked achievements for a trader
export function getUnlockedAchievements(progress: TraderProgress): Achievement[] {
  return ACHIEVEMENTS.filter((achievement) =>
    checkAchievement(achievement, progress)
  );
}

// Get newly unlocked achievements (compare previous vs current)
export function getNewlyUnlockedAchievements(
  previouslyUnlocked: string[],
  progress: TraderProgress
): Achievement[] {
  return ACHIEVEMENTS.filter(
    (achievement) =>
      !previouslyUnlocked.includes(achievement.id) &&
      checkAchievement(achievement, progress)
  );
}
