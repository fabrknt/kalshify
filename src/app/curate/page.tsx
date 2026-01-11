"use client";

import { useEffect, useState, Fragment, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
    Network,
    TrendingUp,
    TrendingDown,
    Loader2,
    DollarSign,
    Percent,
    Coins,
    ArrowUpDown,
    Shield,
    AlertTriangle,
    CheckCircle,
    Info,
    ChevronDown,
    ChevronUp,
    Layers,
    Activity,
    ArrowRight,
    Droplet,
    Building2,
    Bookmark,
} from "lucide-react";
import { WatchlistButton } from "@/components/curate/watchlist-button";
import { ApyHistoryChart } from "@/components/curate/apy-history-chart";

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
    score: number;
    volatility: number;
    avgApy: number;
    minApy: number;
    maxApy: number;
    trend: "up" | "down" | "stable";
    dataPoints: number;
}

interface LiquidityRisk {
    score: number;
    poolTvl: number;
    maxSafeAllocation: number;
    safeAllocationPercent: number;
    slippageEstimates: {
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

interface DefiGraphData {
    yields: YieldPool[];
    metadata: {
        totalProtocols: number;
        totalYieldPools: number;
        categories: string[];
        chains: string[];
        fetchedAt: string;
    };
}

const CHAIN_OPTIONS = [
    { value: "", label: "All Chains" },
    { value: "Ethereum", label: "Ethereum" },
    { value: "Arbitrum", label: "Arbitrum" },
    { value: "Base", label: "Base" },
    { value: "Optimism", label: "Optimism" },
    { value: "Polygon", label: "Polygon" },
    { value: "Solana", label: "Solana" },
    { value: "Avalanche", label: "Avalanche" },
    { value: "BSC", label: "BSC" },
];

const RISK_COLORS = {
    low: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/30" },
    medium: { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/30" },
    high: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/30" },
    very_high: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30" },
};

function formatTvl(tvl: number): string {
    if (tvl >= 1_000_000_000) {
        return `$${(tvl / 1_000_000_000).toFixed(2)}B`;
    }
    if (tvl >= 1_000_000) {
        return `$${(tvl / 1_000_000).toFixed(1)}M`;
    }
    return `$${(tvl / 1_000).toFixed(0)}K`;
}

function formatApy(apy: number): string {
    if (apy >= 100) {
        return `${apy.toFixed(0)}%`;
    }
    return `${apy.toFixed(2)}%`;
}

function RiskBadge({ level, score }: { level: string; score: number }) {
    const colors = RISK_COLORS[level as keyof typeof RISK_COLORS] || RISK_COLORS.high;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}`}>
            {level === "low" && <CheckCircle className="h-3 w-3" />}
            {level === "medium" && <Info className="h-3 w-3" />}
            {(level === "high" || level === "very_high") && <AlertTriangle className="h-3 w-3" />}
            {score}
        </span>
    );
}

function StabilityBadge({ stability }: { stability: ApyStability | null }) {
    if (!stability) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-700/50 text-slate-500 border border-slate-600/30">
                —
            </span>
        );
    }

    const { score, trend } = stability;

    const getColors = () => {
        if (score >= 80) return { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/30" };
        if (score >= 50) return { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/30" };
        if (score >= 20) return { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/30" };
        return { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/30" };
    };

    const colors = getColors();
    const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : ArrowRight;

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}`}>
            <Activity className="h-3 w-3" />
            {score}
            <TrendIcon className="h-3 w-3 ml-0.5" />
        </span>
    );
}

function LiquidityBadge({ liquidity }: { liquidity: LiquidityRisk | undefined }) {
    if (!liquidity) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-700/50 text-slate-500 border border-slate-600/30">
                —
            </span>
        );
    }

    const { score } = liquidity;

    const getColors = () => {
        if (score <= 15) return { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30" };
        if (score <= 30) return { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/30" };
        if (score <= 50) return { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/30" };
        if (score <= 70) return { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/30" };
        return { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30" };
    };

    const colors = getColors();

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}`}>
            <Droplet className="h-3 w-3" />
            {score}
        </span>
    );
}

function formatSafeAllocation(amount: number): string {
    if (amount >= 1_000_000_000) {
        return `$${(amount / 1_000_000_000).toFixed(1)}B`;
    }
    if (amount >= 1_000_000) {
        return `$${(amount / 1_000_000).toFixed(1)}M`;
    }
    return `$${(amount / 1_000).toFixed(0)}K`;
}

function DependencyChips({ dependencies }: { dependencies: PoolDependency[] }) {
    const protocols = dependencies.filter(d => d.type === "protocol");
    const assets = dependencies.filter(d => d.type === "asset");
    const chain = dependencies.find(d => d.type === "chain");

    return (
        <div className="flex flex-wrap gap-1">
            {chain && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                    {chain.name}
                </span>
            )}
            {protocols.map((p, i) => (
                <span key={i} className={`text-xs px-1.5 py-0.5 rounded ${
                    p.risk === "low" ? "bg-green-900/50 text-green-300" :
                    p.risk === "medium" ? "bg-yellow-900/50 text-yellow-300" :
                    "bg-red-900/50 text-red-300"
                }`}>
                    {p.name}
                </span>
            ))}
            {assets.slice(0, 3).map((a, i) => (
                <span key={i} className="text-xs px-1.5 py-0.5 rounded bg-purple-900/50 text-purple-300">
                    {a.name}
                </span>
            ))}
        </div>
    );
}

function ExpandedPoolDetails({ pool }: { pool: YieldPool }) {
    const { riskBreakdown, apyStability, liquidityRisk } = pool;

    return (
        <div className="bg-slate-800/50 p-4 border-t border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {/* Risk Breakdown */}
                <div>
                    <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-cyan-400" />
                        Risk Breakdown (Lower = Safer)
                    </h4>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-400">TVL Risk</span>
                            <span className={riskBreakdown.tvlScore <= 10 ? "text-green-400" : riskBreakdown.tvlScore <= 20 ? "text-yellow-400" : "text-red-400"}>
                                {riskBreakdown.tvlScore}/30
                            </span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-400">APY Sustainability</span>
                            <span className={riskBreakdown.apyScore <= 10 ? "text-green-400" : riskBreakdown.apyScore <= 15 ? "text-yellow-400" : "text-red-400"}>
                                {riskBreakdown.apyScore}/25
                            </span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Asset Volatility</span>
                            <span className={riskBreakdown.stableScore <= 5 ? "text-green-400" : riskBreakdown.stableScore <= 10 ? "text-yellow-400" : "text-red-400"}>
                                {riskBreakdown.stableScore}/20
                            </span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-400">IL Risk</span>
                            <span className={riskBreakdown.ilScore <= 5 ? "text-green-400" : riskBreakdown.ilScore <= 10 ? "text-yellow-400" : "text-red-400"}>
                                {riskBreakdown.ilScore}/15
                            </span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Protocol Risk</span>
                            <span className={riskBreakdown.protocolScore <= 3 ? "text-green-400" : riskBreakdown.protocolScore <= 5 ? "text-yellow-400" : "text-red-400"}>
                                {riskBreakdown.protocolScore}/10
                            </span>
                        </div>
                        <div className="border-t border-slate-700 pt-2 flex justify-between text-sm font-semibold">
                            <span className="text-white">Total Risk Score</span>
                            <span className={pool.riskScore <= 20 ? "text-green-400" : pool.riskScore <= 40 ? "text-yellow-400" : "text-red-400"}>
                                {pool.riskScore}/100
                            </span>
                        </div>
                    </div>
                </div>

                {/* APY History Chart */}
                <div className="lg:col-span-2">
                    <ApyHistoryChart poolId={pool.id} />
                </div>

                {/* Liquidity Risk */}
                <div>
                    <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                        <Droplet className="h-4 w-4 text-cyan-400" />
                        Liquidity Risk (Lower = Easier Exit)
                    </h4>
                    {liquidityRisk ? (
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Liquidity Score</span>
                                <span className={liquidityRisk.score <= 15 ? "text-blue-400" : liquidityRisk.score <= 30 ? "text-cyan-400" : liquidityRisk.score <= 50 ? "text-yellow-400" : "text-orange-400"}>
                                    {liquidityRisk.score}/100
                                </span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Exitability</span>
                                <span className={`capitalize ${
                                    liquidityRisk.exitabilityRating === "excellent" ? "text-blue-400" :
                                    liquidityRisk.exitabilityRating === "good" ? "text-cyan-400" :
                                    liquidityRisk.exitabilityRating === "moderate" ? "text-yellow-400" :
                                    "text-orange-400"
                                }`}>
                                    {liquidityRisk.exitabilityRating.replace("_", " ")}
                                </span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Max Safe Allocation</span>
                                <span className="text-slate-300">{formatSafeAllocation(liquidityRisk.maxSafeAllocation)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Safe % of Pool</span>
                                <span className="text-slate-300">{liquidityRisk.safeAllocationPercent}%</span>
                            </div>
                            <div className="border-t border-slate-700 pt-2 mt-2">
                                <span className="text-slate-500 text-xs">Est. Slippage:</span>
                                <div className="grid grid-cols-2 gap-1 mt-1 text-xs">
                                    <span className="text-slate-400">$100K:</span>
                                    <span className={liquidityRisk.slippageEstimates.at100k < 0.5 ? "text-green-400" : liquidityRisk.slippageEstimates.at100k < 1 ? "text-yellow-400" : "text-orange-400"}>
                                        {liquidityRisk.slippageEstimates.at100k}%
                                    </span>
                                    <span className="text-slate-400">$1M:</span>
                                    <span className={liquidityRisk.slippageEstimates.at1m < 0.5 ? "text-green-400" : liquidityRisk.slippageEstimates.at1m < 2 ? "text-yellow-400" : "text-orange-400"}>
                                        {liquidityRisk.slippageEstimates.at1m}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-xs text-slate-500 italic">
                            No liquidity data available. Run fetch:defi to update.
                        </div>
                    )}
                </div>

                {/* Dependencies */}
                <div>
                    <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                        <Layers className="h-4 w-4 text-cyan-400" />
                        Dependencies
                    </h4>
                    <div className="space-y-2">
                        {pool.dependencies.filter(d => d.type === "chain").map((d, i) => (
                            <div key={i} className="flex items-center justify-between text-xs">
                                <span className="text-slate-400">Chain</span>
                                <span className={`px-2 py-0.5 rounded ${
                                    d.risk === "low" ? "bg-green-900/50 text-green-300" : "bg-yellow-900/50 text-yellow-300"
                                }`}>{d.name}</span>
                            </div>
                        ))}
                        {pool.dependencies.filter(d => d.type === "protocol").length > 0 && (
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400">Protocols</span>
                                <div className="flex gap-1 flex-wrap justify-end">
                                    {pool.dependencies.filter(d => d.type === "protocol").map((d, i) => (
                                        <span key={i} className={`px-2 py-0.5 rounded ${
                                            d.risk === "low" ? "bg-green-900/50 text-green-300" :
                                            d.risk === "medium" ? "bg-yellow-900/50 text-yellow-300" :
                                            "bg-red-900/50 text-red-300"
                                        }`}>{d.name}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">Assets</span>
                            <div className="flex gap-1 flex-wrap justify-end">
                                {pool.underlyingAssets.map((a, i) => (
                                    <span key={i} className="px-2 py-0.5 rounded bg-purple-900/50 text-purple-300">
                                        {a}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">Oracle</span>
                            <span className="px-2 py-0.5 rounded bg-blue-900/50 text-blue-300">Chainlink</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

type SortField = "tvl" | "apy" | "risk" | "stability" | "liquidity";
type TabType = "all" | "watchlist";

export default function CuratePage() {
    const { data: session } = useSession();
    const [graphData, setGraphData] = useState<DefiGraphData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedPool, setExpandedPool] = useState<string | null>(null);

    // Tab state
    const [activeTab, setActiveTab] = useState<TabType>("all");

    // Watchlist state
    const [watchlistPoolIds, setWatchlistPoolIds] = useState<Set<string>>(new Set());
    const [watchlistLoading, setWatchlistLoading] = useState(false);

    // Filters
    const [chain, setChain] = useState("");
    const [minTvl, setMinTvl] = useState(1_000_000);
    const [minApy, setMinApy] = useState(0);
    const [stablecoinOnly, setStablecoinOnly] = useState(false);
    const [riskFilter, setRiskFilter] = useState<string>("");
    const [sortBy, setSortBy] = useState<SortField>("tvl");

    // Fetch watchlist on mount if authenticated
    useEffect(() => {
        async function fetchWatchlist() {
            if (!session?.user) return;

            setWatchlistLoading(true);
            try {
                const response = await fetch("/api/watchlist/yields");
                if (response.ok) {
                    const data = await response.json();
                    setWatchlistPoolIds(new Set(data.poolIds));
                }
            } catch (err) {
                console.error("Failed to fetch watchlist:", err);
            } finally {
                setWatchlistLoading(false);
            }
        }

        fetchWatchlist();
    }, [session?.user]);

    // Handle watchlist toggle
    const handleWatchlistToggle = useCallback((poolId: string, isAdding: boolean) => {
        setWatchlistPoolIds((prev) => {
            const next = new Set(prev);
            if (isAdding) {
                next.add(poolId);
            } else {
                next.delete(poolId);
            }
            return next;
        });
    }, []);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (chain) params.set("chain", chain);
                params.set("minTvl", minTvl.toString());
                params.set("minApy", minApy.toString());
                if (stablecoinOnly) params.set("stablecoinOnly", "true");
                if (riskFilter) params.set("riskLevel", riskFilter);
                params.set("sortBy", sortBy);
                params.set("yieldLimit", "200");
                params.set("limit", "100");

                const response = await fetch(`/api/curate/defi?${params}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch DeFi data");
                }
                const data = await response.json();
                setGraphData(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [chain, minTvl, minApy, stablecoinOnly, riskFilter, sortBy]);

    // Filter yields based on active tab
    const filteredYields = graphData?.yields.filter((pool) => {
        if (activeTab === "watchlist") {
            return watchlistPoolIds.has(pool.id);
        }
        return true;
    }) || [];

    const riskStats = filteredYields.reduce(
        (acc, y) => {
            acc[y.riskLevel]++;
            return acc;
        },
        { low: 0, medium: 0, high: 0, very_high: 0 }
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-foreground">CURATE</h1>
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-400/10 text-cyan-400 border border-cyan-400/30 text-xs font-semibold font-mono">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                        </span>
                        PREVIEW
                    </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Risk Scoring & Yield Analysis</p>
                <p className="text-muted-foreground">
                    The intelligence layer for DeFi curators. Risk scoring, APY stability, liquidity risk — building toward AI-powered curation.
                </p>
            </div>

            {/* Quick Navigation */}
            <div className="flex gap-3">
                <Link
                    href="/curate/protocols"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:border-cyan-400/50 text-slate-300 hover:text-white transition-colors text-sm"
                >
                    <Building2 className="h-4 w-4" />
                    Browse Protocols
                    <ArrowRight className="h-3 w-3" />
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-900 p-1 rounded-lg w-fit">
                <button
                    onClick={() => setActiveTab("all")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeTab === "all"
                            ? "bg-slate-800 text-white"
                            : "text-slate-400 hover:text-white"
                    }`}
                >
                    All Yields
                </button>
                <button
                    onClick={() => setActiveTab("watchlist")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                        activeTab === "watchlist"
                            ? "bg-slate-800 text-white"
                            : "text-slate-400 hover:text-white"
                    }`}
                >
                    <Bookmark className={`h-4 w-4 ${watchlistPoolIds.size > 0 ? "fill-current text-yellow-400" : ""}`} />
                    Watchlist
                    {watchlistPoolIds.size > 0 && (
                        <span className="bg-yellow-400/20 text-yellow-400 px-1.5 py-0.5 rounded text-xs">
                            {watchlistPoolIds.size}
                        </span>
                    )}
                </button>
            </div>

            {/* Risk Legend */}
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="text-slate-400 font-medium">Risk Levels:</span>
                    <div className="flex items-center gap-1">
                        <span className={`px-2 py-0.5 rounded ${RISK_COLORS.low.bg} ${RISK_COLORS.low.text} border ${RISK_COLORS.low.border}`}>
                            <CheckCircle className="h-3 w-3 inline mr-1" />
                            Low (0-20)
                        </span>
                        <span className="text-slate-500">Established protocols, high TVL</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className={`px-2 py-0.5 rounded ${RISK_COLORS.medium.bg} ${RISK_COLORS.medium.text} border ${RISK_COLORS.medium.border}`}>
                            Medium (21-40)
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className={`px-2 py-0.5 rounded ${RISK_COLORS.high.bg} ${RISK_COLORS.high.text} border ${RISK_COLORS.high.border}`}>
                            High (41-60)
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className={`px-2 py-0.5 rounded ${RISK_COLORS.very_high.bg} ${RISK_COLORS.very_high.text} border ${RISK_COLORS.very_high.border}`}>
                            <AlertTriangle className="h-3 w-3 inline mr-1" />
                            Very High (61+)
                        </span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                        <Network className="h-4 w-4 text-slate-500" />
                        <select
                            value={chain}
                            onChange={(e) => setChain(e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                        >
                            {CHAIN_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-slate-500" />
                        <select
                            value={minTvl}
                            onChange={(e) => setMinTvl(parseInt(e.target.value))}
                            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                        >
                            <option value="100000">TVL &gt; $100K</option>
                            <option value="1000000">TVL &gt; $1M</option>
                            <option value="10000000">TVL &gt; $10M</option>
                            <option value="100000000">TVL &gt; $100M</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-slate-500" />
                        <select
                            value={riskFilter}
                            onChange={(e) => setRiskFilter(e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                        >
                            <option value="">All Risk Levels</option>
                            <option value="low">Low Risk Only</option>
                            <option value="medium">Medium Risk</option>
                            <option value="high">High Risk</option>
                            <option value="very_high">Very High Risk</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4 text-slate-500" />
                        <select
                            value={minApy}
                            onChange={(e) => setMinApy(parseFloat(e.target.value))}
                            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                        >
                            <option value="0">Any APY</option>
                            <option value="3">APY &gt; 3%</option>
                            <option value="5">APY &gt; 5%</option>
                            <option value="10">APY &gt; 10%</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <ArrowUpDown className="h-4 w-4 text-slate-500" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortField)}
                            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                        >
                            <option value="tvl">Sort by TVL</option>
                            <option value="apy">Sort by APY</option>
                            <option value="risk">Sort by Risk (Safest)</option>
                            <option value="stability">Sort by Stability</option>
                            <option value="liquidity">Sort by Liquidity</option>
                        </select>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={stablecoinOnly}
                            onChange={(e) => setStablecoinOnly(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500"
                        />
                        <Coins className="h-4 w-4 text-slate-500" />
                        <span className="text-sm text-slate-400">Stablecoins Only</span>
                    </label>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-[400px] bg-slate-900 rounded-lg border border-border">
                    <Loader2 className="h-8 w-8 text-cyan-400 animate-spin mb-4" />
                    <p className="text-slate-400">Loading DeFi data...</p>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center h-[400px] bg-slate-900 rounded-lg border border-border">
                    <p className="text-red-400 mb-2">Error loading data</p>
                    <p className="text-slate-500 text-sm">{error}</p>
                </div>
            ) : !graphData ? (
                <div className="flex flex-col items-center justify-center h-[400px] bg-slate-900 rounded-lg border border-border">
                    <Network className="h-12 w-12 text-slate-600 mb-4" />
                    <p className="text-slate-400 mb-2">No DeFi data available</p>
                    <code className="bg-slate-800 px-3 py-2 rounded mt-2 text-cyan-400 text-sm">npm run fetch:defi</code>
                </div>
            ) : (
                <>
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="bg-card border border-border rounded-lg p-4">
                            <div className="flex items-center gap-2 text-slate-400 mb-1">
                                <Percent className="h-4 w-4" />
                                <span className="text-xs">{activeTab === "watchlist" ? "Watched" : "Pools"}</span>
                            </div>
                            <div className="text-2xl font-bold text-white">{filteredYields.length}</div>
                        </div>
                        <div className="bg-card border border-green-500/30 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-green-400 mb-1">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-xs">Low Risk</span>
                            </div>
                            <div className="text-2xl font-bold text-green-400">{riskStats?.low || 0}</div>
                        </div>
                        <div className="bg-card border border-yellow-500/30 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-yellow-400 mb-1">
                                <Info className="h-4 w-4" />
                                <span className="text-xs">Medium</span>
                            </div>
                            <div className="text-2xl font-bold text-yellow-400">{riskStats?.medium || 0}</div>
                        </div>
                        <div className="bg-card border border-orange-500/30 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-orange-400 mb-1">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="text-xs">High</span>
                            </div>
                            <div className="text-2xl font-bold text-orange-400">{riskStats?.high || 0}</div>
                        </div>
                        <div className="bg-card border border-red-500/30 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-red-400 mb-1">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="text-xs">Very High</span>
                            </div>
                            <div className="text-2xl font-bold text-red-400">{riskStats?.very_high || 0}</div>
                        </div>
                    </div>

                    {/* Yields Table */}
                    <div className="bg-card border border-border rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-800/50">
                                    <tr>
                                        <th className="text-center px-2 py-3 text-xs font-semibold text-slate-400 uppercase w-10"></th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Pool</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Chain</th>
                                        <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase">TVL</th>
                                        <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase">APY</th>
                                        <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Risk</th>
                                        <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Stability</th>
                                        <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Liquidity</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase hidden lg:table-cell">Dependencies</th>
                                        <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {filteredYields.map((pool) => (
                                        <Fragment key={pool.id}>
                                            <tr className="hover:bg-slate-800/30 transition-colors">
                                                <td className="px-2 py-3 text-center">
                                                    <WatchlistButton
                                                        poolId={pool.id}
                                                        chain={pool.chain}
                                                        project={pool.project}
                                                        symbol={pool.symbol}
                                                        isInWatchlist={watchlistPoolIds.has(pool.id)}
                                                        onToggle={handleWatchlistToggle}
                                                        disabled={!session?.user}
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col">
                                                        <span className="text-white font-medium text-sm">{pool.project}</span>
                                                        <span className="text-slate-500 text-xs font-mono">
                                                            {pool.symbol}
                                                            {pool.stablecoin && (
                                                                <span className="ml-1 text-yellow-400">(Stable)</span>
                                                            )}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-sm text-slate-400">{pool.chain}</span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className="text-sm text-white font-medium">{formatTvl(pool.tvlUsd)}</span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className={`text-sm font-bold ${
                                                        pool.apy >= 20 ? "text-orange-400" :
                                                        pool.apy >= 10 ? "text-yellow-400" :
                                                        pool.apy >= 5 ? "text-green-400" : "text-slate-400"
                                                    }`}>
                                                        {formatApy(pool.apy)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <RiskBadge level={pool.riskLevel} score={pool.riskScore} />
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <StabilityBadge stability={pool.apyStability} />
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <LiquidityBadge liquidity={pool.liquidityRisk} />
                                                </td>
                                                <td className="px-4 py-3 hidden lg:table-cell">
                                                    <DependencyChips dependencies={pool.dependencies} />
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() => setExpandedPool(expandedPool === pool.id ? null : pool.id)}
                                                        className="text-cyan-400 hover:text-cyan-300 transition-colors p-1"
                                                    >
                                                        {expandedPool === pool.id ? (
                                                            <ChevronUp className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronDown className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                            {expandedPool === pool.id && (
                                                <tr>
                                                    <td colSpan={10} className="p-0">
                                                        <ExpandedPoolDetails pool={pool} />
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filteredYields.length === 0 && (
                            <div className="text-center py-8 text-slate-500">
                                {activeTab === "watchlist" ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <Bookmark className="h-8 w-8 text-slate-600" />
                                        <p>No pools in your watchlist yet.</p>
                                        <p className="text-sm">Click the bookmark icon on any pool to add it.</p>
                                    </div>
                                ) : (
                                    "No pools match your filters. Try adjusting the criteria."
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
