import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateRecommendation, getRecommendationPreview } from "@/lib/curate/recommendation-engine";
import { getEffectiveTier, checkTierLimit, hasFeatureAccess, TIER_BENEFITS } from "@/lib/curate/premium";
import { RiskTolerance } from "@/components/curate/quick-start";

// CORS headers for API access
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
};

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
        rateLimit: {
            limit: number;
            remaining: number;
            reset: string;
        };
    };
}

// Validate API key and get user tier
async function validateApiKey(apiKey: string | null): Promise<{
    valid: boolean;
    tier: "free" | "basic" | "pro" | "enterprise";
    userId?: string;
    error?: string;
}> {
    // No API key - treat as free tier
    if (!apiKey) {
        return { valid: true, tier: "free" };
    }

    // API key format: curate_[userId]_[randomString]
    // In production, this would be properly hashed and stored
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

        // Check if user has API access (pro+ tier)
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

// GET - Get allocation recommendation
export async function GET(request: NextRequest) {
    const apiKey = request.headers.get("X-API-Key") || request.headers.get("Authorization")?.replace("Bearer ", "") || null;

    // Validate API key
    const auth = await validateApiKey(apiKey);

    // Check for API access (pro+ only for authenticated access)
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
    const riskTolerance = searchParams.get("risk") as RiskTolerance | null;
    const amountStr = searchParams.get("amount");
    const preview = searchParams.get("preview") === "true";

    // Return preview data (available to all)
    if (preview) {
        const validRiskLevels: RiskTolerance[] = ["preserver", "steady", "balanced", "growth", "maximizer"];
        const previews = validRiskLevels.map(risk => ({
            riskTolerance: risk,
            ...getRecommendationPreview(risk),
        }));

        const response: ApiResponse<typeof previews> = {
            success: true,
            data: previews,
            meta: {
                tier: auth.tier,
                rateLimit: {
                    limit: TIER_BENEFITS[auth.tier].limits.apiCallsPerDay,
                    remaining: TIER_BENEFITS[auth.tier].limits.apiCallsPerDay,
                    reset: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                },
            },
        };

        return NextResponse.json(response, { headers: corsHeaders });
    }

    // Full recommendation requires parameters
    if (!riskTolerance || !amountStr) {
        const response: ApiResponse<never> = {
            success: false,
            error: {
                code: "MISSING_PARAMETERS",
                message: "Required: risk (preserver|steady|balanced|growth|maximizer) and amount (number)",
            },
        };
        return NextResponse.json(response, {
            status: 400,
            headers: corsHeaders,
        });
    }

    // Validate risk tolerance
    const validRiskLevels: RiskTolerance[] = ["preserver", "steady", "balanced", "growth", "maximizer"];
    if (!validRiskLevels.includes(riskTolerance)) {
        const response: ApiResponse<never> = {
            success: false,
            error: {
                code: "INVALID_RISK_LEVEL",
                message: `Invalid risk level. Must be one of: ${validRiskLevels.join(", ")}`,
            },
        };
        return NextResponse.json(response, {
            status: 400,
            headers: corsHeaders,
        });
    }

    // Validate amount
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
        const response: ApiResponse<never> = {
            success: false,
            error: {
                code: "INVALID_AMOUNT",
                message: "Amount must be a positive number",
            },
        };
        return NextResponse.json(response, {
            status: 400,
            headers: corsHeaders,
        });
    }

    // Check rate limit
    const rateLimit = checkTierLimit(auth.tier, "apiCallsPerDay");

    // Generate recommendation
    const recommendation = generateRecommendation(amount, riskTolerance);

    // Format response based on tier
    const responseData = auth.tier === "free" ? {
        // Free tier gets limited data
        allocations: recommendation.allocations.map(a => ({
            poolName: a.poolName,
            protocol: a.protocol,
            asset: a.asset,
            allocation: a.allocation,
            apy: a.apy,
            riskLevel: a.riskLevel,
        })),
        summary: {
            expectedApy: recommendation.summary.expectedApy,
            overallRisk: recommendation.summary.overallRisk,
        },
    } : {
        // Premium tiers get full data including enhanced reasoning
        allocations: recommendation.allocations,
        summary: recommendation.summary,
        insights: recommendation.insights,
        warnings: recommendation.warnings,
    };

    const response: ApiResponse<typeof responseData> = {
        success: true,
        data: responseData,
        meta: {
            tier: auth.tier,
            rateLimit: {
                limit: typeof rateLimit.limit === "number" ? rateLimit.limit : -1,
                remaining: rateLimit.remaining ?? -1,
                reset: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            },
        },
    };

    return NextResponse.json(response, { headers: corsHeaders });
}

// POST - Same as GET but with body (for larger requests)
export async function POST(request: NextRequest) {
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

    // Parse body
    let body: { risk?: RiskTolerance; amount?: number };
    try {
        body = await request.json();
    } catch {
        const response: ApiResponse<never> = {
            success: false,
            error: {
                code: "INVALID_JSON",
                message: "Request body must be valid JSON",
            },
        };
        return NextResponse.json(response, {
            status: 400,
            headers: corsHeaders,
        });
    }

    const { risk: riskTolerance, amount } = body;

    if (!riskTolerance || !amount) {
        const response: ApiResponse<never> = {
            success: false,
            error: {
                code: "MISSING_PARAMETERS",
                message: "Required: risk (preserver|steady|balanced|growth|maximizer) and amount (number)",
            },
        };
        return NextResponse.json(response, {
            status: 400,
            headers: corsHeaders,
        });
    }

    // Validate risk tolerance
    const validRiskLevels: RiskTolerance[] = ["preserver", "steady", "balanced", "growth", "maximizer"];
    if (!validRiskLevels.includes(riskTolerance)) {
        const response: ApiResponse<never> = {
            success: false,
            error: {
                code: "INVALID_RISK_LEVEL",
                message: `Invalid risk level. Must be one of: ${validRiskLevels.join(", ")}`,
            },
        };
        return NextResponse.json(response, {
            status: 400,
            headers: corsHeaders,
        });
    }

    if (typeof amount !== "number" || amount <= 0) {
        const response: ApiResponse<never> = {
            success: false,
            error: {
                code: "INVALID_AMOUNT",
                message: "Amount must be a positive number",
            },
        };
        return NextResponse.json(response, {
            status: 400,
            headers: corsHeaders,
        });
    }

    // Generate recommendation
    const recommendation = generateRecommendation(amount, riskTolerance);

    const rateLimit = checkTierLimit(auth.tier, "apiCallsPerDay");

    // Format response based on tier
    const responseData = auth.tier === "free" ? {
        allocations: recommendation.allocations.map(a => ({
            poolName: a.poolName,
            protocol: a.protocol,
            asset: a.asset,
            allocation: a.allocation,
            apy: a.apy,
            riskLevel: a.riskLevel,
        })),
        summary: {
            expectedApy: recommendation.summary.expectedApy,
            overallRisk: recommendation.summary.overallRisk,
        },
    } : {
        allocations: recommendation.allocations,
        summary: recommendation.summary,
        insights: recommendation.insights,
        warnings: recommendation.warnings,
    };

    const response: ApiResponse<typeof responseData> = {
        success: true,
        data: responseData,
        meta: {
            tier: auth.tier,
            rateLimit: {
                limit: typeof rateLimit.limit === "number" ? rateLimit.limit : -1,
                remaining: rateLimit.remaining ?? -1,
                reset: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            },
        },
    };

    return NextResponse.json(response, { headers: corsHeaders });
}
