// Types for AI-powered yield advisor features

export interface UserPreferences {
    riskTolerance: "conservative" | "moderate" | "aggressive";
    preferredChains: string[];
    minApy: number;
    maxApy: number;
    stablecoinOnly: boolean;
    maxAllocationUsd?: number;
}

export interface PoolRecommendation {
    poolId: string;
    rank: number;
    matchScore: number;
    reasoning: string;
    highlights: string[];
}

export interface RecommendationsResult {
    recommendations: PoolRecommendation[];
    preferenceSummary: string;
}

export interface PoolInsight {
    riskExplanation: string;
    opportunities: string[];
    risks: string[];
    apyStabilityAnalysis: string;
    comparison: {
        vsSimilarPools: string;
        relativePosition: "above_average" | "average" | "below_average";
    };
    verdict: string;
}

export interface InsightResult {
    poolId: string;
    insight: PoolInsight;
    cached: boolean;
    generatedAt: string;
}

export interface PortfolioAllocation {
    poolId: string;
    allocationPercent: number;
    rationale: string;
}

export interface PortfolioRequest {
    totalAllocation: number;
    riskTolerance: "conservative" | "moderate" | "aggressive";
    diversification: "focused" | "balanced" | "diversified";
    excludeChains?: string[];
    includeStablecoins?: boolean;
}

export interface PortfolioResult {
    allocations: PortfolioAllocation[];
    reasoning: string;
    riskWarnings: string[];
}

// Minimal pool data needed for AI prompts
export interface PoolForAI {
    id: string;
    chain: string;
    project: string;
    symbol: string;
    tvlUsd: number;
    apy: number;
    apyBase: number;
    apyReward: number;
    stablecoin: boolean;
    ilRisk: string;
    riskScore: number;
    riskLevel: "low" | "medium" | "high" | "very_high";
    riskBreakdown: {
        tvlScore: number;
        apyScore: number;
        stableScore: number;
        ilScore: number;
        protocolScore: number;
    };
    liquidityRisk: {
        score: number;
        maxSafeAllocation: number;
        exitabilityRating: string;
        slippageEstimates: {
            at100k: number;
            at500k: number;
            at1m: number;
        };
    };
    apyStability?: {
        score: number;
        volatility: number;
        avgApy: number;
        trend: "up" | "down" | "stable";
    } | null;
    underlyingAssets: string[];
}
