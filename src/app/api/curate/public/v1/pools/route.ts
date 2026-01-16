import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getEffectiveTier, checkTierLimit, hasFeatureAccess, TIER_BENEFITS } from "@/lib/curate/premium";

// CORS headers for API access
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
};

// Cache for 5 minutes
export const revalidate = 300;

// DeFiLlama API
const DEFILLAMA_YIELDS_API = "https://yields.llama.fi/pools";

// API response wrapper
interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
    };
    meta?: {
        tier: string;
        poolCount: number;
        timestamp: string;
        rateLimit: {
            limit: number;
            remaining: number;
            reset: string;
        };
    };
}

interface YieldPool {
    poolId: string;
    chain: string;
    project: string;
    symbol: string;
    tvlUsd: number;
    apy: number;
    apyBase?: number;
    apyReward?: number;
    stablecoin: boolean;
    ilRisk?: string;
    exposure?: string;
}

interface EnhancedYieldPool extends YieldPool {
    apyPct7D?: number;
    apyPct30D?: number;
    apyMean30d?: number;
    rewardTokens?: string[];
    underlyingTokens?: string[];
}

// Validate API key and get user tier
async function validateApiKey(apiKey: string | null): Promise<{
    valid: boolean;
    tier: "free" | "basic" | "pro" | "enterprise";
    userId?: string;
    error?: string;
}> {
    if (!apiKey) {
        return { valid: true, tier: "free" };
    }

    const keyParts = apiKey.split("_");
    if (keyParts.length !== 3 || keyParts[0] !== "curate") {
        return { valid: false, tier: "free", error: "Invalid API key format" };
    }

    const userId = keyParts[1];

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                isPremium: true,
                premiumTier: true,
                premiumExpiresAt: true,
            },
        });

        if (!user) {
            return { valid: false, tier: "free", error: "Invalid API key" };
        }

        const effectiveTier = getEffectiveTier(
            user.isPremium,
            user.premiumTier,
            user.premiumExpiresAt
        );

        if (!hasFeatureAccess(effectiveTier, "api-access")) {
            return {
                valid: false,
                tier: effectiveTier,
                error: "API access requires Pro tier or higher",
            };
        }

        return { valid: true, tier: effectiveTier, userId: user.id };
    } catch {
        return { valid: false, tier: "free", error: "API key validation failed" };
    }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}

// GET - Get Solana DeFi pool data
export async function GET(request: NextRequest) {
    const apiKey = request.headers.get("X-API-Key") || request.headers.get("Authorization")?.replace("Bearer ", "") || null;

    // Validate API key
    const auth = await validateApiKey(apiKey);

    if (apiKey && !auth.valid) {
        const response: ApiResponse<never> = {
            success: false,
            error: {
                code: "UNAUTHORIZED",
                message: auth.error || "Invalid API key",
            },
        };
        return NextResponse.json(response, {
            status: 401,
            headers: corsHeaders,
        });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const project = searchParams.get("project");
    const minTvl = parseFloat(searchParams.get("minTvl") || "100000");
    const stablecoinOnly = searchParams.get("stablecoin") === "true";
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), auth.tier === "free" ? 20 : 100);

    try {
        // Fetch from DeFiLlama
        const response = await fetch(DEFILLAMA_YIELDS_API);
        if (!response.ok) {
            throw new Error("Failed to fetch pool data");
        }

        const data = await response.json();
        const pools: unknown[] = data.data || [];

        // Filter for Solana pools
        let solanaPools = pools.filter((pool: unknown) => {
            const p = pool as { chain?: string; tvlUsd?: number; stablecoin?: boolean };
            if (p.chain?.toLowerCase() !== "solana") return false;
            if ((p.tvlUsd ?? 0) < minTvl) return false;
            if (stablecoinOnly && !p.stablecoin) return false;
            return true;
        });

        // Filter by project if specified
        if (project) {
            solanaPools = solanaPools.filter((pool: unknown) => {
                const p = pool as { project?: string };
                return p.project?.toLowerCase() === project.toLowerCase();
            });
        }

        // Sort by TVL
        solanaPools.sort((a: unknown, b: unknown) => {
            const aPool = a as { tvlUsd?: number };
            const bPool = b as { tvlUsd?: number };
            return (bPool.tvlUsd ?? 0) - (aPool.tvlUsd ?? 0);
        });

        // Limit results
        solanaPools = solanaPools.slice(0, limit);

        // Format response based on tier
        const formattedPools = solanaPools.map((pool: unknown) => {
            const p = pool as {
                pool?: string;
                chain?: string;
                project?: string;
                symbol?: string;
                tvlUsd?: number;
                apy?: number;
                apyBase?: number;
                apyReward?: number;
                stablecoin?: boolean;
                ilRisk?: string;
                exposure?: string;
                apyPct7D?: number;
                apyPct30D?: number;
                apyMean30d?: number;
                rewardTokens?: string[];
                underlyingTokens?: string[];
            };

            const basePool: YieldPool = {
                poolId: p.pool || "",
                chain: p.chain || "Solana",
                project: p.project || "",
                symbol: p.symbol || "",
                tvlUsd: p.tvlUsd ?? 0,
                apy: p.apy ?? 0,
                apyBase: p.apyBase,
                apyReward: p.apyReward,
                stablecoin: p.stablecoin ?? false,
                ilRisk: p.ilRisk,
                exposure: p.exposure,
            };

            // Premium tiers get enhanced data
            if (auth.tier !== "free") {
                const enhanced: EnhancedYieldPool = {
                    ...basePool,
                    apyPct7D: p.apyPct7D,
                    apyPct30D: p.apyPct30D,
                    apyMean30d: p.apyMean30d,
                    rewardTokens: p.rewardTokens,
                    underlyingTokens: p.underlyingTokens,
                };
                return enhanced;
            }

            return basePool;
        });

        const rateLimit = checkTierLimit(auth.tier, "apiCallsPerDay");

        const apiResponse: ApiResponse<typeof formattedPools> = {
            success: true,
            data: formattedPools,
            meta: {
                tier: auth.tier,
                poolCount: formattedPools.length,
                timestamp: new Date().toISOString(),
                rateLimit: {
                    limit: typeof rateLimit.limit === "number" ? rateLimit.limit : -1,
                    remaining: rateLimit.remaining ?? -1,
                    reset: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                },
            },
        };

        return NextResponse.json(apiResponse, { headers: corsHeaders });
    } catch (error) {
        console.error("Error fetching pool data:", error);
        const apiResponse: ApiResponse<never> = {
            success: false,
            error: {
                code: "FETCH_ERROR",
                message: "Failed to fetch pool data",
            },
        };
        return NextResponse.json(apiResponse, {
            status: 500,
            headers: corsHeaders,
        });
    }
}
