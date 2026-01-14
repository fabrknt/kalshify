import { PoolForAI } from "@/lib/ai/types";
import { fetchPoolsForAI } from "./fetch-pools";

// Stablecoins for asset classification
const STABLECOINS = new Set([
    "USDC", "USDT", "DAI", "FRAX", "LUSD", "GUSD", "BUSD", "TUSD", "USDP",
    "USDD", "PYUSD", "GHO", "crvUSD", "DOLA", "MIM", "SUSD", "RAI",
    "USDS", "SUSDS", "USD0"
]);

// Normalize asset names for comparison
function normalizeAsset(asset: string): string {
    const upper = asset.toUpperCase();
    // Normalize wrapped/staked variants
    if (["WETH", "STETH", "WSTETH", "CBETH", "WEETH", "RETH"].includes(upper)) return "ETH";
    if (["WBTC", "CBBTC", "TBTC", "SBTC"].includes(upper)) return "BTC";
    if (["WSOL", "MSOL", "JITOSOL", "BSOL", "JITOVSOL"].includes(upper)) return "SOL";
    return upper;
}

// Get primary asset from pool (first underlying asset, normalized)
function getPrimaryAsset(pool: PoolForAI): string {
    if (!pool.underlyingAssets || pool.underlyingAssets.length === 0) {
        // Try to parse from symbol
        const parts = pool.symbol.split(/[-\/]/);
        return normalizeAsset(parts[0]);
    }
    return normalizeAsset(pool.underlyingAssets[0]);
}

// Check if pool is single-asset (lending, staking)
function isSingleAssetPool(pool: PoolForAI): boolean {
    return pool.ilRisk === "no" ||
           pool.category === "lending" ||
           pool.category === "staking" ||
           pool.underlyingAssets?.length === 1;
}

export interface PoolInfo {
    id: string;
    protocol: string;
    symbol: string;
    apy: number;
    apyBase: number;
    apyReward: number;
    tvl: number;
    riskScore: number;
    riskLevel: string;
}

export interface YieldSpread {
    id: string;
    asset: string;
    assetType: "stablecoin" | "volatile";

    // Higher yield pool
    highPool: PoolInfo;

    // Lower yield pool
    lowPool: PoolInfo;

    // Spread metrics
    apySpread: number;
    apySpreadPercent: number;
    riskAdjustedSpread: number;

    // Sustainability
    baseApySpread: number;
    isBaseApyDriven: boolean;

    // Actionability
    minLiquidity: number;
    estimatedSlippage: number;
    netSpread: number;

    // Metadata
    detectedAt: string;
    confidence: "high" | "medium" | "low";
}

export interface SpreadDetectionResult {
    spreads: YieldSpread[];
    topOpportunities: YieldSpread[];
    metadata: {
        assetsAnalyzed: number;
        poolsCompared: number;
        spreadsFound: number;
        generatedAt: string;
    };
}

// Estimate slippage based on TVL and position size
function estimateSlippage(minTvl: number, positionSize: number = 10000): number {
    if (minTvl <= 0) return 10;
    const ratio = positionSize / minTvl;
    // Simplified slippage model: 0.1% base + ratio-based component
    return Math.min(Math.round((0.1 + ratio * 50) * 100) / 100, 10);
}

// Calculate confidence based on TVL and spread persistence
function calculateConfidence(
    spread: number,
    minTvl: number,
    baseApyDriven: boolean
): "high" | "medium" | "low" {
    // High confidence: large TVL, base APY driven, significant spread
    if (minTvl >= 50_000_000 && baseApyDriven && spread >= 2) return "high";
    if (minTvl >= 10_000_000 && spread >= 1.5) return "medium";
    return "low";
}

/**
 * Detect yield spreads across pools with the same underlying asset
 */
export function detectYieldSpreads(
    pools: PoolForAI[],
    options?: {
        chain?: string;
        minSpread?: number;
        asset?: string;
    }
): SpreadDetectionResult {
    const chain = options?.chain;
    const minSpread = options?.minSpread ?? 1.0;
    const targetAsset = options?.asset?.toUpperCase();

    // Filter pools
    let filteredPools = pools.filter(p => {
        // Only single-asset pools (lending, staking) for clean comparison
        if (!isSingleAssetPool(p)) return false;
        // Chain filter
        if (chain && p.chain !== chain) return false;
        // Asset filter
        if (targetAsset && getPrimaryAsset(p) !== targetAsset) return false;
        // Minimum TVL for relevance
        if (p.tvlUsd < 1_000_000) return false;
        // Valid APY
        if (p.apy <= 0 || p.apy > 500) return false;
        return true;
    });

    // Group pools by primary asset
    const poolsByAsset = new Map<string, PoolForAI[]>();
    for (const pool of filteredPools) {
        const asset = getPrimaryAsset(pool);
        if (!poolsByAsset.has(asset)) {
            poolsByAsset.set(asset, []);
        }
        poolsByAsset.get(asset)!.push(pool);
    }

    const spreads: YieldSpread[] = [];
    const now = new Date().toISOString();

    // For each asset, find protocol pairs with significant spreads
    for (const [asset, assetPools] of poolsByAsset) {
        // Need at least 2 pools to compare
        if (assetPools.length < 2) continue;

        // Sort by APY descending
        const sorted = assetPools.sort((a, b) => b.apy - a.apy);

        // Compare top pool against others
        const highPool = sorted[0];

        for (let i = 1; i < sorted.length; i++) {
            const lowPool = sorted[i];

            // Skip same protocol comparisons
            if (highPool.project === lowPool.project) continue;

            const apySpread = highPool.apy - lowPool.apy;

            // Only report significant spreads
            if (apySpread < minSpread) continue;

            // Calculate base APY spread (more sustainable)
            const baseApySpread = (highPool.apyBase || 0) - (lowPool.apyBase || 0);
            const isBaseApyDriven = apySpread > 0 && baseApySpread >= apySpread * 0.5;

            // Risk-adjusted spread
            const riskDiff = Math.abs(highPool.riskScore - lowPool.riskScore);
            const riskAdjustedSpread = riskDiff > 0 ? apySpread / riskDiff : apySpread * 2;

            // Liquidity and costs
            const minLiquidity = Math.min(highPool.tvlUsd, lowPool.tvlUsd);
            const estimatedSlippageCost = estimateSlippage(minLiquidity, 10000);

            // Net spread after estimated costs (annualized)
            // Assume 2 trades (exit old, enter new), slippage applies once
            const netSpread = apySpread - (estimatedSlippageCost * 0.5);

            // Only include if net positive
            if (netSpread < 0.5) continue;

            const assetType = STABLECOINS.has(asset) ? "stablecoin" : "volatile";
            const confidence = calculateConfidence(apySpread, minLiquidity, isBaseApyDriven);

            spreads.push({
                id: `${highPool.id}-vs-${lowPool.id}`,
                asset,
                assetType,
                highPool: {
                    id: highPool.id,
                    protocol: highPool.project,
                    symbol: highPool.symbol,
                    apy: Math.round(highPool.apy * 100) / 100,
                    apyBase: Math.round((highPool.apyBase || 0) * 100) / 100,
                    apyReward: Math.round((highPool.apyReward || 0) * 100) / 100,
                    tvl: highPool.tvlUsd,
                    riskScore: highPool.riskScore,
                    riskLevel: highPool.riskLevel,
                },
                lowPool: {
                    id: lowPool.id,
                    protocol: lowPool.project,
                    symbol: lowPool.symbol,
                    apy: Math.round(lowPool.apy * 100) / 100,
                    apyBase: Math.round((lowPool.apyBase || 0) * 100) / 100,
                    apyReward: Math.round((lowPool.apyReward || 0) * 100) / 100,
                    tvl: lowPool.tvlUsd,
                    riskScore: lowPool.riskScore,
                    riskLevel: lowPool.riskLevel,
                },
                apySpread: Math.round(apySpread * 100) / 100,
                apySpreadPercent: Math.round((apySpread / lowPool.apy) * 10000) / 100,
                riskAdjustedSpread: Math.round(riskAdjustedSpread * 100) / 100,
                baseApySpread: Math.round(baseApySpread * 100) / 100,
                isBaseApyDriven,
                minLiquidity,
                estimatedSlippage: estimatedSlippageCost,
                netSpread: Math.round(netSpread * 100) / 100,
                detectedAt: now,
                confidence,
            });
        }
    }

    // Sort by net spread descending
    spreads.sort((a, b) => b.netSpread - a.netSpread);

    // Top 5 opportunities
    const topOpportunities = spreads.slice(0, 5);

    return {
        spreads,
        topOpportunities,
        metadata: {
            assetsAnalyzed: poolsByAsset.size,
            poolsCompared: filteredPools.length,
            spreadsFound: spreads.length,
            generatedAt: now,
        },
    };
}

/**
 * Fetch pools and detect spreads in one call
 */
export async function fetchAndDetectSpreads(options?: {
    chain?: string;
    minSpread?: number;
    asset?: string;
    limit?: number;
}): Promise<SpreadDetectionResult> {
    const pools = await fetchPoolsForAI({
        limit: options?.limit ?? 500,
        minTvl: 1_000_000,
    });

    return detectYieldSpreads(pools, {
        chain: options?.chain,
        minSpread: options?.minSpread,
        asset: options?.asset,
    });
}
