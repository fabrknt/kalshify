import { NextResponse } from "next/server";

// CORS headers
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
};

// Handle OPTIONS for CORS
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}

// GET - API documentation
export async function GET() {
    const documentation = {
        name: "Curate Public API",
        version: "1.0.0",
        description: "Public API for Solana DeFi allocation recommendations",
        baseUrl: "/api/curate/public/v1",
        authentication: {
            description: "API key authentication for premium features",
            header: "X-API-Key or Authorization: Bearer <api_key>",
            tiers: {
                free: {
                    rateLimit: "100 requests/day",
                    features: ["Basic pool data", "Simple allocations"],
                },
                basic: {
                    rateLimit: "500 requests/day",
                    features: ["Extended pool data", "Full allocations"],
                    note: "API access requires Pro tier or higher",
                },
                pro: {
                    rateLimit: "2,000 requests/day",
                    features: ["Full pool data", "Enhanced reasoning", "Historical data"],
                },
                enterprise: {
                    rateLimit: "10,000 requests/day",
                    features: ["Everything in Pro", "Custom integrations"],
                },
            },
        },
        endpoints: [
            {
                path: "/allocations",
                method: "GET",
                description: "Get allocation recommendations based on risk profile",
                parameters: {
                    risk: {
                        type: "string",
                        required: true,
                        values: ["preserver", "steady", "balanced", "growth", "maximizer"],
                        description: "Risk tolerance level",
                    },
                    amount: {
                        type: "number",
                        required: true,
                        description: "Amount to allocate in USD",
                    },
                    preview: {
                        type: "boolean",
                        required: false,
                        description: "If true, returns quick preview data for all risk levels",
                    },
                },
                example: {
                    request: "/allocations?risk=balanced&amount=10000",
                    response: {
                        success: true,
                        data: {
                            allocations: [
                                {
                                    poolName: "USDC Lending",
                                    protocol: "Kamino",
                                    asset: "USDC",
                                    allocation: 30,
                                    apy: 6.5,
                                    riskLevel: "low",
                                },
                            ],
                            summary: {
                                expectedApy: 9.8,
                                overallRisk: "medium",
                            },
                        },
                        meta: {
                            tier: "free",
                            rateLimit: {
                                limit: 100,
                                remaining: 99,
                                reset: "2024-01-01T00:00:00.000Z",
                            },
                        },
                    },
                },
            },
            {
                path: "/allocations",
                method: "POST",
                description: "Get allocation recommendations (same as GET but with body)",
                body: {
                    risk: "string (required)",
                    amount: "number (required)",
                },
                example: {
                    request: {
                        risk: "growth",
                        amount: 50000,
                    },
                },
            },
            {
                path: "/pools",
                method: "GET",
                description: "Get current Solana DeFi pool data",
                parameters: {
                    project: {
                        type: "string",
                        required: false,
                        description: "Filter by protocol name (e.g., kamino, marinade)",
                    },
                    minTvl: {
                        type: "number",
                        required: false,
                        default: 100000,
                        description: "Minimum TVL filter in USD",
                    },
                    stablecoin: {
                        type: "boolean",
                        required: false,
                        description: "Filter for stablecoin pools only",
                    },
                    limit: {
                        type: "number",
                        required: false,
                        default: 50,
                        max: "20 (free) / 100 (premium)",
                        description: "Maximum pools to return",
                    },
                },
                example: {
                    request: "/pools?project=kamino&minTvl=500000",
                    response: {
                        success: true,
                        data: [
                            {
                                poolId: "abc123",
                                chain: "Solana",
                                project: "kamino-lending",
                                symbol: "USDC",
                                tvlUsd: 150000000,
                                apy: 6.5,
                                stablecoin: true,
                            },
                        ],
                        meta: {
                            tier: "free",
                            poolCount: 1,
                            timestamp: "2024-01-01T12:00:00.000Z",
                        },
                    },
                },
            },
        ],
        errors: {
            UNAUTHORIZED: "Invalid or missing API key for premium features",
            MISSING_PARAMETERS: "Required parameters not provided",
            INVALID_RISK_LEVEL: "Risk level must be one of the valid values",
            INVALID_AMOUNT: "Amount must be a positive number",
            RATE_LIMITED: "Rate limit exceeded for your tier",
            FETCH_ERROR: "Failed to fetch external data",
        },
        support: {
            documentation: "https://docs.curate.xyz",
            email: "api@curate.xyz",
        },
    };

    return NextResponse.json(documentation, { headers: corsHeaders });
}
