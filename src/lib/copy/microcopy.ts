/**
 * Playful Microcopy Generator
 * Context-aware messages to add personality and energy to the app
 */

export type CopyCategory =
  | 'win'
  | 'bigWin'
  | 'loss'
  | 'streak'
  | 'streakEnd'
  | 'firstTrade'
  | 'firstWin'
  | 'milestone'
  | 'loading'
  | 'empty';

const copyDatabase: Record<CopyCategory, string[]> = {
  win: [
    'You called it! 🎯',
    'Big brain play!',
    'Crushed it!',
    'Money moves only 💰',
    'You absolute legend!',
    'The market bows to you',
    'That hit different',
    'Clean. 🧹',
    "Chef's kiss 👨‍🍳💋",
    'W',
    'Built different',
  ],
  bigWin: [
    'LETS GOOO!!! 🚀',
    'You just ate that up',
    'HUGE. Just huge.',
    'Main character energy',
    'The prophecy was true',
    'Are you from the future?',
    'Hall of fame play',
    'They doubted you. You showed them.',
    'This ones for the highlight reel',
    'ELITE',
  ],
  loss: [
    'Markets gonna market',
    'We go again',
    'Just a flesh wound',
    'Tuition paid',
    'Plot twist 📖',
    'Not today, but tomorrow',
    'The comeback starts now',
    'Every legend has setbacks',
    'Lesson: loaded',
    'Shake it off',
  ],
  streak: [
    "You're on fire! 🔥",
    'Unstoppable!',
    'Hot streak alert',
    "Can't miss right now",
    'The vibes are immaculate',
    'In the zone',
    'Pure momentum',
    "They can't stop you",
    'Different gravy',
    'Locked in 🔒',
  ],
  streakEnd: [
    'All good things...',
    'Streak reset, time to rebuild',
    'Fresh slate, fresh start',
    'Back to base camp',
    'A new chapter begins',
  ],
  firstTrade: [
    'First trade! Welcome to the game',
    "You're officially a trader now",
    'The journey of a thousand trades begins',
    'Baby trader no more',
    'Let the games begin',
  ],
  firstWin: [
    "First win! There's no stopping you now",
    'And so it begins...',
    'Taste of victory! Want more?',
    "First of many. Let's go!",
    'Winner winner! 🏆',
  ],
  milestone: [
    'Achievement unlocked! 🏆',
    'New badge earned!',
    'Level up! ⬆️',
    'Milestone reached!',
    'Look at you grow!',
  ],
  loading: [
    'Crunching numbers...',
    'Reading tea leaves...',
    'Consulting the oracle...',
    'Fetching your gains...',
    'Calculating alpha...',
    'Summoning the data spirits...',
    'Loading your empire...',
    'Counting contracts...',
    'Analyzing patterns...',
    'Building your portfolio view...',
  ],
  empty: [
    'No positions yet. Time to make moves!',
    'Your portfolio awaits its first trade',
    'Empty for now, but not for long',
    'The calm before the storm',
    'Ready when you are',
  ],
};

/**
 * Get a random message from a category
 */
export function getMicrocopy(category: CopyCategory): string {
  const messages = copyDatabase[category];
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Get win message based on P&L amount
 */
export function getWinMessage(pnlCents: number): string {
  // Big win threshold: $50+ profit
  if (pnlCents >= 5000) {
    return getMicrocopy('bigWin');
  }
  return getMicrocopy('win');
}

/**
 * Get streak message based on streak count
 */
export function getStreakMessage(streak: number): string {
  if (streak <= 0) {
    return getMicrocopy('streakEnd');
  }
  return getMicrocopy('streak');
}

/**
 * Get contextual message for trade result
 */
export function getTradeResultMessage(pnlCents: number, streak: number): string {
  if (pnlCents > 0) {
    // Check if streak just started or continues
    if (streak > 3) {
      return `${getMicrocopy('streak')} ${streak} in a row!`;
    }
    return getWinMessage(pnlCents);
  }
  return getMicrocopy('loss');
}

/**
 * Get loading message
 */
export function getLoadingMessage(): string {
  return getMicrocopy('loading');
}

/**
 * Get empty state message
 */
export function getEmptyMessage(): string {
  return getMicrocopy('empty');
}

/**
 * Format P&L with witty prefix
 */
export function formatPnlWithFlair(pnlCents: number): string {
  const dollars = (pnlCents / 100).toFixed(2);
  if (pnlCents > 0) {
    return `+$${dollars}`;
  } else if (pnlCents < 0) {
    return `-$${Math.abs(pnlCents / 100).toFixed(2)}`;
  }
  return '$0.00';
}

/**
 * Get celebration title based on context
 */
export function getCelebrationTitle(pnlCents: number, streak: number): string {
  if (pnlCents >= 10000) {
    return 'MASSIVE WIN!';
  }
  if (pnlCents >= 5000) {
    return 'BIG WIN!';
  }
  if (streak >= 5) {
    return `${streak} WINS IN A ROW!`;
  }
  if (streak >= 3) {
    return 'ON FIRE!';
  }
  return 'WINNER!';
}
