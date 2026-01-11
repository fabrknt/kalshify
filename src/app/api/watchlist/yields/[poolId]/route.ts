import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// DELETE /api/watchlist/yields/[poolId] - Remove a yield pool from watchlist
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ poolId: string }> }
) {
    try {
        const user = await getCurrentUser();

        if (!user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { poolId } = await params;

        if (!poolId) {
            return NextResponse.json(
                { error: "Pool ID is required" },
                { status: 400 }
            );
        }

        // Delete the watchlist entry
        const deleted = await prisma.yieldWatchlist.deleteMany({
            where: {
                userId: user.id,
                poolId: poolId,
            },
        });

        if (deleted.count === 0) {
            return NextResponse.json(
                { error: "Pool not found in watchlist" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/watchlist/yields/[poolId] error:", error);
        return NextResponse.json(
            { error: "Failed to remove from watchlist" },
            { status: 500 }
        );
    }
}
