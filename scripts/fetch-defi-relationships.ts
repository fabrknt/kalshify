/**
 * Fetch DeFi protocol relationships from DeFiLlama
 *
 * This script fetches protocol data from DeFiLlama and builds
 * a relationship graph showing how DeFi protocols depend on each other.
 *
 * Usage: npm run fetch:defi
 */

import * as fs from "fs";
import * as path from "path";

// DeFiLlama API endpoints
const DEFILLAMA_PROTOCOLS_API = "https://api.llama.fi/protocols";
const DEFILLAMA_YIELDS_API = "https://yields.llama.fi/pools";
const DEFILLAMA_CHART_API = "https://yields.llama.fi/chart"; // /{poolId} for historical data

// Types
interface DefiLlamaProtocol {
    id: string;
    name: string;
    slug: string;
    symbol: string;
    category: string;
    chains: string[];
    tvl: number;
    parentProtocol: string | null;
    url?: string;
    twitter?: string;
    github?: string[];
    logo?: string;
}

interface YieldPool {
    pool: string;          // Unique pool ID
    chain: string;
    project: string;
    symbol: string;
    tvlUsd: number;
    apy: number;
    apyBase?: number;
    apyReward?: number;
    rewardTokens?: string[];
    underlyingTokens?: string[];
    poolMeta?: string;
    ilRisk?: string;       // IL risk level
    exposure?: string;     // single, multi
    stablecoin?: boolean;
}

// Historical chart data point from DeFiLlama
interface ChartDataPoint {
    timestamp: string;
    tvlUsd: number;
    apy: number;
    apyBase: number | null;
    apyReward: number | null;
    il7d: number | null;
    apyBase7d: number | null;
}

// APY Stability metrics
interface ApyStability {
    score: number;              // 0-100, higher = more stable
    volatility: number;         // Standard deviation of APY
    avgApy: number;             // Average APY over period
    minApy: number;             // Minimum APY observed
    maxApy: number;             // Maximum APY observed
    trend: "up" | "down" | "stable";  // Recent trend direction
    dataPoints: number;         // Number of data points used
}

// Liquidity Risk metrics for exit-ability assessment
interface LiquidityRisk {
    score: number;              // 0-100, lower = more liquid (safer to exit)
    poolTvl: number;            // Total pool TVL in USD
    maxSafeAllocation: number;  // Max position size for safe exit (in USD)
    safeAllocationPercent: number;  // What % of pool is safe to hold
    slippageEstimates: {        // Estimated slippage at different position sizes
        at100k: number;         // Slippage % for $100K position
        at500k: number;         // Slippage % for $500K position
        at1m: number;           // Slippage % for $1M position
        at5m: number;           // Slippage % for $5M position
        at10m: number;          // Slippage % for $10M position
    };
    exitabilityRating: "excellent" | "good" | "moderate" | "poor" | "very_poor";
}

interface PoolDependency {
    type: "protocol" | "asset" | "oracle" | "chain";
    name: string;
    risk: "low" | "medium" | "high";
}

interface RiskBreakdown {
    tvlScore: number;        // 0-30: Higher TVL = lower risk
    apyScore: number;        // 0-25: Sustainable APY = lower risk
    stableScore: number;     // 0-20: Stablecoins = lower risk
    ilScore: number;         // 0-15: No IL = lower risk
    protocolScore: number;   // 0-10: Established protocols = lower risk
}

interface ProcessedYieldPool {
    id: string;
    chain: string;
    project: string;
    projectSlug: string;
    symbol: string;
    tvlUsd: number;
    apy: number;
    apyBase: number;
    apyReward: number;
    stablecoin: boolean;
    ilRisk: string;
    poolMeta: string;
    // Risk scoring fields
    riskScore: number;           // 1-100, lower = safer
    riskLevel: "low" | "medium" | "high" | "very_high";
    riskBreakdown: RiskBreakdown;
    dependencies: PoolDependency[];
    underlyingAssets: string[];
    // APY Stability fields (from historical data)
    apyStability: ApyStability | null;  // null if no historical data available
    // Liquidity Risk fields
    liquidityRisk: LiquidityRisk;
}

interface DefiRelationship {
    source: string;        // Protocol slug
    target: string;        // Protocol slug
    type: "parent_child" | "yield_source" | "same_ecosystem" | "integration";
    weight: number;        // Strength of relationship (e.g., TVL)
    chain?: string;
    evidence: string;
}

interface DefiProtocolData {
    slug: string;
    name: string;
    category: string;
    chains: string[];
    tvl: number;
    symbol: string;
    parentProtocol: string | null;
    logo?: string;
    url?: string;
    twitter?: string;
    github?: string[];
}

interface DefiRelationshipData {
    protocols: Record<string, DefiProtocolData>;
    relationships: DefiRelationship[];
    yields: ProcessedYieldPool[];
    metadata: {
        fetchedAt: string;
        totalProtocols: number;
        totalRelationships: number;
        totalYieldPools: number;
        categories: string[];
        chains: string[];
    };
}

// Known protocol integrations (manually curated for accuracy)
// These are protocols that are known to integrate with each other
const KNOWN_INTEGRATIONS: Array<{ source: string; target: string; type: string; evidence: string }> = [
    // Morpho integrations
    { source: "morpho", target: "aave-v3", type: "yield_source", evidence: "Morpho optimizes Aave lending" },
    { source: "morpho", target: "compound-v3", type: "yield_source", evidence: "Morpho optimizes Compound lending" },

    // Pendle integrations
    { source: "pendle", target: "lido", type: "yield_source", evidence: "Pendle tokenizes Lido stETH yield" },
    { source: "pendle", target: "rocket-pool", type: "yield_source", evidence: "Pendle tokenizes rETH yield" },
    { source: "pendle", target: "aave-v3", type: "yield_source", evidence: "Pendle tokenizes Aave yields" },

    // Sommelier integrations
    { source: "sommelier", target: "aave-v3", type: "yield_source", evidence: "Sommelier vaults use Aave" },
    { source: "sommelier", target: "uniswap-v3", type: "yield_source", evidence: "Sommelier vaults use Uniswap" },
    { source: "sommelier", target: "compound-v3", type: "yield_source", evidence: "Sommelier vaults use Compound" },

    // Beefy integrations
    { source: "beefy", target: "curve-dex", type: "yield_source", evidence: "Beefy vaults farm Curve pools" },
    { source: "beefy", target: "convex-finance", type: "yield_source", evidence: "Beefy uses Convex for Curve boosting" },
    { source: "beefy", target: "aave-v3", type: "yield_source", evidence: "Beefy leverages Aave markets" },

    // Yearn integrations
    { source: "yearn-finance", target: "curve-dex", type: "yield_source", evidence: "Yearn vaults farm Curve" },
    { source: "yearn-finance", target: "aave-v3", type: "yield_source", evidence: "Yearn strategies use Aave" },
    { source: "yearn-finance", target: "compound-v3", type: "yield_source", evidence: "Yearn strategies use Compound" },

    // Convex integrations
    { source: "convex-finance", target: "curve-dex", type: "yield_source", evidence: "Convex boosts Curve rewards" },

    // Gearbox integrations
    { source: "gearbox", target: "curve-dex", type: "yield_source", evidence: "Gearbox leveraged strategies on Curve" },
    { source: "gearbox", target: "lido", type: "yield_source", evidence: "Gearbox leveraged stETH strategies" },
    { source: "gearbox", target: "convex-finance", type: "yield_source", evidence: "Gearbox leveraged Convex strategies" },

    // EigenLayer integrations
    { source: "eigenlayer", target: "lido", type: "yield_source", evidence: "EigenLayer restakes stETH" },
    { source: "eigenlayer", target: "rocket-pool", type: "yield_source", evidence: "EigenLayer restakes rETH" },

    // Kamino (Solana) integrations
    { source: "kamino-finance", target: "raydium", type: "yield_source", evidence: "Kamino optimizes Raydium LP" },
    { source: "kamino-finance", target: "orca", type: "yield_source", evidence: "Kamino optimizes Orca LP" },
    { source: "kamino-finance", target: "meteora", type: "yield_source", evidence: "Kamino integrates Meteora" },

    // Marinade integrations
    { source: "marinade-finance", target: "solend", type: "yield_source", evidence: "mSOL used in Solend" },

    // Aerodrome integrations
    { source: "aerodrome", target: "velodrome", type: "parent_child", evidence: "Aerodrome is Base fork of Velodrome" },

    // Layer 2 / Infrastructure integrations
    { source: "layerzero", target: "stargate", type: "integration", evidence: "Stargate built on LayerZero" },
];

async function fetchProtocols(): Promise<DefiLlamaProtocol[]> {
    console.log("📡 Fetching protocols from DeFiLlama...");

    const response = await fetch(DEFILLAMA_PROTOCOLS_API);
    if (!response.ok) {
        throw new Error(`Failed to fetch protocols: ${response.statusText}`);
    }

    const protocols: DefiLlamaProtocol[] = await response.json();
    console.log(`   ✅ Fetched ${protocols.length} protocols`);

    return protocols;
}

async function fetchYieldPools(): Promise<YieldPool[]> {
    console.log("📡 Fetching yield pools from DeFiLlama...");

    const response = await fetch(DEFILLAMA_YIELDS_API);
    if (!response.ok) {
        throw new Error(`Failed to fetch yields: ${response.statusText}`);
    }

    const data = await response.json();
    const pools: YieldPool[] = data.data || [];
    console.log(`   ✅ Fetched ${pools.length} yield pools`);

    return pools;
}

async function fetchPoolHistory(poolId: string): Promise<ChartDataPoint[]> {
    try {
        const response = await fetch(`${DEFILLAMA_CHART_API}/${poolId}`);
        if (!response.ok) {
            return [];
        }
        const data = await response.json();
        return data.data || [];
    } catch {
        return [];
    }
}

function calculateApyStability(history: ChartDataPoint[], days: number = 30): ApyStability | null {
    if (!history || history.length < 7) {
        return null; // Not enough data for meaningful stability calculation
    }

    // Get last N days of data
    const recentHistory = history.slice(-days);
    const apyValues = recentHistory
        .map(d => d.apy)
        .filter(apy => apy !== null && apy !== undefined && !isNaN(apy) && apy >= 0);

    if (apyValues.length < 7) {
        return null;
    }

    // Calculate statistics
    const avg = apyValues.reduce((a, b) => a + b, 0) / apyValues.length;
    const min = Math.min(...apyValues);
    const max = Math.max(...apyValues);

    // Calculate standard deviation
    const squaredDiffs = apyValues.map(apy => Math.pow(apy - avg, 2));
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / squaredDiffs.length;
    const stdDev = Math.sqrt(avgSquaredDiff);

    // Calculate coefficient of variation (CV) for normalized volatility
    // CV = (stdDev / mean) * 100, but handle zero/low mean cases
    const cv = avg > 0.1 ? (stdDev / avg) * 100 : stdDev * 10;

    // Calculate trend (compare first week avg vs last week avg)
    const firstWeek = apyValues.slice(0, 7);
    const lastWeek = apyValues.slice(-7);
    const firstWeekAvg = firstWeek.reduce((a, b) => a + b, 0) / firstWeek.length;
    const lastWeekAvg = lastWeek.reduce((a, b) => a + b, 0) / lastWeek.length;

    let trend: "up" | "down" | "stable";
    const trendThreshold = 0.1; // 10% change threshold
    if (lastWeekAvg > firstWeekAvg * (1 + trendThreshold)) {
        trend = "up";
    } else if (lastWeekAvg < firstWeekAvg * (1 - trendThreshold)) {
        trend = "down";
    } else {
        trend = "stable";
    }

    // Convert CV to stability score (0-100, higher = more stable)
    // CV of 0% = 100 score (perfect stability)
    // CV of 50% = 50 score (moderate volatility)
    // CV of 100%+ = 0 score (high volatility)
    const stabilityScore = Math.max(0, Math.min(100, 100 - cv));

    return {
        score: Math.round(stabilityScore),
        volatility: Math.round(stdDev * 100) / 100,
        avgApy: Math.round(avg * 100) / 100,
        minApy: Math.round(min * 100) / 100,
        maxApy: Math.round(max * 100) / 100,
        trend,
        dataPoints: apyValues.length,
    };
}

async function fetchHistoricalDataForPools(
    pools: ProcessedYieldPool[],
    maxPools: number = 500
): Promise<Map<string, ApyStability>> {
    console.log(`\n📈 Fetching historical APY data for top ${maxPools} pools...`);

    // Only fetch for pools with significant TVL to avoid rate limits
    const topPools = pools
        .filter(p => p.tvlUsd >= 1_000_000) // $1M+ TVL
        .slice(0, maxPools);

    console.log(`   Processing ${topPools.length} pools with >$1M TVL`);

    const stabilityMap = new Map<string, ApyStability>();
    let processed = 0;
    let withData = 0;

    // Process in batches to avoid overwhelming the API
    const batchSize = 10;
    const delayBetweenBatches = 500; // 500ms between batches

    for (let i = 0; i < topPools.length; i += batchSize) {
        const batch = topPools.slice(i, i + batchSize);

        // Fetch batch in parallel
        const results = await Promise.all(
            batch.map(async (pool) => {
                const history = await fetchPoolHistory(pool.id);
                const stability = calculateApyStability(history);
                return { poolId: pool.id, stability };
            })
        );

        // Store results
        for (const { poolId, stability } of results) {
            if (stability) {
                stabilityMap.set(poolId, stability);
                withData++;
            }
        }

        processed += batch.length;

        // Progress update every 100 pools
        if (processed % 100 === 0 || processed === topPools.length) {
            console.log(`   Progress: ${processed}/${topPools.length} pools (${withData} with stability data)`);
        }

        // Delay between batches (skip on last batch)
        if (i + batchSize < topPools.length) {
            await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
        }
    }

    console.log(`   ✅ Got stability data for ${withData} pools`);
    return stabilityMap;
}

/**
 * Calculate Liquidity Risk Index for a pool
 *
 * The Liquidity Risk measures how easily a curator can exit a position.
 * Key factors:
 * - Pool TVL: Larger pools = easier to exit
 * - Safe allocation: Generally 2-5% of pool TVL can be exited without major slippage
 * - Slippage estimation: Based on position size relative to pool depth
 *
 * For AMM pools: Slippage ≈ (position_size / pool_tvl) * constant_factor
 * For lending pools: Usually better liquidity (can withdraw available liquidity)
 */
function calculateLiquidityRisk(tvlUsd: number, projectSlug: string): LiquidityRisk {
    // Lending protocols typically have better exit liquidity than AMM pools
    const isLendingProtocol = [
        "aave", "aave-v3", "compound", "compound-v3", "morpho", "morpho-v1",
        "spark", "sparklend", "maker", "sky-lending", "maple", "euler",
        "euler-v2", "radiant", "benqi", "venus", "kamino-lend", "marginfi",
        "solend"
    ].some(p => projectSlug.includes(p));

    // Liquid staking protocols also have good liquidity
    const isLiquidStaking = [
        "lido", "rocket-pool", "jito", "marinade", "ether.fi", "frax-ether"
    ].some(p => projectSlug.includes(p));

    // Base slippage factor (AMM pools have higher slippage)
    // Lending protocols: ~0.5x slippage factor
    // Liquid staking: ~0.3x slippage factor
    // AMM pools: 1x slippage factor
    const slippageFactor = isLiquidStaking ? 0.3 : isLendingProtocol ? 0.5 : 1.0;

    // Safe allocation percentage based on pool size
    // Larger pools can safely hold larger positions
    let safeAllocationPercent: number;
    if (tvlUsd >= 1_000_000_000) {
        safeAllocationPercent = 5; // $1B+ pools: 5% is safe
    } else if (tvlUsd >= 100_000_000) {
        safeAllocationPercent = 3; // $100M-$1B: 3% is safe
    } else if (tvlUsd >= 10_000_000) {
        safeAllocationPercent = 2; // $10M-$100M: 2% is safe
    } else {
        safeAllocationPercent = 1; // <$10M: only 1% is safe
    }

    // Lending protocols can handle larger allocations
    if (isLendingProtocol) {
        safeAllocationPercent *= 2;
    }

    const maxSafeAllocation = tvlUsd * (safeAllocationPercent / 100);

    // Calculate slippage estimates at different position sizes
    // Formula: slippage% ≈ (position / tvl) * 100 * slippageFactor
    // This is a simplified model; real slippage depends on pool curve
    const calculateSlippage = (positionSize: number): number => {
        if (tvlUsd === 0) return 100;
        const ratio = positionSize / tvlUsd;
        // Slippage increases non-linearly with position size
        const slippage = ratio * 100 * slippageFactor * (1 + ratio * 2);
        return Math.min(Math.round(slippage * 100) / 100, 100);
    };

    const slippageEstimates = {
        at100k: calculateSlippage(100_000),
        at500k: calculateSlippage(500_000),
        at1m: calculateSlippage(1_000_000),
        at5m: calculateSlippage(5_000_000),
        at10m: calculateSlippage(10_000_000),
    };

    // Calculate overall liquidity risk score (0-100, lower = more liquid)
    // Based on:
    // - Pool TVL (larger = better)
    // - Slippage at $1M (common position size)
    // - Protocol type bonus
    let score: number;

    if (tvlUsd >= 1_000_000_000) {
        score = 5; // Excellent liquidity
    } else if (tvlUsd >= 500_000_000) {
        score = 10;
    } else if (tvlUsd >= 100_000_000) {
        score = 20;
    } else if (tvlUsd >= 50_000_000) {
        score = 30;
    } else if (tvlUsd >= 10_000_000) {
        score = 45;
    } else if (tvlUsd >= 5_000_000) {
        score = 60;
    } else if (tvlUsd >= 1_000_000) {
        score = 75;
    } else {
        score = 90; // Poor liquidity
    }

    // Adjust for protocol type
    if (isLendingProtocol) {
        score = Math.max(0, score - 10);
    }
    if (isLiquidStaking) {
        score = Math.max(0, score - 15);
    }

    // Adjust based on actual slippage at $1M
    if (slippageEstimates.at1m > 5) {
        score = Math.min(100, score + 10);
    } else if (slippageEstimates.at1m < 0.5) {
        score = Math.max(0, score - 10);
    }

    // Determine exitability rating
    let exitabilityRating: LiquidityRisk["exitabilityRating"];
    if (score <= 15) {
        exitabilityRating = "excellent";
    } else if (score <= 30) {
        exitabilityRating = "good";
    } else if (score <= 50) {
        exitabilityRating = "moderate";
    } else if (score <= 70) {
        exitabilityRating = "poor";
    } else {
        exitabilityRating = "very_poor";
    }

    return {
        score,
        poolTvl: tvlUsd,
        maxSafeAllocation,
        safeAllocationPercent,
        slippageEstimates,
        exitabilityRating,
    };
}

function buildParentChildRelationships(protocols: DefiLlamaProtocol[]): DefiRelationship[] {
    const relationships: DefiRelationship[] = [];
    const protocolBySlug = new Map(protocols.map(p => [p.slug, p]));

    for (const protocol of protocols) {
        if (protocol.parentProtocol) {
            // Parent protocol format is "parent#slug"
            const parentSlug = protocol.parentProtocol.replace("parent#", "");

            relationships.push({
                source: protocol.slug,
                target: parentSlug,
                type: "parent_child",
                weight: protocol.tvl || 0,
                evidence: `${protocol.name} is a version/fork of ${parentSlug}`,
            });
        }
    }

    console.log(`   📊 Found ${relationships.length} parent-child relationships`);
    return relationships;
}

function buildKnownIntegrations(protocols: DefiLlamaProtocol[]): DefiRelationship[] {
    const protocolSlugs = new Set(protocols.map(p => p.slug));
    const relationships: DefiRelationship[] = [];

    for (const integration of KNOWN_INTEGRATIONS) {
        // Only include if both protocols exist in DeFiLlama
        if (protocolSlugs.has(integration.source) && protocolSlugs.has(integration.target)) {
            const sourceProtocol = protocols.find(p => p.slug === integration.source);

            relationships.push({
                source: integration.source,
                target: integration.target,
                type: integration.type as DefiRelationship["type"],
                weight: sourceProtocol?.tvl || 0,
                evidence: integration.evidence,
            });
        }
    }

    console.log(`   📊 Added ${relationships.length} known integrations`);
    return relationships;
}

function buildSameEcosystemRelationships(protocols: DefiLlamaProtocol[]): DefiRelationship[] {
    const relationships: DefiRelationship[] = [];

    // Group protocols by category and chain
    const categoryChainMap = new Map<string, DefiLlamaProtocol[]>();

    for (const protocol of protocols) {
        // Only consider DeFi-relevant categories
        const relevantCategories = ["Lending", "Dexes", "Yield", "Yield Aggregator", "Liquid Staking", "Derivatives", "CDP"];
        if (!relevantCategories.includes(protocol.category)) continue;

        for (const chain of protocol.chains) {
            const key = `${protocol.category}:${chain}`;
            if (!categoryChainMap.has(key)) {
                categoryChainMap.set(key, []);
            }
            categoryChainMap.get(key)!.push(protocol);
        }
    }

    // Create relationships between top protocols in same category/chain
    for (const [key, protocolsInGroup] of categoryChainMap) {
        // Sort by TVL and take top 5
        const topProtocols = protocolsInGroup
            .filter(p => p.tvl > 10_000_000) // Only protocols with >$10M TVL
            .sort((a, b) => (b.tvl || 0) - (a.tvl || 0))
            .slice(0, 5);

        // Create relationships between top protocols (they likely integrate)
        for (let i = 0; i < topProtocols.length; i++) {
            for (let j = i + 1; j < topProtocols.length; j++) {
                const [category, chain] = key.split(":");
                relationships.push({
                    source: topProtocols[i].slug,
                    target: topProtocols[j].slug,
                    type: "same_ecosystem",
                    weight: Math.min(topProtocols[i].tvl || 0, topProtocols[j].tvl || 0),
                    chain,
                    evidence: `Both are ${category} protocols on ${chain}`,
                });
            }
        }
    }

    console.log(`   📊 Found ${relationships.length} same-ecosystem relationships`);
    return relationships;
}

// Established protocols with lower risk profiles
const ESTABLISHED_PROTOCOLS = new Set([
    "aave-v3", "aave", "compound-v3", "compound", "maker", "lido", "rocket-pool",
    "uniswap-v3", "uniswap", "curve-dex", "convex-finance", "yearn-finance",
    "balancer", "frax", "instadapp", "morpho", "spark", "sky-lending",
    "jito-liquid-staking", "marinade-finance", "raydium", "orca", "jupiter"
]);

// Known stablecoins for asset classification
const STABLECOINS = new Set([
    "USDC", "USDT", "DAI", "FRAX", "LUSD", "GUSD", "BUSD", "TUSD", "USDP",
    "USDD", "PYUSD", "GHO", "crvUSD", "DOLA", "MIM", "UST", "SUSD", "RAI",
    "USDS", "SUSDS", "USD0", "EURC", "EURT", "EURS"
]);

// Major assets with established track records
const BLUE_CHIP_ASSETS = new Set([
    "ETH", "WETH", "STETH", "WSTETH", "RETH", "CBETH", "WEETH",
    "BTC", "WBTC", "CBBTC", "TBTC",
    "SOL", "WSOL", "MSOL", "JITOSOL", "BSOL",
    ...STABLECOINS
]);

// Protocol dependencies map
const PROTOCOL_DEPENDENCIES: Record<string, string[]> = {
    "morpho": ["aave-v3", "compound-v3"],
    "pendle": ["lido", "rocket-pool", "aave-v3"],
    "sommelier": ["aave-v3", "uniswap-v3", "compound-v3"],
    "beefy": ["curve-dex", "convex-finance", "aave-v3"],
    "yearn-finance": ["curve-dex", "aave-v3", "compound-v3"],
    "convex-finance": ["curve-dex"],
    "gearbox": ["curve-dex", "lido", "convex-finance"],
    "eigenlayer": ["lido", "rocket-pool"],
    "ether.fi-stake": ["eigenlayer"],
    "kamino-finance": ["raydium", "orca", "meteora"],
    "kamino-lend": ["kamino-finance"],
    "marginfi": ["solend"],
    "aerodrome": ["velodrome"],
    "extra-finance": ["aerodrome", "velodrome"],
};

function parseUnderlyingAssets(symbol: string): string[] {
    // Parse pool symbol to extract underlying assets
    // Common formats: "USDC-USDT", "ETH/USDC", "stETH-ETH", "WETH-USDC-0.05%"
    const cleaned = symbol
        .replace(/[\(\)]/g, "")
        .replace(/-\d+(\.\d+)?%/g, "") // Remove percentage fees
        .replace(/\s+/g, "");

    const separators = /[-\/]/;
    const parts = cleaned.split(separators).filter(Boolean);

    // Normalize asset names
    return parts.map(asset => {
        const upper = asset.toUpperCase();
        // Map wrapped/staked versions to base assets
        if (upper === "WETH" || upper === "STETH" || upper === "WSTETH" || upper === "CBETH" || upper === "WEETH") return "ETH";
        if (upper === "WBTC" || upper === "CBBTC" || upper === "TBTC") return "BTC";
        if (upper === "WSOL" || upper === "MSOL" || upper === "JITOSOL" || upper === "BSOL") return "SOL";
        return upper;
    }).filter((v, i, a) => a.indexOf(v) === i); // Dedupe
}

function getProtocolDependencies(projectSlug: string, chain: string): PoolDependency[] {
    const deps: PoolDependency[] = [];

    // Add chain as infrastructure dependency
    const chainRisk = ["Ethereum", "Solana", "Arbitrum", "Base", "Optimism"].includes(chain) ? "low" : "medium";
    deps.push({ type: "chain", name: chain, risk: chainRisk as "low" | "medium" | "high" });

    // Add protocol dependencies from our map
    const protocolDeps = PROTOCOL_DEPENDENCIES[projectSlug] || [];
    for (const dep of protocolDeps) {
        const risk = ESTABLISHED_PROTOCOLS.has(dep) ? "low" : "medium";
        deps.push({ type: "protocol", name: dep, risk: risk as "low" | "medium" | "high" });
    }

    // All pools depend on oracles (Chainlink is most common)
    deps.push({ type: "oracle", name: "chainlink", risk: "low" });

    return deps;
}

function calculateRiskScore(
    pool: YieldPool,
    projectSlug: string,
    underlyingAssets: string[]
): { score: number; level: "low" | "medium" | "high" | "very_high"; breakdown: RiskBreakdown } {
    const breakdown: RiskBreakdown = {
        tvlScore: 0,
        apyScore: 0,
        stableScore: 0,
        ilScore: 0,
        protocolScore: 0,
    };

    // TVL Score (0-30): Higher TVL = lower risk
    // $1B+ = 0, $100M+ = 10, $10M+ = 20, <$10M = 30
    if (pool.tvlUsd >= 1_000_000_000) breakdown.tvlScore = 0;
    else if (pool.tvlUsd >= 100_000_000) breakdown.tvlScore = 10;
    else if (pool.tvlUsd >= 10_000_000) breakdown.tvlScore = 20;
    else breakdown.tvlScore = 30;

    // APY Score (0-25): Sustainable APY = lower risk
    // Very high APY is suspicious: >50% = 25, >20% = 15, >10% = 10, <10% = 0
    // Also penalize if reward APY is majority of total (less sustainable)
    const rewardRatio = pool.apyReward ? (pool.apyReward / (pool.apy || 1)) : 0;
    if (pool.apy > 50) breakdown.apyScore = 25;
    else if (pool.apy > 20) breakdown.apyScore = 15;
    else if (pool.apy > 10) breakdown.apyScore = 10;
    else breakdown.apyScore = 0;
    // Add penalty for high reward dependency
    if (rewardRatio > 0.7) breakdown.apyScore += 5;

    // Stablecoin Score (0-20): Stablecoins = lower risk
    const allStable = underlyingAssets.every(a => STABLECOINS.has(a));
    const hasStable = underlyingAssets.some(a => STABLECOINS.has(a));
    const allBlueChip = underlyingAssets.every(a => BLUE_CHIP_ASSETS.has(a));

    if (pool.stablecoin || allStable) breakdown.stableScore = 0;
    else if (hasStable && allBlueChip) breakdown.stableScore = 5;
    else if (allBlueChip) breakdown.stableScore = 10;
    else breakdown.stableScore = 20;

    // IL Score (0-15): Impermanent loss risk
    // Single asset or same-asset pairs = 0, correlated pairs = 5, uncorrelated = 15
    if (pool.ilRisk === "no") breakdown.ilScore = 0;
    else if (pool.ilRisk === "yes" && underlyingAssets.length <= 1) breakdown.ilScore = 0;
    else if (pool.exposure === "single") breakdown.ilScore = 0;
    else if (underlyingAssets.length === 2) {
        // Check if assets are correlated (e.g., ETH/stETH, USDC/USDT)
        const [a, b] = underlyingAssets;
        const correlated = (a === b) ||
            (a === "ETH" && b === "ETH") ||
            (STABLECOINS.has(a) && STABLECOINS.has(b));
        breakdown.ilScore = correlated ? 5 : 15;
    } else {
        breakdown.ilScore = 15;
    }

    // Protocol Score (0-10): Established protocols = lower risk
    if (ESTABLISHED_PROTOCOLS.has(projectSlug)) breakdown.protocolScore = 0;
    else if (pool.tvlUsd > 100_000_000) breakdown.protocolScore = 3; // Large TVL = some trust
    else breakdown.protocolScore = 10;

    // Calculate total score (0-100, lower = safer)
    const totalScore = breakdown.tvlScore + breakdown.apyScore + breakdown.stableScore +
                       breakdown.ilScore + breakdown.protocolScore;

    // Determine risk level
    let level: "low" | "medium" | "high" | "very_high";
    if (totalScore <= 20) level = "low";
    else if (totalScore <= 40) level = "medium";
    else if (totalScore <= 60) level = "high";
    else level = "very_high";

    return { score: totalScore, level, breakdown };
}

function processYieldPools(pools: YieldPool[], protocolSlugs: Set<string>): ProcessedYieldPool[] {
    // Filter pools with meaningful TVL and APY, and map project names to slugs
    const processed: ProcessedYieldPool[] = [];

    for (const pool of pools) {
        // Skip pools with very low TVL or invalid APY
        if (pool.tvlUsd < 100_000 || pool.apy <= 0 || pool.apy > 10000) continue;

        // Convert project name to slug format (lowercase, hyphens)
        const projectSlug = pool.project.toLowerCase().replace(/\s+/g, "-");

        // Parse underlying assets from symbol
        const underlyingAssets = parseUnderlyingAssets(pool.symbol);

        // Calculate risk score
        const { score, level, breakdown } = calculateRiskScore(pool, projectSlug, underlyingAssets);

        // Get protocol dependencies
        const dependencies = getProtocolDependencies(projectSlug, pool.chain);

        // Add asset dependencies
        for (const asset of underlyingAssets) {
            const assetRisk = BLUE_CHIP_ASSETS.has(asset) ? "low" : STABLECOINS.has(asset) ? "low" : "high";
            dependencies.push({ type: "asset", name: asset, risk: assetRisk as "low" | "medium" | "high" });
        }

        // Calculate liquidity risk
        const liquidityRisk = calculateLiquidityRisk(pool.tvlUsd, projectSlug);

        processed.push({
            id: pool.pool,
            chain: pool.chain,
            project: pool.project,
            projectSlug,
            symbol: pool.symbol,
            tvlUsd: pool.tvlUsd,
            apy: pool.apy,
            apyBase: pool.apyBase || 0,
            apyReward: pool.apyReward || 0,
            stablecoin: pool.stablecoin || false,
            ilRisk: pool.ilRisk || "unknown",
            poolMeta: pool.poolMeta || "",
            riskScore: score,
            riskLevel: level,
            riskBreakdown: breakdown,
            dependencies,
            underlyingAssets,
            apyStability: null, // Will be populated with historical data
            liquidityRisk,
        });
    }

    // Sort by TVL descending
    return processed.sort((a, b) => b.tvlUsd - a.tvlUsd);
}

async function main() {
    console.log("\n🔍 DeFi Protocol Relationship Analyzer\n");
    console.log("=".repeat(60));

    try {
        // Fetch data
        const [protocols, yieldPools] = await Promise.all([
            fetchProtocols(),
            fetchYieldPools(),
        ]);

        // Filter to relevant DeFi protocols (TVL > $1M)
        const defiProtocols = protocols.filter(p =>
            p.tvl > 1_000_000 &&
            p.category !== "CEX" &&
            p.category !== "Chain"
        );
        console.log(`   📊 Filtered to ${defiProtocols.length} DeFi protocols with >$1M TVL`);

        // Build protocol data map
        const protocolData: Record<string, DefiProtocolData> = {};
        for (const p of defiProtocols) {
            protocolData[p.slug] = {
                slug: p.slug,
                name: p.name,
                category: p.category,
                chains: p.chains,
                tvl: p.tvl,
                symbol: p.symbol,
                parentProtocol: p.parentProtocol,
                logo: p.logo,
                url: p.url,
                twitter: p.twitter,
                github: p.github,
            };
        }

        // Build relationships
        console.log("\n📊 Building relationships...");
        const parentChildRels = buildParentChildRelationships(defiProtocols);
        const knownIntegrations = buildKnownIntegrations(defiProtocols);
        const ecosystemRels = buildSameEcosystemRelationships(defiProtocols);

        // Combine and deduplicate relationships
        const allRelationships = [
            ...parentChildRels,
            ...knownIntegrations,
            ...ecosystemRels,
        ];

        // Deduplicate by source-target pair (keep highest weight)
        const relationshipMap = new Map<string, DefiRelationship>();
        for (const rel of allRelationships) {
            const key = `${rel.source}:${rel.target}`;
            const existing = relationshipMap.get(key);
            if (!existing || rel.weight > existing.weight) {
                relationshipMap.set(key, rel);
            }
        }
        const relationships = Array.from(relationshipMap.values());

        // Get unique categories
        const categories = [...new Set(defiProtocols.map(p => p.category))].sort();

        // Process yield pools
        const protocolSlugs = new Set(Object.keys(protocolData));
        const processedYields = processYieldPools(yieldPools, protocolSlugs);
        console.log(`   📊 Processed ${processedYields.length} yield pools with >$100K TVL`);

        // Fetch historical data for APY stability scores
        const stabilityMap = await fetchHistoricalDataForPools(processedYields, 500);

        // Attach stability data to pools
        for (const pool of processedYields) {
            const stability = stabilityMap.get(pool.id);
            if (stability) {
                pool.apyStability = stability;
            }
        }

        // Get unique chains from yields
        const chains = [...new Set(processedYields.map(y => y.chain))].sort();

        // Build final data
        const data: DefiRelationshipData = {
            protocols: protocolData,
            relationships,
            yields: processedYields,
            metadata: {
                fetchedAt: new Date().toISOString(),
                totalProtocols: Object.keys(protocolData).length,
                totalRelationships: relationships.length,
                totalYieldPools: processedYields.length,
                categories,
                chains,
            },
        };

        // Save to file
        const outputDir = path.join(process.cwd(), "data");
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const outputPath = path.join(outputDir, "defi-relationships.json");
        fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
        console.log(`\n💾 Saved to ${outputPath}`);

        // Print summary
        console.log("\n" + "=".repeat(60));
        console.log("📊 SUMMARY");
        console.log("=".repeat(60));
        console.log(`   Protocols: ${data.metadata.totalProtocols}`);
        console.log(`   Relationships: ${data.metadata.totalRelationships}`);
        console.log(`   Yield Pools: ${data.metadata.totalYieldPools}`);
        console.log(`   Categories: ${categories.length}`);
        console.log(`   Chains: ${chains.length}`);

        // Print top relationships by TVL
        console.log("\n🔗 TOP RELATIONSHIPS (by TVL):");
        const topRels = relationships
            .sort((a, b) => b.weight - a.weight)
            .slice(0, 20);

        for (const rel of topRels) {
            const tvlStr = rel.weight > 1_000_000_000
                ? `$${(rel.weight / 1_000_000_000).toFixed(1)}B`
                : `$${(rel.weight / 1_000_000).toFixed(0)}M`;
            console.log(`   ${rel.source} → ${rel.target} (${rel.type}, ${tvlStr})`);
        }

        // Print category breakdown
        console.log("\n📁 CATEGORIES:");
        const categoryCounts = new Map<string, number>();
        for (const p of defiProtocols) {
            categoryCounts.set(p.category, (categoryCounts.get(p.category) || 0) + 1);
        }
        const sortedCategories = [...categoryCounts.entries()].sort((a, b) => b[1] - a[1]);
        for (const [cat, count] of sortedCategories.slice(0, 15)) {
            console.log(`   ${cat}: ${count} protocols`);
        }

        // Print top yield pools
        console.log("\n💰 TOP YIELD POOLS (by TVL):");
        const topYields = processedYields.slice(0, 15);
        for (const pool of topYields) {
            const tvlStr = pool.tvlUsd > 1_000_000_000
                ? `$${(pool.tvlUsd / 1_000_000_000).toFixed(1)}B`
                : `$${(pool.tvlUsd / 1_000_000).toFixed(0)}M`;
            const apyStr = pool.apy.toFixed(2);
            console.log(`   ${pool.project} | ${pool.symbol} | ${pool.chain} | ${tvlStr} TVL | ${apyStr}% APY`);
        }

        // Print top APY pools (with significant TVL)
        console.log("\n🔥 TOP APY POOLS (TVL > $10M):");
        const highApyPools = processedYields
            .filter(p => p.tvlUsd > 10_000_000)
            .sort((a, b) => b.apy - a.apy)
            .slice(0, 15);
        for (const pool of highApyPools) {
            const tvlStr = pool.tvlUsd > 1_000_000_000
                ? `$${(pool.tvlUsd / 1_000_000_000).toFixed(1)}B`
                : `$${(pool.tvlUsd / 1_000_000).toFixed(0)}M`;
            const apyStr = pool.apy.toFixed(2);
            console.log(`   ${pool.project} | ${pool.symbol} | ${pool.chain} | ${apyStr}% APY | ${tvlStr} TVL`);
        }

        // Print risk score distribution
        console.log("\n🛡️  RISK SCORE DISTRIBUTION:");
        const riskCounts = { low: 0, medium: 0, high: 0, very_high: 0 };
        for (const pool of processedYields) {
            riskCounts[pool.riskLevel]++;
        }
        console.log(`   Low Risk (0-20):      ${riskCounts.low} pools`);
        console.log(`   Medium Risk (21-40):  ${riskCounts.medium} pools`);
        console.log(`   High Risk (41-60):    ${riskCounts.high} pools`);
        console.log(`   Very High Risk (61+): ${riskCounts.very_high} pools`);

        // Print lowest risk pools with decent APY
        console.log("\n✅ SAFEST POOLS (Low Risk + APY > 3%):");
        const safePools = processedYields
            .filter(p => p.riskLevel === "low" && p.apy >= 3)
            .sort((a, b) => a.riskScore - b.riskScore)
            .slice(0, 10);
        for (const pool of safePools) {
            const tvlStr = pool.tvlUsd > 1_000_000_000
                ? `$${(pool.tvlUsd / 1_000_000_000).toFixed(1)}B`
                : `$${(pool.tvlUsd / 1_000_000).toFixed(0)}M`;
            console.log(`   Risk:${pool.riskScore} | ${pool.project} | ${pool.symbol} | ${pool.apy.toFixed(2)}% APY | ${tvlStr}`);
        }

        // Print APY stability distribution
        const poolsWithStability = processedYields.filter(p => p.apyStability !== null);
        console.log(`\n📈 APY STABILITY (${poolsWithStability.length} pools with data):`);

        const stabilityCounts = { high: 0, medium: 0, low: 0, volatile: 0 };
        for (const pool of poolsWithStability) {
            const score = pool.apyStability!.score;
            if (score >= 80) stabilityCounts.high++;
            else if (score >= 50) stabilityCounts.medium++;
            else if (score >= 20) stabilityCounts.low++;
            else stabilityCounts.volatile++;
        }
        console.log(`   High Stability (80-100):    ${stabilityCounts.high} pools`);
        console.log(`   Medium Stability (50-79):   ${stabilityCounts.medium} pools`);
        console.log(`   Low Stability (20-49):      ${stabilityCounts.low} pools`);
        console.log(`   Volatile (<20):             ${stabilityCounts.volatile} pools`);

        // Print most stable pools with good APY
        console.log("\n📊 MOST STABLE + HIGH APY (Stability > 70, APY > 5%):");
        const stableHighApy = processedYields
            .filter(p => p.apyStability && p.apyStability.score >= 70 && p.apy >= 5)
            .sort((a, b) => (b.apyStability!.score * b.apy) - (a.apyStability!.score * a.apy))
            .slice(0, 10);
        for (const pool of stableHighApy) {
            const tvlStr = pool.tvlUsd > 1_000_000_000
                ? `$${(pool.tvlUsd / 1_000_000_000).toFixed(1)}B`
                : `$${(pool.tvlUsd / 1_000_000).toFixed(0)}M`;
            const stability = pool.apyStability!;
            const trendIcon = stability.trend === "up" ? "↑" : stability.trend === "down" ? "↓" : "→";
            console.log(`   Stab:${stability.score} ${trendIcon} | ${pool.project} | ${pool.symbol} | ${pool.apy.toFixed(2)}% APY (${stability.minApy}-${stability.maxApy}%) | ${tvlStr}`);
        }

        // Print optimal curator picks (low risk + high stability + decent APY)
        console.log("\n🎯 OPTIMAL CURATOR PICKS (Low Risk + High Stability + APY > 3%):");
        const optimalPicks = processedYields
            .filter(p =>
                p.riskLevel === "low" &&
                p.apyStability &&
                p.apyStability.score >= 60 &&
                p.apy >= 3
            )
            .sort((a, b) => {
                // Score = APY * stability * (100 - risk) / 10000
                const scoreA = a.apy * a.apyStability!.score * (100 - a.riskScore);
                const scoreB = b.apy * b.apyStability!.score * (100 - b.riskScore);
                return scoreB - scoreA;
            })
            .slice(0, 10);
        for (const pool of optimalPicks) {
            const tvlStr = pool.tvlUsd > 1_000_000_000
                ? `$${(pool.tvlUsd / 1_000_000_000).toFixed(1)}B`
                : `$${(pool.tvlUsd / 1_000_000).toFixed(0)}M`;
            const stability = pool.apyStability!;
            const trendIcon = stability.trend === "up" ? "↑" : stability.trend === "down" ? "↓" : "→";
            console.log(`   Risk:${pool.riskScore} Stab:${stability.score}${trendIcon} | ${pool.project} | ${pool.symbol} | ${pool.apy.toFixed(2)}% APY | ${tvlStr}`);
        }

        // Print liquidity risk distribution
        console.log("\n💧 LIQUIDITY RISK DISTRIBUTION:");
        const liquidityCounts = { excellent: 0, good: 0, moderate: 0, poor: 0, very_poor: 0 };
        for (const pool of processedYields) {
            liquidityCounts[pool.liquidityRisk.exitabilityRating]++;
        }
        console.log(`   Excellent (≤15):  ${liquidityCounts.excellent} pools`);
        console.log(`   Good (16-30):     ${liquidityCounts.good} pools`);
        console.log(`   Moderate (31-50): ${liquidityCounts.moderate} pools`);
        console.log(`   Poor (51-70):     ${liquidityCounts.poor} pools`);
        console.log(`   Very Poor (71+):  ${liquidityCounts.very_poor} pools`);

        // Print best liquidity pools with good APY
        console.log("\n🏊 BEST EXIT LIQUIDITY (Excellent/Good + APY > 3%):");
        const liquidPools = processedYields
            .filter(p =>
                (p.liquidityRisk.exitabilityRating === "excellent" || p.liquidityRisk.exitabilityRating === "good") &&
                p.apy >= 3
            )
            .sort((a, b) => a.liquidityRisk.score - b.liquidityRisk.score)
            .slice(0, 10);
        for (const pool of liquidPools) {
            const tvlStr = pool.tvlUsd > 1_000_000_000
                ? `$${(pool.tvlUsd / 1_000_000_000).toFixed(1)}B`
                : `$${(pool.tvlUsd / 1_000_000).toFixed(0)}M`;
            const maxAlloc = pool.liquidityRisk.maxSafeAllocation > 1_000_000
                ? `$${(pool.liquidityRisk.maxSafeAllocation / 1_000_000).toFixed(1)}M`
                : `$${(pool.liquidityRisk.maxSafeAllocation / 1_000).toFixed(0)}K`;
            console.log(`   Liq:${pool.liquidityRisk.score} | ${pool.project} | ${pool.symbol} | ${pool.apy.toFixed(2)}% APY | ${tvlStr} | Max Safe: ${maxAlloc}`);
        }

        // Print ultimate curator picks (all factors combined)
        console.log("\n🏆 ULTIMATE CURATOR PICKS (Low Risk + Stable + Liquid + APY > 3%):");
        const ultimatePicks = processedYields
            .filter(p =>
                p.riskLevel === "low" &&
                p.liquidityRisk.score <= 30 &&
                p.apyStability &&
                p.apyStability.score >= 60 &&
                p.apy >= 3
            )
            .sort((a, b) => {
                // Combined score: APY * stability * (100 - risk) * (100 - liquidity) / 1000000
                const scoreA = a.apy * a.apyStability!.score * (100 - a.riskScore) * (100 - a.liquidityRisk.score);
                const scoreB = b.apy * b.apyStability!.score * (100 - b.riskScore) * (100 - b.liquidityRisk.score);
                return scoreB - scoreA;
            })
            .slice(0, 10);
        for (const pool of ultimatePicks) {
            const tvlStr = pool.tvlUsd > 1_000_000_000
                ? `$${(pool.tvlUsd / 1_000_000_000).toFixed(1)}B`
                : `$${(pool.tvlUsd / 1_000_000).toFixed(0)}M`;
            const stability = pool.apyStability!;
            const trendIcon = stability.trend === "up" ? "↑" : stability.trend === "down" ? "↓" : "→";
            const maxAlloc = pool.liquidityRisk.maxSafeAllocation > 1_000_000
                ? `$${(pool.liquidityRisk.maxSafeAllocation / 1_000_000).toFixed(0)}M`
                : `$${(pool.liquidityRisk.maxSafeAllocation / 1_000).toFixed(0)}K`;
            console.log(`   R:${pool.riskScore} S:${stability.score}${trendIcon} L:${pool.liquidityRisk.score} | ${pool.project} | ${pool.symbol} | ${pool.apy.toFixed(2)}% | ${tvlStr} | Safe:${maxAlloc}`);
        }

        console.log("\n" + "=".repeat(60));
        console.log("✅ Done!\n");

    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
}

main();
