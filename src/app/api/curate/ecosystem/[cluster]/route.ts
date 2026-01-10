/**
 * GET /api/curate/ecosystem/[cluster]
 * Returns graph data for a specific ecosystem cluster
 */

import { NextRequest, NextResponse } from "next/server";
import { getEcosystemProjects } from "@/lib/curate/queries";

export const dynamic = "force-dynamic";

const VALID_ECOSYSTEMS = [
    "solana",
    "ethereum",
    "evm",
    "base",
    "arbitrum",
    "optimism",
    "polygon",
    "cross-chain",
    "infrastructure",
];

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ cluster: string }> }
) {
    try {
        const { cluster } = await params;

        if (!VALID_ECOSYSTEMS.includes(cluster)) {
            return NextResponse.json(
                {
                    error: "Invalid ecosystem",
                    validEcosystems: VALID_ECOSYSTEMS,
                },
                { status: 400 }
            );
        }

        const graphData = await getEcosystemProjects(cluster);

        return NextResponse.json({
            ecosystem: cluster,
            ...graphData,
        });
    } catch (error) {
        console.error("GET /api/curate/ecosystem/[cluster] error:", error);
        return NextResponse.json(
            { error: "Failed to fetch ecosystem data" },
            { status: 500 }
        );
    }
}
