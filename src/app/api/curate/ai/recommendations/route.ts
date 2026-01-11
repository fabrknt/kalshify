import { NextResponse } from "next/server";
import { getYieldAdvisor } from "@/lib/ai/yield-advisor";
import { UserPreferences, PoolForAI } from "@/lib/ai/types";

// Fetch pools from the existing defi endpoint
async function fetchPools(): Promise<PoolForAI[]> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/curate/defi?yieldLimit=100&minTvl=1000000`, {
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch pools");
    }

    const data = await response.json();
    return data.yields.map((pool: Record<string, unknown>) => ({
        id: pool.id,
        chain: pool.chain,
        project: pool.project,
        symbol: pool.symbol,
        tvlUsd: pool.tvlUsd,
        apy: pool.apy,
        apyBase: pool.apyBase,
        apyReward: pool.apyReward,
        stablecoin: pool.stablecoin,
        ilRisk: pool.ilRisk,
        riskScore: pool.riskScore,
        riskLevel: pool.riskLevel,
        riskBreakdown: pool.riskBreakdown,
        liquidityRisk: pool.liquidityRisk,
        apyStability: pool.apyStability,
        underlyingAssets: pool.underlyingAssets,
    }));
}

export async function POST(request: Request) {
    try {
        const advisor = getYieldAdvisor();

        if (!advisor.isAvailable()) {
            return NextResponse.json(
                { error: "AI service unavailable", code: "AI_UNAVAILABLE" },
                { status: 503 }
            );
        }

        const body = await request.json();
        const preferences: UserPreferences = {
            riskTolerance: body.preferences?.riskTolerance || "moderate",
            preferredChains: body.preferences?.preferredChains || [],
            minApy: body.preferences?.minApy ?? 0,
            maxApy: body.preferences?.maxApy ?? 100,
            stablecoinOnly: body.preferences?.stablecoinOnly ?? false,
            maxAllocationUsd: body.preferences?.maxAllocationUsd,
        };

        // Fetch pools
        const pools = await fetchPools();

        // Get recommendations from AI
        const result = await advisor.getPersonalizedRecommendations(pools, preferences);

        // Enrich recommendations with full pool data
        const enrichedRecommendations = result.recommendations.map(rec => {
            const pool = pools.find(p => p.id === rec.poolId);
            return {
                ...rec,
                pool: pool || null,
            };
        }).filter(rec => rec.pool !== null);

        return NextResponse.json({
            recommendations: enrichedRecommendations,
            preferenceSummary: result.preferenceSummary,
            generatedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Failed to generate recommendations:", error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Failed to generate recommendations",
                code: "GENERATION_FAILED",
            },
            { status: 500 }
        );
    }
}
