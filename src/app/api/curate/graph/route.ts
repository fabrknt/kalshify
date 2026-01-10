/**
 * GET /api/curate/graph
 * Returns full graph data for dependency visualization
 */

import { NextRequest, NextResponse } from "next/server";
import { getGraphData } from "@/lib/curate/queries";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const minWeight = parseInt(searchParams.get("minWeight") || "1");
        const category = searchParams.get("category") || undefined;
        const chain = searchParams.get("chain") || undefined;

        const graphData = await getGraphData({
            minWeight,
            category,
            chain,
        });

        return NextResponse.json(graphData);
    } catch (error) {
        console.error("GET /api/curate/graph error:", error);
        return NextResponse.json(
            { error: "Failed to fetch graph data" },
            { status: 500 }
        );
    }
}
