import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getYieldAdvisor } from "@/lib/ai/yield-advisor";
import { PoolForAI, PoolInsight } from "@/lib/ai/types";
import { Prisma } from "@prisma/client";

// Fetch a specific pool and similar pools
async function fetchPoolData(poolId: string): Promise<{
    pool: PoolForAI | null;
    similarPools: PoolForAI[];
    historicalData?: { date: string; apy: number }[];
}> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Fetch all pools
    const poolsResponse = await fetch(`${baseUrl}/api/curate/defi?yieldLimit=200&minTvl=100000`, {
        cache: "no-store",
    });

    if (!poolsResponse.ok) {
        throw new Error("Failed to fetch pools");
    }

    const poolsData = await poolsResponse.json();
    const pools: PoolForAI[] = poolsData.yields.map((p: Record<string, unknown>) => ({
        id: p.id,
        chain: p.chain,
        project: p.project,
        symbol: p.symbol,
        tvlUsd: p.tvlUsd,
        apy: p.apy,
        apyBase: p.apyBase,
        apyReward: p.apyReward,
        stablecoin: p.stablecoin,
        ilRisk: p.ilRisk,
        riskScore: p.riskScore,
        riskLevel: p.riskLevel,
        riskBreakdown: p.riskBreakdown,
        liquidityRisk: p.liquidityRisk,
        apyStability: p.apyStability,
        underlyingAssets: p.underlyingAssets,
    }));

    const pool = pools.find(p => p.id === poolId) || null;

    if (!pool) {
        return { pool: null, similarPools: [] };
    }

    // Find similar pools (same stablecoin status, similar risk level)
    const similarPools = pools
        .filter(p =>
            p.id !== poolId &&
            p.stablecoin === pool.stablecoin &&
            Math.abs(p.riskScore - pool.riskScore) < 20
        )
        .slice(0, 5);

    // Fetch historical data
    let historicalData: { date: string; apy: number }[] | undefined;
    try {
        const historyResponse = await fetch(`${baseUrl}/api/curate/defi/history/${poolId}?days=30`, {
            cache: "no-store",
        });
        if (historyResponse.ok) {
            const historyData = await historyResponse.json();
            historicalData = historyData.data?.map((d: { timestamp: string; apy: number }) => ({
                date: d.timestamp,
                apy: d.apy,
            }));
        }
    } catch {
        // History fetch failed, continue without it
    }

    return { pool, similarPools, historicalData };
}

// Check if cached insight is still valid
function isCacheValid(
    cachedSnapshot: Record<string, unknown>,
    currentPool: PoolForAI
): boolean {
    const cachedApy = cachedSnapshot.apy as number;
    const cachedRiskScore = cachedSnapshot.riskScore as number;

    // Invalidate if APY changed more than 20%
    if (Math.abs(currentPool.apy - cachedApy) / cachedApy > 0.2) {
        return false;
    }

    // Invalidate if risk score changed more than 5 points
    if (Math.abs(currentPool.riskScore - cachedRiskScore) > 5) {
        return false;
    }

    return true;
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ poolId: string }> }
) {
    try {
        const { poolId } = await params;

        // Check cache first
        const cached = await prisma.poolInsightCache.findUnique({
            where: { poolId },
        });

        // Fetch current pool data
        const { pool, similarPools, historicalData } = await fetchPoolData(poolId);

        if (!pool) {
            return NextResponse.json(
                { error: "Pool not found" },
                { status: 404 }
            );
        }

        // Check if cache is valid
        if (cached && cached.expiresAt > new Date()) {
            const isValid = isCacheValid(
                cached.poolSnapshot as Record<string, unknown>,
                pool
            );

            if (isValid) {
                return NextResponse.json({
                    poolId,
                    insight: cached.insight as unknown as PoolInsight,
                    cached: true,
                    generatedAt: cached.generatedAt.toISOString(),
                });
            }
        }

        // Generate new insight
        const advisor = getYieldAdvisor();

        if (!advisor.isAvailable()) {
            return NextResponse.json(
                { error: "AI service unavailable", code: "AI_UNAVAILABLE" },
                { status: 503 }
            );
        }

        const insight = await advisor.getPoolInsight(pool, similarPools, historicalData);

        // Cache the result
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        await prisma.poolInsightCache.upsert({
            where: { poolId },
            update: {
                insight: insight as unknown as Prisma.InputJsonValue,
                poolSnapshot: {
                    apy: pool.apy,
                    riskScore: pool.riskScore,
                    tvlUsd: pool.tvlUsd,
                } as Prisma.InputJsonValue,
                generatedAt: new Date(),
                expiresAt,
            },
            create: {
                poolId,
                insight: insight as unknown as Prisma.InputJsonValue,
                poolSnapshot: {
                    apy: pool.apy,
                    riskScore: pool.riskScore,
                    tvlUsd: pool.tvlUsd,
                } as Prisma.InputJsonValue,
                generatedAt: new Date(),
                expiresAt,
            },
        });

        return NextResponse.json({
            poolId,
            insight,
            cached: false,
            generatedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Failed to generate insight:", error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Failed to generate insight",
                code: "GENERATION_FAILED",
            },
            { status: 500 }
        );
    }
}

// Force regenerate insight
export async function POST(
    request: Request,
    { params }: { params: Promise<{ poolId: string }> }
) {
    try {
        const { poolId } = await params;

        // Delete cache to force regeneration
        await prisma.poolInsightCache.delete({
            where: { poolId },
        }).catch(() => {
            // Ignore if doesn't exist
        });

        // Redirect to GET which will regenerate
        const { pool, similarPools, historicalData } = await fetchPoolData(poolId);

        if (!pool) {
            return NextResponse.json(
                { error: "Pool not found" },
                { status: 404 }
            );
        }

        const advisor = getYieldAdvisor();

        if (!advisor.isAvailable()) {
            return NextResponse.json(
                { error: "AI service unavailable", code: "AI_UNAVAILABLE" },
                { status: 503 }
            );
        }

        const insight = await advisor.getPoolInsight(pool, similarPools, historicalData);

        // Cache the result
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        await prisma.poolInsightCache.create({
            data: {
                poolId,
                insight: insight as unknown as Prisma.InputJsonValue,
                poolSnapshot: {
                    apy: pool.apy,
                    riskScore: pool.riskScore,
                    tvlUsd: pool.tvlUsd,
                } as Prisma.InputJsonValue,
                generatedAt: new Date(),
                expiresAt,
            },
        });

        return NextResponse.json({
            poolId,
            insight,
            cached: false,
            generatedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Failed to regenerate insight:", error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Failed to regenerate insight",
                code: "GENERATION_FAILED",
            },
            { status: 500 }
        );
    }
}
