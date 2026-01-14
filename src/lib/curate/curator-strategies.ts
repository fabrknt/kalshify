/**
 * Curator strategy data and analysis
 * Phase 1: Static/curated data from public sources
 * Phase 2+: Will integrate with on-chain data
 */

import { getCurator, CuratorProfile } from "./curators";

export interface AllocationReasoning {
    whyThisAsset: string;      // Why this asset was chosen
    whyThisPercent: string;    // Why this specific allocation %
    riskMitigation: string;    // How this position manages risk
    tradeoff: string;          // What you give up for this choice
}

export interface StrategyAllocation {
    pool: string;
    asset: string;
    allocation: number; // Percentage
    apy: number;
    riskLevel: "low" | "medium" | "high";
    poolId?: string; // DeFiLlama pool ID if available
    reasoning?: AllocationReasoning; // Educational content explaining the choice
    principleIds?: string[]; // Curation principles this allocation demonstrates
}

export interface StrategyChange {
    date: string;
    type: "increase" | "decrease" | "new" | "exit";
    pool: string;
    oldAllocation: number;
    newAllocation: number;
    reason?: string;
}

export interface StrategyProfile {
    riskTolerance: "conservative" | "moderate" | "aggressive";
    focusAssets: string[];
    avgApy: number;
    avgRiskScore: number;
    diversificationScore: number; // 0-100
}

export interface HistoricalPerformance {
    period: "30d" | "90d" | "180d";
    returnPercent: number;
    maxDrawdown: number;
    volatility: number;
    sharpeRatio: number;
    benchmarkComparison: number; // vs SOL buy & hold
}

export interface CuratorStrategy {
    curatorId: string;
    platform: string;
    chain: string;
    allocations: StrategyAllocation[];
    profile: StrategyProfile;
    recentChanges: StrategyChange[];
    lastUpdated: string;
    dataSource: "curated" | "on-chain" | "api";
    historicalPerformance?: HistoricalPerformance[];
}

export interface CuratorInsight {
    curatorId: string;
    strategyAnalysis: string;
    keyTakeaways: string[];
    riskAssessment: string;
    howToReplicate: {
        step: number;
        action: string;
        pool: string;
        allocation: number;
    }[];
    considerations: string[];
    generatedAt: string;
}

// Gauntlet's Kamino Strategy (curated from public data)
const GAUNTLET_KAMINO_STRATEGY: CuratorStrategy = {
    curatorId: "gauntlet",
    platform: "kamino",
    chain: "Solana",
    allocations: [
        {
            pool: "USDC Lending",
            asset: "USDC",
            allocation: 40,
            apy: 6.8,
            riskLevel: "low",
            reasoning: {
                whyThisAsset: "USDC is the most liquid stablecoin on Solana with deep lending markets",
                whyThisPercent: "40% creates a stable anchor - large enough to reduce portfolio volatility significantly",
                riskMitigation: "Stablecoins don't lose value in market downturns, protecting your principal",
                tradeoff: "Lower yield than volatile assets, but consistent and predictable returns",
            },
            principleIds: ["risk-reward", "yield-sustainability"],
        },
        {
            pool: "SOL Lending",
            asset: "SOL",
            allocation: 25,
            apy: 5.2,
            riskLevel: "low",
            reasoning: {
                whyThisAsset: "SOL is the native asset with highest demand for borrowing (trading, leverage)",
                whyThisPercent: "25% gives meaningful exposure to Solana ecosystem growth without overconcentration",
                riskMitigation: "Lending is lower risk than LPing - no impermanent loss, just utilization risk",
                tradeoff: "SOL price volatility affects your portfolio value, even though lending itself is safe",
            },
            principleIds: ["protocol-trust", "liquidity-depth"],
        },
        {
            pool: "JitoSOL Vault",
            asset: "JITOSOL",
            allocation: 15,
            apy: 7.5,
            riskLevel: "medium",
            reasoning: {
                whyThisAsset: "JitoSOL earns staking rewards + MEV tips, boosting yield above regular SOL",
                whyThisPercent: "15% is a yield enhancer - enough to boost returns without dominating risk",
                riskMitigation: "Liquid staking tokens maintain SOL exposure with better capital efficiency",
                tradeoff: "Additional smart contract risk from Jito protocol, slightly less liquid than native SOL",
            },
            principleIds: ["protocol-trust", "yield-sustainability"],
        },
        {
            pool: "ETH Lending",
            asset: "ETH",
            allocation: 10,
            apy: 4.1,
            riskLevel: "low",
            reasoning: {
                whyThisAsset: "ETH provides cross-chain diversification - not correlated 1:1 with SOL",
                whyThisPercent: "10% adds diversification without overexposing to bridged asset risks",
                riskMitigation: "Different asset class reduces correlation - when SOL drops, ETH might not",
                tradeoff: "Lower APY than SOL markets, and bridged ETH has additional bridge risk",
            },
            principleIds: ["diversification", "correlation"],
        },
        {
            pool: "USDT Lending",
            asset: "USDT",
            allocation: 10,
            apy: 5.9,
            riskLevel: "low",
            reasoning: {
                whyThisAsset: "USDT diversifies stablecoin exposure - if USDC depegs, USDT might hold",
                whyThisPercent: "10% provides stablecoin diversification without fragmenting too much",
                riskMitigation: "Two stablecoins reduce single-issuer risk (remember USDC depeg in March 2023)",
                tradeoff: "Some consider USDT riskier than USDC due to reserve transparency concerns",
            },
            principleIds: ["diversification", "protocol-trust"],
        },
    ],
    profile: {
        riskTolerance: "moderate",
        focusAssets: ["USDC", "SOL", "JITOSOL", "ETH"],
        avgApy: 6.2,
        avgRiskScore: 22,
        diversificationScore: 75,
    },
    recentChanges: [
        {
            date: "2025-01-10",
            type: "increase",
            pool: "USDC Lending",
            oldAllocation: 35,
            newAllocation: 40,
            reason: "Increased stablecoin allocation amid market volatility",
        },
        {
            date: "2025-01-05",
            type: "decrease",
            pool: "SOL Lending",
            oldAllocation: 30,
            newAllocation: 25,
            reason: "Rebalancing to reduce volatile asset exposure",
        },
        {
            date: "2024-12-20",
            type: "new",
            pool: "JitoSOL Vault",
            oldAllocation: 0,
            newAllocation: 15,
            reason: "Added liquid staking exposure for enhanced yield",
        },
    ],
    lastUpdated: "2025-01-14",
    dataSource: "curated",
    historicalPerformance: [
        { period: "30d", returnPercent: 0.52, maxDrawdown: -1.2, volatility: 8.5, sharpeRatio: 1.8, benchmarkComparison: 12.3 },
        { period: "90d", returnPercent: 1.58, maxDrawdown: -3.1, volatility: 9.2, sharpeRatio: 1.6, benchmarkComparison: 8.5 },
        { period: "180d", returnPercent: 3.12, maxDrawdown: -5.8, volatility: 10.1, sharpeRatio: 1.5, benchmarkComparison: -2.1 },
    ],
};

// Gauntlet's Morpho Strategy (Ethereum)
const GAUNTLET_MORPHO_STRATEGY: CuratorStrategy = {
    curatorId: "gauntlet",
    platform: "morpho",
    chain: "Ethereum",
    allocations: [
        {
            pool: "Gauntlet USDC Prime",
            asset: "USDC",
            allocation: 50,
            apy: 8.2,
            riskLevel: "low",
            reasoning: {
                whyThisAsset: "USDC on Ethereum has the deepest liquidity and strongest institutional demand",
                whyThisPercent: "50% majority in stables reflects conservative Morpho vault positioning",
                riskMitigation: "Stablecoin majority protects against ETH price volatility",
                tradeoff: "Missing potential ETH upside, but capital is protected in downturns",
            },
            principleIds: ["risk-reward", "yield-sustainability"],
        },
        {
            pool: "Gauntlet WETH Prime",
            asset: "WETH",
            allocation: 30,
            apy: 4.5,
            riskLevel: "low",
            reasoning: {
                whyThisAsset: "WETH lending has consistent demand from DeFi protocols and traders",
                whyThisPercent: "30% provides ETH exposure while keeping overall portfolio conservative",
                riskMitigation: "Lending WETH is safer than LPing - you maintain full ETH exposure without IL",
                tradeoff: "Lower APY than stablecoin lending, but you benefit if ETH appreciates",
            },
            principleIds: ["correlation", "risk-reward"],
        },
        {
            pool: "Gauntlet wstETH",
            asset: "wstETH",
            allocation: 20,
            apy: 5.8,
            riskLevel: "medium",
            reasoning: {
                whyThisAsset: "wstETH earns staking yield + lending yield, compounding returns",
                whyThisPercent: "20% as yield booster - liquid staking tokens enhance overall APY",
                riskMitigation: "Lido's wstETH is the most battle-tested liquid staking token on Ethereum",
                tradeoff: "Additional Lido smart contract risk, and wstETH can trade at slight discount",
            },
            principleIds: ["protocol-trust", "yield-sustainability"],
        },
    ],
    profile: {
        riskTolerance: "conservative",
        focusAssets: ["USDC", "WETH", "wstETH"],
        avgApy: 6.5,
        avgRiskScore: 18,
        diversificationScore: 65,
    },
    recentChanges: [
        {
            date: "2025-01-08",
            type: "increase",
            pool: "Gauntlet USDC Prime",
            oldAllocation: 45,
            newAllocation: 50,
            reason: "Higher USDC borrow demand",
        },
    ],
    lastUpdated: "2025-01-14",
    dataSource: "curated",
    historicalPerformance: [
        { period: "30d", returnPercent: 0.68, maxDrawdown: -0.8, volatility: 5.2, sharpeRatio: 2.1, benchmarkComparison: 15.8 },
        { period: "90d", returnPercent: 2.05, maxDrawdown: -2.1, volatility: 5.8, sharpeRatio: 2.0, benchmarkComparison: 11.2 },
        { period: "180d", returnPercent: 4.15, maxDrawdown: -4.2, volatility: 6.5, sharpeRatio: 1.9, benchmarkComparison: 1.8 },
    ],
};

// Steakhouse Financial Strategy
const STEAKHOUSE_MORPHO_STRATEGY: CuratorStrategy = {
    curatorId: "steakhouse",
    platform: "morpho",
    chain: "Ethereum",
    allocations: [
        {
            pool: "Steakhouse USDC",
            asset: "USDC",
            allocation: 60,
            apy: 7.8,
            riskLevel: "low",
            reasoning: {
                whyThisAsset: "USDC is the gold standard for institutional stablecoin exposure",
                whyThisPercent: "60% heavy weighting reflects Steakhouse's ultra-conservative treasury management approach",
                riskMitigation: "Maximum capital preservation - ideal for treasuries that can't afford drawdowns",
                tradeoff: "Very conservative - sacrificing yield for near-zero volatility",
            },
            principleIds: ["yield-sustainability", "protocol-trust"],
        },
        {
            pool: "Steakhouse USDT",
            asset: "USDT",
            allocation: 25,
            apy: 6.5,
            riskLevel: "low",
            reasoning: {
                whyThisAsset: "USDT provides issuer diversification from USDC's Circle dependency",
                whyThisPercent: "25% balances diversification needs while keeping USDC dominant",
                riskMitigation: "If Circle faces issues, USDT position remains unaffected",
                tradeoff: "Tether's reserve transparency is lower, but trading volume is highest globally",
            },
            principleIds: ["diversification", "protocol-trust"],
        },
        {
            pool: "Steakhouse DAI",
            asset: "DAI",
            allocation: 15,
            apy: 5.2,
            riskLevel: "low",
            reasoning: {
                whyThisAsset: "DAI is decentralized - not dependent on any single company's banking relationships",
                whyThisPercent: "15% adds decentralization without overexposing to smart contract complexity",
                riskMitigation: "If regulators target centralized stablecoins, DAI remains operational",
                tradeoff: "Lower APY than USDC/USDT, and DAI has had minor depegs during extreme volatility",
            },
            principleIds: ["diversification", "protocol-trust"],
        },
    ],
    profile: {
        riskTolerance: "conservative",
        focusAssets: ["USDC", "USDT", "DAI"],
        avgApy: 7.0,
        avgRiskScore: 15,
        diversificationScore: 55,
    },
    recentChanges: [
        {
            date: "2025-01-12",
            type: "increase",
            pool: "Steakhouse USDC",
            oldAllocation: 55,
            newAllocation: 60,
            reason: "Consolidating into primary stablecoin position",
        },
    ],
    lastUpdated: "2025-01-14",
    dataSource: "curated",
    historicalPerformance: [
        { period: "30d", returnPercent: 0.58, maxDrawdown: -0.3, volatility: 2.1, sharpeRatio: 3.2, benchmarkComparison: 18.5 },
        { period: "90d", returnPercent: 1.75, maxDrawdown: -0.8, volatility: 2.5, sharpeRatio: 3.0, benchmarkComparison: 14.2 },
        { period: "180d", returnPercent: 3.52, maxDrawdown: -1.5, volatility: 2.8, sharpeRatio: 2.8, benchmarkComparison: 5.5 },
    ],
};

// RE7 Capital Strategy - More aggressive
const RE7_MORPHO_STRATEGY: CuratorStrategy = {
    curatorId: "re7",
    platform: "morpho",
    chain: "Ethereum",
    allocations: [
        {
            pool: "RE7 WETH",
            asset: "WETH",
            allocation: 35,
            apy: 5.5,
            riskLevel: "medium",
            reasoning: {
                whyThisAsset: "WETH is the core ETH exposure - betting on Ethereum ecosystem growth",
                whyThisPercent: "35% makes ETH the anchor position for an aggressive ETH-focused strategy",
                riskMitigation: "Lending rather than LPing limits downside to ETH price movements only",
                tradeoff: "Full ETH price exposure - portfolio moves with ETH market",
            },
            principleIds: ["risk-reward", "liquidity-depth"],
        },
        {
            pool: "RE7 wstETH",
            asset: "wstETH",
            allocation: 30,
            apy: 6.8,
            riskLevel: "medium",
            reasoning: {
                whyThisAsset: "wstETH compounds staking + lending yield for maximum ETH returns",
                whyThisPercent: "30% amplifies ETH exposure through liquid staking leverage",
                riskMitigation: "Lido's wstETH is the most liquid and battle-tested LST",
                tradeoff: "Layered smart contract risk (Lido + Morpho), but higher yield justifies it",
            },
            principleIds: ["yield-sustainability", "protocol-trust"],
        },
        {
            pool: "RE7 USDC",
            asset: "USDC",
            allocation: 20,
            apy: 9.2,
            riskLevel: "medium",
            reasoning: {
                whyThisAsset: "USDC provides dry powder and reduces portfolio correlation to ETH",
                whyThisPercent: "20% is minimal stable allocation - just enough for rebalancing flexibility",
                riskMitigation: "When ETH drops, this 20% maintains value for buying opportunities",
                tradeoff: "Lower allocation than conservative strategies, accepting more volatility",
            },
            principleIds: ["correlation", "risk-reward"],
        },
        {
            pool: "RE7 cbETH",
            asset: "cbETH",
            allocation: 15,
            apy: 7.5,
            riskLevel: "high",
            reasoning: {
                whyThisAsset: "cbETH (Coinbase ETH) adds LST diversification from Lido's wstETH",
                whyThisPercent: "15% yield enhancer - smaller position due to higher risk profile",
                riskMitigation: "Diversifying LST providers reduces single-protocol dependency",
                tradeoff: "cbETH is less liquid than wstETH and has additional Coinbase custody considerations",
            },
            principleIds: ["diversification", "risk-reward"],
        },
    ],
    profile: {
        riskTolerance: "aggressive",
        focusAssets: ["WETH", "wstETH", "USDC", "cbETH"],
        avgApy: 7.1,
        avgRiskScore: 45,
        diversificationScore: 70,
    },
    recentChanges: [
        {
            date: "2025-01-11",
            type: "new",
            pool: "RE7 cbETH",
            oldAllocation: 0,
            newAllocation: 15,
            reason: "Adding Coinbase ETH for yield diversification",
        },
        {
            date: "2025-01-08",
            type: "increase",
            pool: "RE7 USDC",
            oldAllocation: 15,
            newAllocation: 20,
            reason: "Higher borrow rates from increased leverage demand",
        },
    ],
    lastUpdated: "2025-01-14",
    dataSource: "curated",
    historicalPerformance: [
        { period: "30d", returnPercent: 0.72, maxDrawdown: -4.5, volatility: 18.2, sharpeRatio: 0.9, benchmarkComparison: -5.2 },
        { period: "90d", returnPercent: 1.95, maxDrawdown: -12.8, volatility: 22.5, sharpeRatio: 0.8, benchmarkComparison: -8.5 },
        { period: "180d", returnPercent: 4.85, maxDrawdown: -18.5, volatility: 25.1, sharpeRatio: 0.7, benchmarkComparison: -12.2 },
    ],
};

// Strategy registry
const STRATEGIES: Record<string, CuratorStrategy[]> = {
    gauntlet: [GAUNTLET_KAMINO_STRATEGY, GAUNTLET_MORPHO_STRATEGY],
    steakhouse: [STEAKHOUSE_MORPHO_STRATEGY],
    re7: [RE7_MORPHO_STRATEGY],
};

// Generate AI-like insight (static for now, will use real AI in Phase 2)
function generateInsight(curator: CuratorProfile, strategies: CuratorStrategy[]): CuratorInsight {
    // Get primary strategy (prefer Solana, fallback to first available)
    const primaryStrategy = strategies.find(s => s.chain === "Solana") || strategies[0];
    if (!primaryStrategy) {
        return {
            curatorId: curator.slug,
            strategyAnalysis: `${curator.name} strategy data coming soon.`,
            keyTakeaways: [],
            riskAssessment: "Assessment pending.",
            howToReplicate: [],
            considerations: ["Strategy data is being curated."],
            generatedAt: new Date().toISOString(),
        };
    }

    // Calculate stablecoin allocation
    const stablecoins = ["USDC", "USDT", "DAI", "FRAX", "LUSD"];
    const stableAllocation = primaryStrategy.allocations
        .filter(a => stablecoins.includes(a.asset))
        .reduce((sum, a) => sum + a.allocation, 0);

    // Total allocations across all strategies
    const totalPools = strategies.reduce((sum, s) => sum + s.allocations.length, 0);

    // Recent change
    const recentChange = primaryStrategy.recentChanges[0];

    // Risk profile description
    const riskDescriptions = {
        conservative: "prioritizes capital preservation with stable, predictable yields",
        moderate: "balances risk and reward with diversified positions",
        aggressive: "targets higher yields with increased risk tolerance",
    };

    // Generate dynamic analysis based on curator
    const riskTolerance = primaryStrategy.profile.riskTolerance;
    const analysisBase = `${curator.name} ${riskDescriptions[riskTolerance]}.`;
    const stableNote = stableAllocation > 50
        ? ` With ${stableAllocation}% in stablecoins, they maintain a defensive posture.`
        : stableAllocation > 0
        ? ` They hold ${stableAllocation}% in stablecoins for stability.`
        : ` They focus primarily on volatile assets for yield maximization.`;
    const recentNote = recentChange
        ? ` Recent activity: ${recentChange.reason?.toLowerCase() || "portfolio rebalancing"}.`
        : "";

    return {
        curatorId: curator.slug,
        strategyAnalysis: analysisBase + stableNote + recentNote,
        keyTakeaways: [
            stableAllocation > 0
                ? `${stableAllocation}% stablecoin allocation — ${stableAllocation > 50 ? "defensive positioning" : "balanced exposure"}`
                : `No stablecoin exposure — yield-maximizing approach`,
            `Diversified across ${totalPools} pools for risk distribution`,
            `Average APY: ${primaryStrategy.profile.avgApy.toFixed(1)}% | Risk Score: ${primaryStrategy.profile.avgRiskScore}`,
            `Focus assets: ${primaryStrategy.profile.focusAssets.join(", ")}`,
        ],
        riskAssessment: riskTolerance === "conservative"
            ? `${curator.name}'s strategy emphasizes safety over maximum yield. Risk score of ${primaryStrategy.profile.avgRiskScore} is well below market average. Suitable for users seeking stable returns.`
            : riskTolerance === "moderate"
            ? `${curator.name} balances yield and safety with a risk score of ${primaryStrategy.profile.avgRiskScore}. Good for users comfortable with moderate volatility.`
            : `${curator.name} targets higher yields with elevated risk (score: ${primaryStrategy.profile.avgRiskScore}). For users who can tolerate significant volatility.`,
        howToReplicate: primaryStrategy.allocations.map((alloc, idx) => ({
            step: idx + 1,
            action: `Allocate ${alloc.allocation}% to ${alloc.pool}`,
            pool: alloc.pool,
            allocation: alloc.allocation,
        })),
        considerations: [
            "Past performance does not guarantee future results",
            `${curator.name} may rebalance positions without notice`,
            "Gas/transaction costs not included in APY figures",
            "This is informational content, not financial advice",
            "Always verify current rates before executing any strategy",
        ],
        generatedAt: new Date().toISOString(),
    };
}

/**
 * Get strategies for a curator
 */
export function getCuratorStrategies(curatorSlug: string): CuratorStrategy[] {
    return STRATEGIES[curatorSlug.toLowerCase()] || [];
}

/**
 * Get strategy for a specific platform
 */
export function getCuratorStrategyForPlatform(
    curatorSlug: string,
    platform: string
): CuratorStrategy | null {
    const strategies = getCuratorStrategies(curatorSlug);
    return strategies.find(s => s.platform.toLowerCase() === platform.toLowerCase()) || null;
}

/**
 * Get curator with full strategy data and insights
 */
export function getCuratorWithStrategies(curatorSlug: string): {
    profile: CuratorProfile;
    strategies: CuratorStrategy[];
    insight: CuratorInsight;
    lastUpdated: string;
} | null {
    const profile = getCurator(curatorSlug);
    if (!profile) return null;

    const strategies = getCuratorStrategies(curatorSlug);
    const insight = generateInsight(profile, strategies);

    const lastUpdated = strategies.reduce((latest, s) => {
        return s.lastUpdated > latest ? s.lastUpdated : latest;
    }, "");

    return {
        profile,
        strategies,
        insight,
        lastUpdated,
    };
}

/**
 * Get all curators with their strategies
 */
export function getAllCuratorsWithStrategies(): Array<{
    profile: CuratorProfile;
    strategies: CuratorStrategy[];
    insight: CuratorInsight;
    lastUpdated: string;
}> {
    const results = [];
    for (const slug of Object.keys(STRATEGIES)) {
        const data = getCuratorWithStrategies(slug);
        if (data) results.push(data);
    }
    return results;
}
