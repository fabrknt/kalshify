import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

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

interface DefiRelationship {
    source: string;
    target: string;
    type: "parent_child" | "yield_source" | "same_ecosystem" | "integration";
    weight: number;
    chain?: string;
    evidence: string;
}

interface PoolDependency {
    type: "protocol" | "asset" | "oracle" | "chain";
    name: string;
    risk: "low" | "medium" | "high";
}

interface RiskBreakdown {
    tvlScore: number;
    apyScore: number;
    stableScore: number;
    ilScore: number;
    protocolScore: number;
}

interface ApyStability {
    score: number;              // 0-100, higher = more stable
    volatility: number;         // Standard deviation of APY
    avgApy: number;             // Average APY over period
    minApy: number;             // Minimum APY observed
    maxApy: number;             // Maximum APY observed
    trend: "up" | "down" | "stable";  // Recent trend direction
    dataPoints: number;         // Number of data points used
}

interface LiquidityRisk {
    score: number;              // 0-100, lower = more liquid (safer to exit)
    poolTvl: number;            // Total pool TVL in USD
    maxSafeAllocation: number;  // Max position size for safe exit (in USD)
    safeAllocationPercent: number;  // What % of pool is safe to hold
    slippageEstimates: {        // Estimated slippage at different position sizes
        at100k: number;
        at500k: number;
        at1m: number;
        at5m: number;
        at10m: number;
    };
    exitabilityRating: "excellent" | "good" | "moderate" | "poor" | "very_poor";
}

interface YieldPool {
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
    riskScore: number;
    riskLevel: "low" | "medium" | "high" | "very_high";
    riskBreakdown: RiskBreakdown;
    dependencies: PoolDependency[];
    underlyingAssets: string[];
    apyStability: ApyStability | null;
    liquidityRisk: LiquidityRisk;
}

interface DefiRelationshipData {
    protocols: Record<string, DefiProtocolData>;
    relationships: DefiRelationship[];
    yields: YieldPool[];
    metadata: {
        fetchedAt: string;
        totalProtocols: number;
        totalRelationships: number;
        totalYieldPools: number;
        categories: string[];
        chains: string[];
    };
}

// Load DeFi relationships data
function loadDefiData(): DefiRelationshipData | null {
    try {
        const dataPath = path.join(process.cwd(), "data", "defi-relationships.json");
        if (!fs.existsSync(dataPath)) {
            return null;
        }
        const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
        return data;
    } catch (error) {
        console.error("Error loading DeFi data:", error);
        return null;
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const chain = searchParams.get("chain");
    const type = searchParams.get("type"); // relationship type filter
    const minTvl = parseInt(searchParams.get("minTvl") || "0");
    const limit = parseInt(searchParams.get("limit") || "100");

    // Yields filters
    const yieldsOnly = searchParams.get("yieldsOnly") === "true";
    const minApy = parseFloat(searchParams.get("minApy") || "0");
    const maxApy = parseFloat(searchParams.get("maxApy") || "10000");
    const stablecoinOnly = searchParams.get("stablecoinOnly") === "true";
    const riskLevel = searchParams.get("riskLevel"); // low, medium, high, very_high
    const maxRiskScore = parseInt(searchParams.get("maxRiskScore") || "100");
    const sortBy = searchParams.get("sortBy") || "tvl"; // tvl, apy, risk, stability, liquidity
    const yieldLimit = parseInt(searchParams.get("yieldLimit") || "100");

    // Stability filters
    const minStability = parseInt(searchParams.get("minStability") || "0");
    const stableOnly = searchParams.get("stableOnly") === "true"; // Only pools with stability data
    const trend = searchParams.get("trend"); // up, down, stable

    // Liquidity filters
    const maxLiquidityRisk = parseInt(searchParams.get("maxLiquidityRisk") || "100");
    const exitability = searchParams.get("exitability"); // excellent, good, moderate, poor, very_poor
    const minSafeAllocation = parseInt(searchParams.get("minSafeAllocation") || "0"); // minimum safe allocation in USD

    const data = loadDefiData();

    if (!data) {
        return NextResponse.json({
            protocols: [],
            relationships: [],
            yields: [],
            nodes: [],
            links: [],
            metadata: {
                totalProtocols: 0,
                totalRelationships: 0,
                totalYieldPools: 0,
                message: "DeFi relationship data not found. Run 'npm run fetch:defi' to fetch data.",
            },
        });
    }

    // Filter protocols
    let filteredProtocols = Object.values(data.protocols);

    if (category) {
        filteredProtocols = filteredProtocols.filter(p =>
            p.category.toLowerCase() === category.toLowerCase()
        );
    }

    if (chain) {
        filteredProtocols = filteredProtocols.filter(p =>
            p.chains.some(c => c.toLowerCase() === chain.toLowerCase())
        );
    }

    if (minTvl > 0) {
        filteredProtocols = filteredProtocols.filter(p => p.tvl >= minTvl);
    }

    // Sort by TVL and limit
    filteredProtocols = filteredProtocols
        .sort((a, b) => b.tvl - a.tvl)
        .slice(0, limit);

    const protocolSlugs = new Set(filteredProtocols.map(p => p.slug));

    // Filter relationships to only include filtered protocols
    let filteredRelationships = data.relationships.filter(r =>
        protocolSlugs.has(r.source) || protocolSlugs.has(r.target)
    );

    if (type) {
        filteredRelationships = filteredRelationships.filter(r => r.type === type);
    }

    // Filter yields
    let filteredYields = data.yields || [];

    if (chain) {
        filteredYields = filteredYields.filter(y =>
            y.chain.toLowerCase() === chain.toLowerCase()
        );
    }

    if (minApy > 0) {
        filteredYields = filteredYields.filter(y => y.apy >= minApy);
    }

    if (maxApy < 10000) {
        filteredYields = filteredYields.filter(y => y.apy <= maxApy);
    }

    if (stablecoinOnly) {
        filteredYields = filteredYields.filter(y => y.stablecoin);
    }

    if (minTvl > 0) {
        filteredYields = filteredYields.filter(y => y.tvlUsd >= minTvl);
    }

    // Risk filtering
    if (riskLevel) {
        filteredYields = filteredYields.filter(y => y.riskLevel === riskLevel);
    }

    if (maxRiskScore < 100) {
        filteredYields = filteredYields.filter(y => y.riskScore <= maxRiskScore);
    }

    // Stability filtering
    if (stableOnly) {
        filteredYields = filteredYields.filter(y => y.apyStability !== null);
    }

    if (minStability > 0) {
        filteredYields = filteredYields.filter(y =>
            y.apyStability && y.apyStability.score >= minStability
        );
    }

    if (trend) {
        filteredYields = filteredYields.filter(y =>
            y.apyStability && y.apyStability.trend === trend
        );
    }

    // Liquidity filtering
    if (maxLiquidityRisk < 100) {
        filteredYields = filteredYields.filter(y =>
            y.liquidityRisk && y.liquidityRisk.score <= maxLiquidityRisk
        );
    }

    if (exitability) {
        filteredYields = filteredYields.filter(y =>
            y.liquidityRisk && y.liquidityRisk.exitabilityRating === exitability
        );
    }

    if (minSafeAllocation > 0) {
        filteredYields = filteredYields.filter(y =>
            y.liquidityRisk && y.liquidityRisk.maxSafeAllocation >= minSafeAllocation
        );
    }

    // Sort yields
    if (sortBy === "apy") {
        filteredYields = filteredYields.sort((a, b) => b.apy - a.apy);
    } else if (sortBy === "risk") {
        filteredYields = filteredYields.sort((a, b) => a.riskScore - b.riskScore);
    } else if (sortBy === "stability") {
        // Sort by stability score (highest first), pools without data go to end
        filteredYields = filteredYields.sort((a, b) => {
            const aScore = a.apyStability?.score ?? -1;
            const bScore = b.apyStability?.score ?? -1;
            return bScore - aScore;
        });
    } else if (sortBy === "liquidity") {
        // Sort by liquidity risk (lowest first = most liquid)
        filteredYields = filteredYields.sort((a, b) => {
            const aScore = a.liquidityRisk?.score ?? 100;
            const bScore = b.liquidityRisk?.score ?? 100;
            return aScore - bScore;
        });
    } else {
        filteredYields = filteredYields.sort((a, b) => b.tvlUsd - a.tvlUsd);
    }

    // Limit yields
    filteredYields = filteredYields.slice(0, yieldLimit);

    // Build graph data for visualization
    const nodes = filteredProtocols.map(p => ({
        id: p.slug,
        name: p.name,
        category: p.category,
        chains: p.chains,
        tvl: p.tvl,
        symbol: p.symbol,
        logo: p.logo,
        // Node size based on TVL (log scale)
        val: Math.log10(p.tvl + 1) * 2,
    }));

    const links = filteredRelationships
        .filter(r => protocolSlugs.has(r.source) && protocolSlugs.has(r.target))
        .map(r => ({
            source: r.source,
            target: r.target,
            type: r.type,
            weight: r.weight,
            evidence: r.evidence,
        }));

    return NextResponse.json({
        protocols: filteredProtocols,
        relationships: filteredRelationships,
        yields: filteredYields,
        nodes,
        links,
        metadata: {
            totalProtocols: filteredProtocols.length,
            totalRelationships: filteredRelationships.length,
            totalYieldPools: filteredYields.length,
            categories: data.metadata.categories,
            chains: data.metadata.chains || [],
            fetchedAt: data.metadata.fetchedAt,
        },
    });
}
