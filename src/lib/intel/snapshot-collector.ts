// Snapshot Collector
// Collects and stores market snapshots for anomaly detection

import { prisma } from '@/lib/db';
import { getKalshiClient } from '@/lib/kalshi/client';
import { KalshiMarket } from '@/lib/kalshi/types';
import { MarketSnapshotData, TIME_WINDOWS } from './types';

export async function collectMarketSnapshots(limit: number = 100): Promise<{
  snapshots: MarketSnapshotData[];
  savedCount: number;
}> {
  const client = getKalshiClient();

  // Fetch top markets by volume (using events endpoint for real data)
  const topMarkets = await client.getActiveMarketsFromEvents(limit);

  const snapshots: MarketSnapshotData[] = topMarkets.map((market) => ({
    ticker: market.ticker,
    yesBid: market.yes_bid,
    yesAsk: market.yes_ask,
    noBid: market.no_bid,
    noAsk: market.no_ask,
    lastPrice: market.last_price,
    volume24h: market.volume_24h,
    openInterest: market.open_interest,
    spread: market.yes_ask - market.yes_bid,
    probability: market.yes_ask,
  }));

  // Batch save to database
  const result = await prisma.marketSnapshot.createMany({
    data: snapshots.map((snap) => ({
      ticker: snap.ticker,
      yesBid: snap.yesBid,
      yesAsk: snap.yesAsk,
      noBid: snap.noBid,
      noAsk: snap.noAsk,
      lastPrice: snap.lastPrice,
      volume24h: snap.volume24h,
      openInterest: snap.openInterest,
      spread: snap.spread,
      probability: snap.probability,
    })),
  });

  return {
    snapshots,
    savedCount: result.count,
  };
}

export async function getPreviousSnapshots(
  minutesAgo: number = TIME_WINDOWS.VOLUME_COMPARISON
): Promise<{ snapshots: Array<{
  id: string;
  ticker: string;
  recordedAt: Date;
  yesBid: number;
  yesAsk: number;
  noBid: number;
  noAsk: number;
  lastPrice: number;
  volume24h: number;
  openInterest: number;
  spread: number;
  probability: number;
}>; actualMinutesAgo: number }> {
  const targetTime = new Date(Date.now() - minutesAgo * 60 * 1000);
  const windowStart = new Date(targetTime.getTime() - 5 * 60 * 1000); // 5 minute window
  const windowEnd = new Date(targetTime.getTime() + 5 * 60 * 1000);

  // First, try to get snapshots from the ideal time window
  let snapshots = await prisma.$queryRaw<
    Array<{
      id: string;
      ticker: string;
      recordedAt: Date;
      yesBid: number;
      yesAsk: number;
      noBid: number;
      noAsk: number;
      lastPrice: number;
      volume24h: number;
      openInterest: number;
      spread: number;
      probability: number;
    }>
  >`
    SELECT DISTINCT ON (ticker) *
    FROM "MarketSnapshot"
    WHERE "recordedAt" BETWEEN ${windowStart} AND ${windowEnd}
    ORDER BY ticker, "recordedAt" DESC
  `;

  // If no snapshots found, fall back to the most recent previous snapshots
  // (but not from the last 30 seconds to avoid comparing with just-collected data)
  if (snapshots.length === 0) {
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);

    snapshots = await prisma.$queryRaw<
      Array<{
        id: string;
        ticker: string;
        recordedAt: Date;
        yesBid: number;
        yesAsk: number;
        noBid: number;
        noAsk: number;
        lastPrice: number;
        volume24h: number;
        openInterest: number;
        spread: number;
        probability: number;
      }>
    >`
      SELECT DISTINCT ON (ticker) *
      FROM "MarketSnapshot"
      WHERE "recordedAt" < ${thirtySecondsAgo}
      ORDER BY ticker, "recordedAt" DESC
    `;
  }

  // Calculate actual time difference based on oldest snapshot
  let actualMinutesAgo = minutesAgo;
  if (snapshots.length > 0) {
    const oldestTime = Math.min(...snapshots.map(s => new Date(s.recordedAt).getTime()));
    actualMinutesAgo = Math.round((Date.now() - oldestTime) / (60 * 1000));
  }

  return { snapshots, actualMinutesAgo };
}

export async function getLatestSnapshots() {
  // Get the most recent snapshot for each ticker
  const snapshots = await prisma.$queryRaw<
    Array<{
      id: string;
      ticker: string;
      recordedAt: Date;
      yesBid: number;
      yesAsk: number;
      noBid: number;
      noAsk: number;
      lastPrice: number;
      volume24h: number;
      openInterest: number;
      spread: number;
      probability: number;
    }>
  >`
    SELECT DISTINCT ON (ticker) *
    FROM "MarketSnapshot"
    ORDER BY ticker, "recordedAt" DESC
  `;

  return snapshots;
}

export async function cleanupOldSnapshots(
  retentionMinutes: number = TIME_WINDOWS.SNAPSHOT_RETENTION
): Promise<number> {
  const cutoffTime = new Date(Date.now() - retentionMinutes * 60 * 1000);

  const result = await prisma.marketSnapshot.deleteMany({
    where: {
      recordedAt: {
        lt: cutoffTime,
      },
    },
  });

  return result.count;
}

export async function getSnapshotStats(): Promise<{
  totalSnapshots: number;
  uniqueTickers: number;
  oldestSnapshot: Date | null;
  newestSnapshot: Date | null;
}> {
  const [countResult, aggregateResult] = await Promise.all([
    prisma.marketSnapshot.count(),
    prisma.marketSnapshot.aggregate({
      _min: { recordedAt: true },
      _max: { recordedAt: true },
    }),
  ]);

  const uniqueTickers = await prisma.marketSnapshot.findMany({
    select: { ticker: true },
    distinct: ['ticker'],
  });

  return {
    totalSnapshots: countResult,
    uniqueTickers: uniqueTickers.length,
    oldestSnapshot: aggregateResult._min.recordedAt,
    newestSnapshot: aggregateResult._max.recordedAt,
  };
}

export function convertMarketsToSnapshot(
  markets: KalshiMarket[]
): Array<{ ticker: string; title: string } & MarketSnapshotData> {
  return markets.map((market) => ({
    ticker: market.ticker,
    title: market.title,
    yesBid: market.yes_bid,
    yesAsk: market.yes_ask,
    noBid: market.no_bid,
    noAsk: market.no_ask,
    lastPrice: market.last_price,
    volume24h: market.volume_24h,
    openInterest: market.open_interest,
    spread: market.yes_ask - market.yes_bid,
    probability: market.yes_ask,
  }));
}
