import { NextRequest, NextResponse } from 'next/server';
import {
  createSnapshot,
  getSnapshots,
  getPerformanceSummary,
  getTraderStats,
  getOrCreateTraderStats,
  recordTrade,
} from '@/lib/kalshi/performance-tracker';
import { resolveUserId } from '@/lib/auth/visitor';

// GET - Fetch performance snapshots and stats
export async function GET(request: NextRequest) {
  try {
    const userId = await resolveUserId();
    if (!userId) {
      return NextResponse.json({
        visitorId: null,
        snapshots: [],
        stats: null,
        rank: null,
        percentile: null,
      });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '30');
    const includeStats = searchParams.get('stats') !== 'false';

    const snapshotData = await getSnapshots(userId, limit);
    const summary = includeStats ? await getPerformanceSummary(userId) : null;

    return NextResponse.json({
      visitorId: summary?.stats?.visitorId || userId,
      snapshots: snapshotData,
      stats: summary?.stats || null,
      rank: summary?.rank || null,
      percentile: summary?.percentile || null,
    });
  } catch (error) {
    console.error('Failed to fetch snapshots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch snapshots' },
      { status: 500 }
    );
  }
}

// POST - Create a new performance snapshot
export async function POST(request: NextRequest) {
  try {
    const userId = await resolveUserId();
    if (!userId) {
      return NextResponse.json(
        { error: 'User identification required' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      portfolioValue,
      totalCost,
      unrealizedPnl,
      realizedPnl,
      openPositions,
      closedPositions,
      winCount,
      lossCount,
    } = body;

    // Validate required fields
    if (portfolioValue === undefined || totalCost === undefined) {
      return NextResponse.json(
        { error: 'portfolioValue and totalCost are required' },
        { status: 400 }
      );
    }

    const snapshot = await createSnapshot(userId, {
      portfolioValue: portfolioValue || 0,
      totalCost: totalCost || 0,
      unrealizedPnl: unrealizedPnl || 0,
      realizedPnl: realizedPnl || 0,
      openPositions: openPositions || 0,
      closedPositions: closedPositions || 0,
      winCount: winCount || 0,
      lossCount: lossCount || 0,
    });

    return NextResponse.json({ snapshot });
  } catch (error) {
    console.error('Failed to create snapshot:', error);
    return NextResponse.json(
      { error: 'Failed to create snapshot' },
      { status: 500 }
    );
  }
}

// PATCH - Record a trade or update stats
export async function PATCH(request: NextRequest) {
  try {
    const userId = await resolveUserId();
    if (!userId) {
      return NextResponse.json(
        { error: 'User identification required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, pnl } = body;

    switch (action) {
      case 'record_trade':
        if (pnl === undefined) {
          return NextResponse.json(
            { error: 'pnl is required for record_trade action' },
            { status: 400 }
          );
        }
        await recordTrade(userId, pnl);
        const stats = await getTraderStats(userId);
        return NextResponse.json({ success: true, stats });

      case 'get_or_create_stats':
        const traderStats = await getOrCreateTraderStats(userId);
        return NextResponse.json({ stats: traderStats });

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Failed to update stats:', error);
    return NextResponse.json(
      { error: 'Failed to update stats' },
      { status: 500 }
    );
  }
}
