import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Fetch share data for a closed position
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const positionId = searchParams.get('id');

    if (!positionId) {
      return NextResponse.json(
        { error: 'Position ID required' },
        { status: 400 }
      );
    }

    const position = await prisma.paperPosition.findUnique({
      where: { id: positionId },
      include: {
        user: {
          include: {
            traderStats: true,
          },
        },
      },
    });

    if (!position) {
      return NextResponse.json(
        { error: 'Position not found' },
        { status: 404 }
      );
    }

    if (position.status !== 'closed') {
      return NextResponse.json(
        { error: 'Position is not closed yet' },
        { status: 400 }
      );
    }

    const pnlCents = position.realizedPnl || 0;
    const pnlPercent = position.entryPrice > 0
      ? ((position.exitPrice! - position.entryPrice) / position.entryPrice) * 100
      : 0;

    // Get user's rank
    const allStats = await prisma.traderStats.findMany({
      orderBy: { totalPnl: 'desc' },
    });

    const rank = allStats.findIndex(s => s.userId === position.userId) + 1;

    return NextResponse.json({
      share: {
        id: position.id,
        marketTitle: position.marketTitle,
        position: position.position,
        quantity: position.quantity,
        entryPrice: position.entryPrice,
        exitPrice: position.exitPrice,
        pnlCents,
        pnlPercent,
        displayName: position.user.traderStats?.displayName || position.user.displayName || 'Trader',
        rank: rank > 0 ? rank : null,
        streak: position.user.traderStats?.currentStreak || 0,
        closedAt: position.closedAt,
      },
    });
  } catch (error) {
    console.error('Failed to fetch share data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch share data' },
      { status: 500 }
    );
  }
}
