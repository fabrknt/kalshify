// Signal Generator
// Orchestrates signal detection and saves to database

import { prisma } from '@/lib/db';
import { getKalshiClient } from '@/lib/kalshi/client';
import { IntelSignalData, SignalSeverity, SignalType, TIME_WINDOWS } from './types';
import { runDetection, detectTrendingMarkets, MarketWithSnapshot } from './smart-money-detector';
import {
  collectMarketSnapshots,
  getPreviousSnapshots,
  cleanupOldSnapshots,
  convertMarketsToSnapshot,
} from './snapshot-collector';
import { scanSocialIntel } from './twitter-scraper';

export interface ScanResult {
  newSignals: number;
  totalSignals: IntelSignalData[];
  snapshotsCollected: number;
  snapshotsCleaned: number;
  errors: string[];
}

export interface SocialScanResult {
  newSignals: number;
  totalSignals: IntelSignalData[];
  errors: string[];
}

async function saveSignals(signals: IntelSignalData[]): Promise<number> {
  if (signals.length === 0) return 0;

  // Check for recent duplicates (same ticker + type within 15 minutes)
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

  const existingSignals = await prisma.intelSignal.findMany({
    where: {
      createdAt: { gte: fifteenMinutesAgo },
    },
    select: {
      ticker: true,
      type: true,
      title: true,
    },
  });

  const existingKeys = new Set(
    existingSignals.map((s) => `${s.ticker || 'none'}-${s.type}-${s.title}`)
  );

  const newSignals = signals.filter((signal) => {
    const key = `${signal.ticker || 'none'}-${signal.type}-${signal.title}`;
    return !existingKeys.has(key);
  });

  if (newSignals.length === 0) return 0;

  const result = await prisma.intelSignal.createMany({
    data: newSignals.map((signal) => ({
      type: signal.type,
      severity: signal.severity,
      ticker: signal.ticker,
      marketTitle: signal.marketTitle,
      title: signal.title,
      description: signal.description,
      data: signal.data as object,
      sourceType: signal.sourceType,
      sourceHandle: signal.sourceHandle,
      sourceUrl: signal.sourceUrl,
    })),
  });

  return result.count;
}

export async function scanMarkets(): Promise<ScanResult> {
  const errors: string[] = [];
  let snapshotsCollected = 0;
  let snapshotsCleaned = 0;
  const allSignals: IntelSignalData[] = [];

  try {
    // Step 1: Fetch current markets from Kalshi (using events endpoint for real data)
    const client = getKalshiClient();
    const topMarkets = await client.getActiveMarketsFromEvents(100);

    // Convert to snapshot format
    const currentMarkets: MarketWithSnapshot[] = topMarkets.map((m) => ({
      ticker: m.ticker,
      title: m.title,
      yesBid: m.yes_bid,
      yesAsk: m.yes_ask,
      noBid: m.no_bid,
      noAsk: m.no_ask,
      lastPrice: m.last_price,
      volume24h: m.volume_24h,
      openInterest: m.open_interest,
    }));

    // Step 2: Get previous snapshots for comparison
    const { snapshots: previousSnapshots, actualMinutesAgo } = await getPreviousSnapshots(TIME_WINDOWS.VOLUME_COMPARISON);

    // Step 3: Run detection algorithms
    if (previousSnapshots.length > 0) {
      const detectionResult = runDetection(
        currentMarkets,
        previousSnapshots,
        actualMinutesAgo // Use actual time difference for accurate descriptions
      );
      allSignals.push(...detectionResult.signals);
    }

    // Step 3b: Also detect trending markets (works without historical data)
    const trendingSignals = detectTrendingMarkets(currentMarkets);
    allSignals.push(...trendingSignals);

    // Step 4: Collect new snapshots
    const snapshotResult = await collectMarketSnapshots(100);
    snapshotsCollected = snapshotResult.savedCount;

    // Step 5: Cleanup old snapshots
    snapshotsCleaned = await cleanupOldSnapshots(TIME_WINDOWS.SNAPSHOT_RETENTION);
  } catch (err) {
    errors.push(`Market scan error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }

  // Step 6: Save signals to database
  let newSignalsCount = 0;
  try {
    newSignalsCount = await saveSignals(allSignals);
  } catch (err) {
    errors.push(`Signal save error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }

  return {
    newSignals: newSignalsCount,
    totalSignals: allSignals,
    snapshotsCollected,
    snapshotsCleaned,
    errors,
  };
}

export async function scanSocial(): Promise<SocialScanResult> {
  const errors: string[] = [];
  let allSignals: IntelSignalData[] = [];

  try {
    // Scan for social intel (last 60 minutes of tweets)
    allSignals = await scanSocialIntel(60);
  } catch (err) {
    errors.push(`Social scan error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }

  // Save signals to database
  let newSignalsCount = 0;
  try {
    newSignalsCount = await saveSignals(allSignals);
  } catch (err) {
    errors.push(`Signal save error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }

  return {
    newSignals: newSignalsCount,
    totalSignals: allSignals,
    errors,
  };
}

export async function getRecentSignals(options: {
  type?: SignalType;
  severity?: SignalSeverity;
  limit?: number;
  offset?: number;
}) {
  const { type, severity, limit = 50, offset = 0 } = options;

  const where: Record<string, unknown> = {};
  if (type) where.type = type;
  if (severity) where.severity = severity;

  const [signals, total] = await Promise.all([
    prisma.intelSignal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.intelSignal.count({ where }),
  ]);

  return { signals, total };
}

export async function getSignalStats() {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [
    totalSignals,
    recentSignals,
    criticalCount,
    highCount,
    typeBreakdown,
  ] = await Promise.all([
    prisma.intelSignal.count(),
    prisma.intelSignal.count({
      where: { createdAt: { gte: twentyFourHoursAgo } },
    }),
    prisma.intelSignal.count({
      where: {
        severity: 'CRITICAL',
        createdAt: { gte: twentyFourHoursAgo },
      },
    }),
    prisma.intelSignal.count({
      where: {
        severity: 'HIGH',
        createdAt: { gte: twentyFourHoursAgo },
      },
    }),
    prisma.intelSignal.groupBy({
      by: ['type'],
      _count: true,
      where: { createdAt: { gte: twentyFourHoursAgo } },
    }),
  ]);

  return {
    totalSignals,
    recentSignals,
    criticalCount,
    highCount,
    typeBreakdown: typeBreakdown.map((t) => ({
      type: t.type,
      count: t._count,
    })),
  };
}

export async function markSignalAsRead(signalId: string) {
  return prisma.intelSignal.update({
    where: { id: signalId },
    data: { isRead: true },
  });
}

export async function getUnreadCount() {
  return prisma.intelSignal.count({
    where: { isRead: false },
  });
}
