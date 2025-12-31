export interface ActivityMetrics {
  date: string;           // ISO date
  dau: number;            // Daily active users
  wau: number;            // Weekly active users
  mau: number;            // Monthly active users
  txCount: number;        // Transaction count
  volumeUsd: number;      // Volume in USD
  activityScore: number;  // 0-100 composite score
}

/**
 * Generate mock activity metrics for the last N days
 * Data includes realistic trends and variations
 */
export function generateMockMetrics(days: number = 30): ActivityMetrics[] {
  const metrics: ActivityMetrics[] = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Create realistic trends with some randomness
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Base values with growth trend (newer = higher)
    const growthFactor = 1 + (days - i) / days * 0.5; // 50% growth over period
    const weekendFactor = isWeekend ? 0.7 : 1.0; // Lower on weekends
    const randomFactor = 0.8 + Math.random() * 0.4; // ±20% variance

    const baseDau = 1200;
    const baseWau = 4500;
    const baseMau = 15000;
    const baseTxCount = 450;
    const baseVolume = 125000;

    const dau = Math.round(baseDau * growthFactor * weekendFactor * randomFactor);
    const wau = Math.round(baseWau * growthFactor * randomFactor);
    const mau = Math.round(baseMau * growthFactor * randomFactor);
    const txCount = Math.round(baseTxCount * growthFactor * weekendFactor * randomFactor);
    const volumeUsd = Math.round(baseVolume * growthFactor * weekendFactor * randomFactor);

    // Calculate activity score (0-100) based on formula from backend
    const dauScore = Math.min((dau / 1000) * 100, 40);
    const wauScore = Math.min((wau / 5000) * 100, 30);
    const mauScore = Math.min((mau / 20000) * 100, 20);
    const volumeScore = Math.min((volumeUsd / 100000) * 100, 10);
    const activityScore = Math.round(dauScore + wauScore + mauScore + volumeScore);

    metrics.push({
      date: date.toISOString().split('T')[0], // YYYY-MM-DD format
      dau,
      wau,
      mau,
      txCount,
      volumeUsd,
      activityScore,
    });
  }

  // Return in reverse chronological order (newest first)
  return metrics.reverse();
}

/**
 * Get mock metrics (30 days by default)
 */
export function getMockMetrics(days: number = 30): ActivityMetrics[] {
  return generateMockMetrics(days);
}

/**
 * Get today's metrics
 */
export function getTodayMetrics(): ActivityMetrics {
  const metrics = getMockMetrics(1);
  return metrics[0];
}

/**
 * Get last week's metrics (7 days)
 */
export function getLastWeekMetrics(): ActivityMetrics[] {
  return getMockMetrics(7);
}

/**
 * Calculate percentage change between two values
 */
export function calculateChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Get comparison metrics (today vs yesterday)
 */
export function getComparisonMetrics(): {
  today: ActivityMetrics;
  yesterday: ActivityMetrics;
  changes: {
    dau: number;
    wau: number;
    mau: number;
    activityScore: number;
  };
} {
  const metrics = getMockMetrics(2);
  const today = metrics[1];
  const yesterday = metrics[0];

  return {
    today,
    yesterday,
    changes: {
      dau: calculateChange(today.dau, yesterday.dau),
      wau: calculateChange(today.wau, yesterday.wau),
      mau: calculateChange(today.mau, yesterday.mau),
      activityScore: calculateChange(today.activityScore, yesterday.activityScore),
    },
  };
}
