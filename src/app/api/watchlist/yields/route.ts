import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Prisma } from "@prisma/client";

// GET /api/watchlist/yields - Get user's watchlisted yield pool IDs
export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const watchlistItems = await prisma.yieldWatchlist.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                poolId: true,
                chain: true,
                project: true,
                symbol: true,
                createdAt: true,
            },
        });

        // Return pool IDs for client-side filtering
        const poolIds = watchlistItems.map((item) => item.poolId);

        return NextResponse.json({
            items: watchlistItems,
            poolIds,
            total: watchlistItems.length,
        });
    } catch (error) {
        console.error("GET /api/watchlist/yields error:", error);
        return NextResponse.json(
            { error: "Failed to fetch watchlist" },
            { status: 500 }
        );
    }
}

// POST /api/watchlist/yields - Add a yield pool to watchlist
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { poolId, chain, project, symbol } = body;

        // Validate required fields
        if (!poolId || !chain || !project || !symbol) {
            return NextResponse.json(
                { error: "Missing required fields: poolId, chain, project, symbol" },
                { status: 400 }
            );
        }

        // Create watchlist entry
        const watchlistItem = await prisma.yieldWatchlist.create({
            data: {
                poolId,
                chain,
                project,
                symbol,
                userId: user.id,
            },
        });

        return NextResponse.json(watchlistItem, { status: 201 });
    } catch (error) {
        console.error("POST /api/watchlist/yields error:", error);

        // Handle duplicate entry
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                return NextResponse.json(
                    { error: "Pool already in watchlist" },
                    { status: 409 }
                );
            }
        }

        return NextResponse.json(
            { error: "Failed to add to watchlist" },
            { status: 500 }
        );
    }
}
