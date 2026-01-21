import { NextRequest, NextResponse } from 'next/server';
import { getKalshiClient } from '@/lib/kalshi/client';
import { recordTrade, createSnapshot, getOrCreateTraderStats } from '@/lib/kalshi/performance-tracker';
import { resolveUserId } from '@/lib/auth/visitor';
import { prisma } from '@/lib/db';

// Simulation mode flag (stored in memory, resets on server restart)
let simulationMode = true;

// Simulate random price movement
function simulatePriceMovement(entryPrice: number): number {
  const change = Math.floor(Math.random() * 21) - 10;
  const newPrice = entryPrice + change;
  return Math.max(1, Math.min(99, newPrice));
}

// GET - Fetch user's paper positions
export async function GET(request: NextRequest) {
  try {
    const userId = await resolveUserId();
    if (!userId) {
      return NextResponse.json({ positions: [], simulationMode });
    }

    const { searchParams } = new URL(request.url);
    const simulate = searchParams.get('simulate') === 'true';

    const positions = await prisma.paperPosition.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Update current prices
    const client = getKalshiClient();
    const updatedPositions = await Promise.all(
      positions.map(async (pos) => {
        if (pos.status === 'closed') {
          return pos;
        }

        // If simulation mode, use simulated prices
        if (simulationMode || simulate) {
          if (!pos.simulatedPrice) {
            const newSimulatedPrice = simulatePriceMovement(pos.entryPrice);
            await prisma.paperPosition.update({
              where: { id: pos.id },
              data: { simulatedPrice: newSimulatedPrice },
            });
            return { ...pos, simulatedPrice: newSimulatedPrice, currentPrice: newSimulatedPrice };
          }
          return { ...pos, currentPrice: pos.simulatedPrice };
        }

        // Otherwise try to fetch from Kalshi
        try {
          const market = await client.getMarket(pos.marketId);
          const currentPrice = pos.position === 'yes' ? market.yes_bid : market.no_bid;
          return { ...pos, currentPrice: currentPrice || pos.entryPrice };
        } catch {
          return { ...pos, currentPrice: pos.entryPrice };
        }
      })
    );

    return NextResponse.json({
      positions: updatedPositions,
      simulationMode
    });
  } catch (error) {
    console.error('Failed to fetch positions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch positions' },
      { status: 500 }
    );
  }
}

// POST - Create a new paper position
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
    const { marketId, marketTitle, eventTicker, position, quantity, price } = body;

    if (!marketId || !position || !quantity || price === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const paperPosition = await prisma.paperPosition.create({
      data: {
        userId,
        marketId,
        marketTitle: marketTitle || marketId,
        eventTicker: eventTicker || null,
        position,
        quantity,
        entryPrice: price,
        currentPrice: price,
        status: 'open',
      },
    });

    return NextResponse.json({ position: paperPosition });
  } catch (error) {
    console.error('Failed to create position:', error);
    return NextResponse.json(
      { error: 'Failed to create position' },
      { status: 500 }
    );
  }
}

// PATCH - Simulate price changes or update settings
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
    const { action, positionId, newPrice } = body;

    switch (action) {
      case 'simulate_all':
        // Simulate new prices for all open positions
        const openPositions = await prisma.paperPosition.findMany({
          where: { userId, status: 'open' },
        });

        for (const pos of openPositions) {
          const newSimulatedPrice = simulatePriceMovement(pos.entryPrice);
          await prisma.paperPosition.update({
            where: { id: pos.id },
            data: { simulatedPrice: newSimulatedPrice },
          });
        }

        return NextResponse.json({ success: true, message: 'Prices simulated' });

      case 'set_price':
        if (!positionId || newPrice === undefined) {
          return NextResponse.json(
            { error: 'positionId and newPrice required' },
            { status: 400 }
          );
        }

        const pos = await prisma.paperPosition.findFirst({
          where: { id: positionId, userId },
        });

        if (!pos) {
          return NextResponse.json(
            { error: 'Position not found' },
            { status: 404 }
          );
        }

        const updatedPos = await prisma.paperPosition.update({
          where: { id: positionId },
          data: { simulatedPrice: Math.max(1, Math.min(99, newPrice)) },
        });

        return NextResponse.json({
          success: true,
          position: { ...updatedPos, currentPrice: updatedPos.simulatedPrice }
        });

      case 'toggle_simulation':
        simulationMode = !simulationMode;
        return NextResponse.json({ simulationMode });

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Failed to update positions:', error);
    return NextResponse.json(
      { error: 'Failed to update positions' },
      { status: 500 }
    );
  }
}

// DELETE - Close a paper position
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const positionId = searchParams.get('id');

    if (!positionId) {
      return NextResponse.json(
        { error: 'Position ID required' },
        { status: 400 }
      );
    }

    // Run user resolution and position fetch in parallel
    const [userId, position] = await Promise.all([
      resolveUserId(),
      prisma.paperPosition.findUnique({ where: { id: positionId } }),
    ]);

    if (!userId) {
      return NextResponse.json(
        { error: 'User identification required' },
        { status: 401 }
      );
    }

    if (!position || position.userId !== userId) {
      return NextResponse.json(
        { error: 'Position not found' },
        { status: 404 }
      );
    }

    if (position.status === 'closed') {
      return NextResponse.json(
        { error: 'Position already closed' },
        { status: 400 }
      );
    }

    // Get exit price - use simulated price if available
    const exitPrice = position.simulatedPrice || position.entryPrice;
    const realizedPnl = (exitPrice - position.entryPrice) * position.quantity;

    // Close position and get all positions in parallel
    const [closedPosition, allPositions] = await Promise.all([
      prisma.paperPosition.update({
        where: { id: positionId },
        data: {
          status: 'closed',
          exitPrice,
          closedAt: new Date(),
          realizedPnl,
        },
      }),
      prisma.paperPosition.findMany({
        where: { userId },
        select: {
          status: true,
          entryPrice: true,
          quantity: true,
          simulatedPrice: true,
          currentPrice: true,
          realizedPnl: true,
        },
      }),
    ]);

    // Calculate stats (fast in-memory)
    let portfolioValue = 0;
    let totalCost = 0;
    let unrealizedPnl = 0;
    let totalRealizedPnl = 0;
    let winCount = 0;
    let lossCount = 0;
    let openCount = 0;
    let closedCount = 0;

    for (const p of allPositions) {
      if (p.status === 'open') {
        openCount++;
        const currentPrice = p.simulatedPrice || p.currentPrice || p.entryPrice;
        portfolioValue += currentPrice * p.quantity;
        totalCost += p.entryPrice * p.quantity;
        unrealizedPnl += (currentPrice - p.entryPrice) * p.quantity;
      } else {
        closedCount++;
        totalRealizedPnl += p.realizedPnl || 0;
        if ((p.realizedPnl || 0) > 0) winCount++;
        else if ((p.realizedPnl || 0) < 0) lossCount++;
      }
    }

    // Run recordTrade and createSnapshot in parallel (fire-and-forget for speed)
    Promise.all([
      recordTrade(userId, realizedPnl),
      createSnapshot(userId, {
        portfolioValue,
        totalCost,
        unrealizedPnl,
        realizedPnl: totalRealizedPnl,
        openPositions: openCount,
        closedPositions: closedCount,
        winCount,
        lossCount,
      }),
    ]).catch(console.error);

    return NextResponse.json({ position: closedPosition });
  } catch (error) {
    console.error('Failed to close position:', error);
    return NextResponse.json(
      { error: 'Failed to close position' },
      { status: 500 }
    );
  }
}
