"use client";

import { useEffect, useState, Fragment, useCallback, useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
    TrendingUp,
    TrendingDown,
    Minus,
    Loader2,
    Shield,
    ChevronDown,
    Layers,
    Droplet,
    Bookmark,
    Search,
    Sparkles,
    BarChart3,
    Calculator,
    LineChart,
    X,
    AlertTriangle,
} from "lucide-react";
import { WatchlistButton } from "@/components/curate/watchlist-button";
import { ApyHistoryChart } from "@/components/curate/apy-history-chart";
import { CompareBar } from "@/components/curate/compare-bar";
import { PoolComparisonPanel } from "@/components/curate/pool-comparison-panel";
import { UserPreferencesPanel } from "@/components/curate/user-preferences-panel";
import { AIRecommendationsSection } from "@/components/curate/ai-recommendations-section";
import { PoolAIInsights } from "@/components/curate/pool-ai-insights";
import { PortfolioOptimizer } from "@/components/curate/portfolio-optimizer";
import { ProtocolComparison } from "@/components/curate/protocol-comparison";
import { BacktestPanel } from "@/components/curate/backtest-panel";
import { ProtocolRiskBadge } from "@/components/curate/protocol-risk-badge";
import { SolanaMetricsPanel } from "@/components/curate/solana-yield-metrics";
import { LSTComparison } from "@/components/curate/lst-comparison";
import { AlternativeYields } from "@/components/curate/alternative-yields";
import { CurateLayoutClient } from "@/components/curate/curate-layout-client";
import {
    ApySustainabilityToggle,
    ILSimulatorEnhanced,
    RiskScoreExplainer,
    DiscoveryPrompts,
} from "@/components/curate/learning";
import { YieldSpreadsPanel } from "@/components/curate/yield-spreads-panel";
import { CuratorSection } from "@/components/curate/curator-section";
import { TabNavigation, TabContent, TabId, MobileTabSpacer } from "@/components/curate/tab-navigation";
import { getProtocolSlug } from "@/lib/solana/protocols";

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

// New Solana-specific interfaces
interface YieldBreakdown {
    base: number;
    reward: number;
    hasPoints: boolean;
    pointsProgram: string | null;
    sources: string[];
}

interface TvlTrend {
    change7d: number | null;
    change30d: number | null;
    trend: "growing" | "stable" | "declining" | "unknown";
    isHealthy: boolean;
}

interface VolatilityMetrics {
    sigma: number;
    sharpeRatio: number;
    volatilityLevel: "low" | "medium" | "high" | "very_high";
}

interface ILRiskInfo {
    hasILRisk: boolean;
    level: "none" | "low" | "medium" | "high" | "very_high";
    isConcentratedLiquidity: boolean;
    poolType: string | null;
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
    // New Solana-specific fields
    yieldBreakdown?: YieldBreakdown;
    tvlTrend?: TvlTrend;
    volatilityMetrics?: VolatilityMetrics | null;
    ilRiskInfo?: ILRiskInfo;
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

// Solana-only - no chain switching needed
const SOLANA_CHAIN = "Solana";

const RISK_COLORS = {
    low: "text-green-400",
    medium: "text-yellow-400",
    high: "text-orange-400",
    very_high: "text-red-400",
};

function formatTvl(tvl: number): string {
    if (tvl >= 1_000_000_000) return `$${(tvl / 1_000_000_000).toFixed(2)}B`;
    if (tvl >= 1_000_000) return `$${(tvl / 1_000_000).toFixed(1)}M`;
    return `$${(tvl / 1_000).toFixed(0)}K`;
}

function formatApy(apy: number): string {
    if (apy >= 100) return `${apy.toFixed(0)}%`;
    return `${apy.toFixed(2)}%`;
}

function formatSafeAllocation(amount: number): string {
    if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`;
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
    return `$${(amount / 1_000).toFixed(0)}K`;
}

function ExpandedPoolDetails({ pool }: { pool: YieldPool }) {
    const { data: session } = useSession();
    const { riskBreakdown, liquidityRisk } = pool;
    const protocolSlug = getProtocolSlug(pool.project);
    const hasILRisk = pool.ilRiskInfo?.hasILRisk && pool.ilRiskInfo.level !== "none";

    return (
        <div className="bg-slate-800/50 px-4 py-5 border-t border-slate-700/50">
            {/* Protocol Trust Badge */}
            {protocolSlug && (
                <div className="mb-4">
                    <ProtocolRiskBadge protocolSlug={protocolSlug} variant="full" />
                </div>
            )}

            {/* Learning Components Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {/* Risk Score Explainer */}
                <RiskScoreExplainer
                    riskScore={pool.riskScore}
                    riskLevel={pool.riskLevel}
                    breakdown={riskBreakdown}
                    tvlUsd={pool.tvlUsd}
                    apy={pool.apy}
                    apyBase={pool.apyBase}
                    apyReward={pool.apyReward}
                    stablecoin={pool.stablecoin}
                    ilRisk={pool.ilRisk}
                    project={pool.project}
                    underlyingAssets={pool.underlyingAssets}
                />

                {/* APY Sustainability Toggle */}
                <ApySustainabilityToggle
                    totalApy={pool.apy}
                    baseApy={pool.apyBase}
                    rewardApy={pool.apyReward}
                    poolSymbol={pool.symbol}
                />

                {/* Liquidity Info */}
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                    <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                        <Droplet className="h-4 w-4 text-cyan-400" />
                        Liquidity & Exit
                    </h4>
                    {liquidityRisk ? (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-400">Exitability</span>
                                <span className={`text-sm font-medium capitalize ${
                                    liquidityRisk.exitabilityRating === "excellent" || liquidityRisk.exitabilityRating === "good"
                                        ? "text-green-400"
                                        : liquidityRisk.exitabilityRating === "moderate"
                                        ? "text-yellow-400"
                                        : "text-orange-400"
                                }`}>
                                    {liquidityRisk.exitabilityRating.replace("_", " ")}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-400">Safe allocation</span>
                                <span className="text-sm text-white">{formatSafeAllocation(liquidityRisk.maxSafeAllocation)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-400">Slippage @$100K</span>
                                <span className={`text-sm ${liquidityRisk.slippageEstimates.at100k < 0.5 ? "text-green-400" : "text-yellow-400"}`}>
                                    {liquidityRisk.slippageEstimates.at100k}%
                                </span>
                            </div>
                            <div className="pt-2 border-t border-slate-700/50">
                                <div className="flex flex-wrap gap-1">
                                    {pool.underlyingAssets.map((a, i) => (
                                        <span key={i} className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                                            {a}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-xs text-slate-500">No liquidity data available</p>
                    )}
                </div>
            </div>

            {/* APY History Chart */}
            <div className="mb-6">
                <ApyHistoryChart poolId={pool.id} />
            </div>

            {/* IL Simulator - only show for LP pools with IL risk */}
            {hasILRisk && pool.underlyingAssets.length >= 2 && (
                <div className="mb-6">
                    <ILSimulatorEnhanced
                        poolSymbol={pool.symbol}
                        poolApy={pool.apy}
                        underlyingAssets={pool.underlyingAssets}
                    />
                </div>
            )}

            {/* Solana Yield Metrics */}
            <div className="mb-6">
                <SolanaMetricsPanel
                    yieldBreakdown={pool.yieldBreakdown}
                    tvlTrend={pool.tvlTrend}
                    volatilityMetrics={pool.volatilityMetrics}
                    ilRiskInfo={pool.ilRiskInfo}
                    totalApy={pool.apy}
                />
            </div>

            {/* AI Insights */}
            <div>
                <PoolAIInsights poolId={pool.id} isLoggedIn={!!session?.user} />
            </div>
        </div>
    );
}

type SortField = "tvl" | "apy" | "risk";
type TabType = "all" | "watchlist";

// Quick inline IL Calculator
function QuickILCalculator() {
    const [priceChange, setPriceChange] = useState(50);
    const [isExpanded, setIsExpanded] = useState(false);

    // IL formula: IL = 2 * sqrt(price_ratio) / (1 + price_ratio) - 1
    const priceRatio = 1 + priceChange / 100;
    const ilPercent = (2 * Math.sqrt(priceRatio) / (1 + priceRatio) - 1) * 100;

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl overflow-hidden">
            {/* Header - always visible */}
            <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-800/50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg flex items-center justify-center">
                        <Calculator className="h-5 w-5 text-orange-400" />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold text-sm">Quick IL Check</h3>
                        <p className="text-xs text-slate-500">Estimate impermanent loss instantly</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {/* Quick preview when collapsed */}
                    {!isExpanded && (
                        <div className="hidden sm:flex items-center gap-3 text-sm">
                            <span className="text-slate-400">If price changes {priceChange}%:</span>
                            <span className={`font-semibold ${Math.abs(ilPercent) < 2 ? "text-green-400" : Math.abs(ilPercent) < 5 ? "text-yellow-400" : "text-red-400"}`}>
                                {ilPercent.toFixed(2)}% IL
                            </span>
                        </div>
                    )}
                    <ChevronDown className={`h-5 w-5 text-slate-500 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </div>
            </div>

            {/* Expanded calculator */}
            {isExpanded && (
                <div className="px-4 pb-4 border-t border-slate-700/50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                        {/* Price Change Input */}
                        <div>
                            <label className="text-xs text-slate-400 block mb-2">Price Change (%)</label>
                            <input
                                type="range"
                                min="-90"
                                max="500"
                                value={priceChange}
                                onChange={(e) => setPriceChange(parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                            />
                            <div className="flex justify-between mt-1">
                                <span className="text-xs text-slate-500">-90%</span>
                                <span className="text-sm text-white font-medium">{priceChange > 0 ? "+" : ""}{priceChange}%</span>
                                <span className="text-xs text-slate-500">+500%</span>
                            </div>
                        </div>

                        {/* IL Result */}
                        <div className="flex flex-col items-center justify-center bg-slate-800/50 rounded-lg p-4">
                            <span className="text-xs text-slate-400 mb-1">Impermanent Loss</span>
                            <span className={`text-2xl font-bold ${Math.abs(ilPercent) < 2 ? "text-green-400" : Math.abs(ilPercent) < 5 ? "text-yellow-400" : "text-red-400"}`}>
                                {ilPercent.toFixed(2)}%
                            </span>
                            <span className="text-xs text-slate-500 mt-1">
                                {Math.abs(ilPercent) < 2 ? "Low risk" : Math.abs(ilPercent) < 5 ? "Moderate" : "High risk"}
                            </span>
                        </div>

                        {/* Quick presets & link */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs text-slate-400">Quick Scenarios</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[25, 50, 100, 200, -25, -50].map((val) => (
                                    <button
                                        key={val}
                                        onClick={() => setPriceChange(val)}
                                        className={`px-2 py-1.5 text-xs rounded transition-colors ${
                                            priceChange === val
                                                ? "bg-orange-500/30 text-orange-300 border border-orange-500/50"
                                                : "bg-slate-700/50 text-slate-400 hover:text-white"
                                        }`}
                                    >
                                        {val > 0 ? "+" : ""}{val}%
                                    </button>
                                ))}
                            </div>
                            <Link
                                href="/tools#il-calculator"
                                className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 text-center"
                            >
                                Full Calculator & Simulator →
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function CuratePage() {
    const { data: session } = useSession();
    const [graphData, setGraphData] = useState<DefiGraphData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedPool, setExpandedPool] = useState<string | null>(null);

    // Main navigation tab state (2 tabs: dashboard, explore)
    const [mainTab, setMainTab] = useState<TabId>("dashboard");

    // Pool list tab state (all vs watchlist)
    const [activeTab, setActiveTab] = useState<TabType>("all");

    // Watchlist state
    const [watchlistPoolIds, setWatchlistPoolIds] = useState<Set<string>>(new Set());
    const [watchlistLoading, setWatchlistLoading] = useState(false);

    // Comparison state
    const [selectedPoolIds, setSelectedPoolIds] = useState<Set<string>>(new Set());
    const [comparisonOpen, setComparisonOpen] = useState(false);
    const [backtestOpen, setBacktestOpen] = useState(false);

    // AI Features state
    const [preferencesOpen, setPreferencesOpen] = useState(false);
    const [portfolioOpen, setPortfolioOpen] = useState(false);
    const [hasPreferences, setHasPreferences] = useState(false);
    const [userPreferences, setUserPreferences] = useState<{
        riskTolerance: "conservative" | "moderate" | "aggressive";
        minApy: number;
        maxApy: number;
        stablecoinOnly: boolean;
        maxAllocationUsd: number | null;
    } | null>(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    // Solana-only - chain is fixed
    const chain = SOLANA_CHAIN;
    const [minTvl, setMinTvl] = useState(1_000_000);
    const [stablecoinOnly, setStablecoinOnly] = useState(false);
    const [riskFilter, setRiskFilter] = useState<string>("low");
    const [sortBy, setSortBy] = useState<SortField>("tvl");
    const [protocolFilter, setProtocolFilter] = useState<string | null>(null);

    // Hero stats (unfiltered totals)
    const [heroStats, setHeroStats] = useState<{ totalPools: number; totalTvl: number; lowRiskCount: number } | null>(null);

    // Fetch hero stats (unfiltered)
    useEffect(() => {
        async function fetchHeroStats() {
            try {
                const params = new URLSearchParams();
                params.set("chain", SOLANA_CHAIN);
                params.set("minTvl", "1000000");
                params.set("yieldLimit", "500");
                const response = await fetch(`/api/curate/defi?${params}`);
                if (response.ok) {
                    const data = await response.json();
                    const pools = data.yields || [];
                    setHeroStats({
                        totalPools: pools.length,
                        totalTvl: pools.reduce((sum: number, p: YieldPool) => sum + p.tvlUsd, 0),
                        lowRiskCount: pools.filter((p: YieldPool) => p.riskScore <= 20).length,
                    });
                }
            } catch (err) {
                console.error("Failed to fetch hero stats:", err);
            }
        }
        fetchHeroStats();
    }, []);

    // Fetch watchlist
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

    const handleWatchlistToggle = useCallback((poolId: string, isAdding: boolean) => {
        setWatchlistPoolIds((prev) => {
            const next = new Set(prev);
            if (isAdding) next.add(poolId);
            else next.delete(poolId);
            return next;
        });
    }, []);

    const handlePoolSelect = useCallback((poolId: string) => {
        setSelectedPoolIds((prev) => {
            const next = new Set(prev);
            if (next.has(poolId)) next.delete(poolId);
            else if (next.size < 3) next.add(poolId);
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
                if (stablecoinOnly) params.set("stablecoinOnly", "true");
                if (riskFilter) params.set("riskLevel", riskFilter);
                if (protocolFilter) params.set("project", protocolFilter);
                params.set("sortBy", sortBy);
                params.set("yieldLimit", "200");

                const response = await fetch(`/api/curate/defi?${params}`);
                if (!response.ok) throw new Error("Failed to fetch");
                const data = await response.json();
                setGraphData(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [chain, minTvl, stablecoinOnly, riskFilter, sortBy, protocolFilter]);

    // Filter by tab and search
    const filteredYields = (graphData?.yields || []).filter((pool) => {
        if (activeTab === "watchlist" && !watchlistPoolIds.has(pool.id)) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return pool.project.toLowerCase().includes(q) ||
                   pool.symbol.toLowerCase().includes(q) ||
                   pool.chain.toLowerCase().includes(q);
        }
        return true;
    });

    const selectedPools = filteredYields.filter((pool) => selectedPoolIds.has(pool.id));

    // Calculate curated picks - algorithmically selected best opportunities
    const curatedPicks = useMemo(() => {
        if (!graphData?.yields) return { bestRiskAdjusted: null, topStable: null, highestApy: null };

        const pools = graphData.yields;

        // Best risk-adjusted: Low risk (<25) + decent APY (>3%), sorted by APY/risk ratio
        const lowRiskPools = pools
            .filter(p => p.riskScore <= 25 && p.apy >= 3 && p.tvlUsd >= 10_000_000)
            .sort((a, b) => (b.apy / b.riskScore) - (a.apy / a.riskScore));
        const bestRiskAdjusted = lowRiskPools[0] || null;

        // Top stablecoin: Stablecoins with low risk, highest APY
        const stablePools = pools
            .filter(p => p.stablecoin && p.riskScore <= 35 && p.tvlUsd >= 5_000_000)
            .sort((a, b) => b.apy - a.apy);
        const topStable = stablePools[0] || null;

        // Highest sustainable APY: High APY but with good stability score
        const sustainableHighApy = pools
            .filter(p => p.apy >= 8 && p.apyStability && p.apyStability.score >= 60 && p.tvlUsd >= 5_000_000)
            .sort((a, b) => b.apy - a.apy);
        const highestApy = sustainableHighApy[0] || null;

        return { bestRiskAdjusted, topStable, highestApy };
    }, [graphData?.yields]);

    // Calculate summary stats
    const summaryStats = useMemo(() => {
        if (!graphData?.yields) return { totalTvl: 0, poolCount: 0, lowRiskCount: 0 };
        const pools = graphData.yields;
        return {
            totalTvl: pools.reduce((sum, p) => sum + p.tvlUsd, 0),
            poolCount: pools.length,
            lowRiskCount: pools.filter(p => p.riskScore <= 20).length,
        };
    }, [graphData?.yields]);

    const handleExpandFromPick = (poolId: string) => {
        setExpandedPool(poolId);
        // Scroll to the pool in the table
        setTimeout(() => {
            document.getElementById(`pool-row-${poolId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
    };

    // Fetch user preferences on mount
    useEffect(() => {
        async function fetchPreferences() {
            if (!session?.user) return;
            try {
                const response = await fetch("/api/curate/ai/preferences");
                if (response.ok) {
                    const data = await response.json();
                    setUserPreferences(data);
                    // Consider has preferences if they've customized anything
                    setHasPreferences(
                        data.riskTolerance !== "moderate" ||
                        data.minApy > 0 ||
                        data.maxApy < 100 ||
                        data.stablecoinOnly
                    );
                }
            } catch (err) {
                console.error("Failed to fetch preferences:", err);
            }
        }
        fetchPreferences();
    }, [session?.user]);

    const handleSavePreferences = async (preferences: typeof userPreferences) => {
        if (!preferences) return;
        try {
            const response = await fetch("/api/curate/ai/preferences", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(preferences),
            });
            if (response.ok) {
                setUserPreferences(preferences);
                setHasPreferences(true);
            }
        } catch (err) {
            console.error("Failed to save preferences:", err);
        }
    };

    // Helper to filter pools from explore tab
    const filterPoolsByProtocol = (protocol?: string) => {
        if (protocol) {
            setProtocolFilter(protocol);
            setRiskFilter(""); // Show all risks when filtering by protocol
        }
        setMainTab("dashboard");
        // Scroll to pool table after a short delay
        setTimeout(() => {
            document.getElementById("pool-table-section")?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    return (
        <CurateLayoutClient>
        <div className="space-y-6">
            {/* Tab Navigation */}
            <TabNavigation activeTab={mainTab} onTabChange={setMainTab} />

            <TabContent activeTab={mainTab}>
                {{
                    /* DASHBOARD TAB - Home + Pools combined */
                    dashboard: (
                        <div className="space-y-6">
                            {/* Hero Section */}
                            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 p-6 md:p-8">
                                {/* Background glow */}
                                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                                <div className="relative">
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                        <div className="max-w-2xl">
                                            {/* Badges */}
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-medium uppercase tracking-wide">
                                                    Solana
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-medium uppercase tracking-wide">
                                                    <Shield className="h-2.5 w-2.5" />
                                                    Non-Custodial
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-medium uppercase tracking-wide">
                                                    Read-Only
                                                </span>
                                            </div>

                                            {/* Main headline - outcome focused */}
                                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
                                                {heroStats?.totalPools || summaryStats.poolCount}+ pools analyzed.{" "}
                                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                                                    {heroStats?.lowRiskCount || summaryStats.lowRiskCount} you can trust.
                                                </span>
                                            </h1>

                                            {/* Value prop - what painful decision it replaces */}
                                            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                                                An AI yield analyst that filters Solana DeFi by{" "}
                                                <span className="text-slate-300">risk-adjusted return</span>, not raw APY.
                                                Stop chasing numbers. Start allocating with confidence.
                                            </p>

                                            {/* How it works - quick proof */}
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 text-xs text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <Shield className="h-3 w-3 text-cyan-500" />
                                                    Risk scoring
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <TrendingUp className="h-3 w-3 text-green-500" />
                                                    APY stability analysis
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Sparkles className="h-3 w-3 text-purple-500" />
                                                    AI recommendations
                                                </span>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>

                            {/* Discovery Prompts - Learning through exploration */}
                            {graphData?.yields && graphData.yields.length > 0 && (
                                <DiscoveryPrompts
                                    pools={graphData.yields.map(p => ({
                                        id: p.id,
                                        project: p.project,
                                        symbol: p.symbol,
                                        tvlUsd: p.tvlUsd,
                                        apy: p.apy,
                                        apyBase: p.apyBase,
                                        apyReward: p.apyReward,
                                        riskScore: p.riskScore,
                                        riskLevel: p.riskLevel,
                                        stablecoin: p.stablecoin,
                                        category: p.yieldBreakdown?.sources?.includes("restaking") ? "restaking" :
                                                  p.yieldBreakdown?.sources?.includes("perp") ? "perp_lp" : undefined,
                                    }))}
                                    onExplore={handleExpandFromPick}
                                />
                            )}

                            {/* Smart Picks Section - shows curated picks or AI recommendations */}
                            <AIRecommendationsSection
                                hasPreferences={hasPreferences}
                                onSetPreferences={() => setPreferencesOpen(true)}
                                onPoolClick={handleExpandFromPick}
                                isLoggedIn={!!session?.user}
                                curatedPicks={curatedPicks}
                            />

                            {/* All Pools Section */}
            <div id="pool-table-section" className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-slate-500" />
                    <h2 className="text-sm font-semibold text-white">
                        {protocolFilter ? `${protocolFilter.charAt(0).toUpperCase() + protocolFilter.slice(1)} Pools` : "All Pools"}
                    </h2>
                    {protocolFilter && (
                        <button
                            onClick={() => setProtocolFilter(null)}
                            className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded-full hover:bg-purple-500/30 transition-colors"
                        >
                            {protocolFilter}
                            <X className="h-3 w-3" />
                        </button>
                    )}
                </div>
                <button
                    onClick={() => setPortfolioOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-lg text-sm text-purple-300 hover:border-purple-500/50 transition-colors"
                >
                    <Sparkles className="h-4 w-4" />
                    Portfolio Optimizer
                </button>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search pools..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-48"
                    />
                </div>

                {/* TVL */}
                <select
                    value={minTvl}
                    onChange={(e) => setMinTvl(parseInt(e.target.value))}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                    <option value="100000">TVL &gt; $100K</option>
                    <option value="1000000">TVL &gt; $1M</option>
                    <option value="10000000">TVL &gt; $10M</option>
                    <option value="100000000">TVL &gt; $100M</option>
                </select>

                {/* Risk */}
                <select
                    value={riskFilter}
                    onChange={(e) => setRiskFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                    <option value="">All Risks</option>
                    <option value="low">Low Risk</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>

                {/* Sort */}
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortField)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                    <option value="tvl">Sort: TVL</option>
                    <option value="apy">Sort: APY</option>
                    <option value="risk">Sort: Risk</option>
                </select>

                {/* Stablecoin toggle */}
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                        type="checkbox"
                        checked={stablecoinOnly}
                        onChange={(e) => setStablecoinOnly(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-cyan-500"
                    />
                    <span className="text-slate-400">Stablecoins</span>
                </label>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Tabs */}
                <div className="flex gap-1 bg-slate-900 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab("all")}
                        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                            activeTab === "all" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
                        }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setActiveTab("watchlist")}
                        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1.5 ${
                            activeTab === "watchlist" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
                        }`}
                    >
                        <Bookmark className={`h-3.5 w-3.5 ${watchlistPoolIds.size > 0 ? "fill-current text-yellow-400" : ""}`} />
                        Watchlist
                        {watchlistPoolIds.size > 0 && (
                            <span className="text-xs text-yellow-400">({watchlistPoolIds.size})</span>
                        )}
                    </button>
                </div>

                {/* Pool count */}
                <span className="text-sm text-slate-500">
                    {filteredYields.length} pools
                </span>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center h-96 bg-slate-900/50 rounded-lg border border-slate-800">
                    <Loader2 className="h-6 w-6 text-cyan-400 animate-spin" />
                </div>
            ) : error ? (
                <div className="flex items-center justify-center h-96 bg-slate-900/50 rounded-lg border border-slate-800">
                    <p className="text-red-400">{error}</p>
                </div>
            ) : (
                <div className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-800">
                                <th className="w-8 px-2 py-3"></th>
                                <th className="w-8 px-2 py-3"></th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Pool</th>
                                <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase">TVL</th>
                                <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase">APY</th>
                                <th className="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase">Risk</th>
                                <th className="w-10 px-2 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredYields.map((pool) => (
                                <Fragment key={pool.id}>
                                    <tr
                                        id={`pool-row-${pool.id}`}
                                        className={`border-b border-slate-800/50 hover:bg-slate-800/30 cursor-pointer transition-colors ${
                                            expandedPool === pool.id ? "bg-slate-800/40" : ""
                                        }`}
                                        onClick={() => setExpandedPool(expandedPool === pool.id ? null : pool.id)}
                                    >
                                        <td className="px-2 py-2.5" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selectedPoolIds.has(pool.id)}
                                                onChange={() => handlePoolSelect(pool.id)}
                                                disabled={!selectedPoolIds.has(pool.id) && selectedPoolIds.size >= 3}
                                                className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-800 text-cyan-500 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                            />
                                        </td>
                                        <td className="px-2 py-2.5" onClick={(e) => e.stopPropagation()}>
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
                                        <td className="px-4 py-2.5">
                                            <div className="flex items-center gap-2">
                                                <div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-sm text-white font-medium">{pool.project}</span>
                                                        <span className="text-xs text-slate-500">{pool.symbol}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        {pool.stablecoin && (
                                                            <span className="text-[10px] px-1 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                                                                Stable
                                                            </span>
                                                        )}
                                                        {pool.yieldBreakdown?.hasPoints && (
                                                            <span className="text-[10px] px-1 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                                                Points
                                                            </span>
                                                        )}
                                                        {pool.ilRiskInfo?.isConcentratedLiquidity && (
                                                            <span className="text-[10px] px-1 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                                                                CLMM
                                                            </span>
                                                        )}
                                                        {pool.ilRiskInfo?.hasILRisk && pool.ilRiskInfo.level !== "none" && pool.ilRiskInfo.level !== "low" && !pool.ilRiskInfo.isConcentratedLiquidity && (
                                                            <span className="text-[10px] px-1 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                                                                IL Risk
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5 text-right">
                                            <span className="text-sm text-white">{formatTvl(pool.tvlUsd)}</span>
                                        </td>
                                        <td className="px-4 py-2.5 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {/* APY change alert badge */}
                                                {pool.apyStability && pool.apyStability.avgApy > 0 && (() => {
                                                    const changePercent = ((pool.apy - pool.apyStability.avgApy) / pool.apyStability.avgApy) * 100;
                                                    if (changePercent <= -20) {
                                                        return (
                                                            <span className="flex items-center gap-0.5 text-[10px] px-1 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30" title={`APY dropped from ${pool.apyStability.avgApy.toFixed(1)}% avg`}>
                                                                <AlertTriangle className="h-2.5 w-2.5" />
                                                                {changePercent.toFixed(0)}%
                                                            </span>
                                                        );
                                                    }
                                                    if (changePercent >= 30) {
                                                        return (
                                                            <span className="flex items-center gap-0.5 text-[10px] px-1 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30" title={`APY up from ${pool.apyStability.avgApy.toFixed(1)}% avg`}>
                                                                <TrendingUp className="h-2.5 w-2.5" />
                                                                +{changePercent.toFixed(0)}%
                                                            </span>
                                                        );
                                                    }
                                                    return null;
                                                })()}
                                                <span className={`text-sm font-medium ${
                                                    pool.apy >= 10 ? "text-green-400" : "text-white"
                                                }`}>
                                                    {formatApy(pool.apy)}
                                                </span>
                                                {pool.apyStability && (
                                                    <span className={`${
                                                        pool.apyStability.trend === "up" ? "text-green-500" :
                                                        pool.apyStability.trend === "down" ? "text-red-500" : "text-slate-500"
                                                    }`}>
                                                        {pool.apyStability.trend === "up" && <TrendingUp className="h-3 w-3" />}
                                                        {pool.apyStability.trend === "down" && <TrendingDown className="h-3 w-3" />}
                                                        {pool.apyStability.trend === "stable" && <Minus className="h-3 w-3" />}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-12 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${
                                                            pool.riskScore <= 20 ? "bg-green-500" :
                                                            pool.riskScore <= 40 ? "bg-yellow-500" :
                                                            pool.riskScore <= 60 ? "bg-orange-500" : "bg-red-500"
                                                        }`}
                                                        style={{ width: `${pool.riskScore}%` }}
                                                    />
                                                </div>
                                                <span className={`text-xs font-medium ${RISK_COLORS[pool.riskLevel]}`}>
                                                    {pool.riskScore}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-2 py-2.5">
                                            <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${
                                                expandedPool === pool.id ? "rotate-180" : ""
                                            }`} />
                                        </td>
                                    </tr>
                                    {expandedPool === pool.id && (
                                        <tr>
                                            <td colSpan={7} className="p-0">
                                                <ExpandedPoolDetails pool={pool} />
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            ))}
                        </tbody>
                    </table>
                    {filteredYields.length === 0 && (
                        <div className="text-center py-12 text-slate-500">
                            {activeTab === "watchlist" ? (
                                <div className="flex flex-col items-center gap-2">
                                    <Bookmark className="h-6 w-6 text-slate-600" />
                                    <p>No pools in watchlist</p>
                                </div>
                            ) : (
                                "No pools match filters"
                            )}
                        </div>
                    )}
                </div>
            )}

                            {/* Compare Bar */}
                            <CompareBar
                                count={selectedPoolIds.size}
                                onCompare={() => setComparisonOpen(true)}
                                onBacktest={() => setBacktestOpen(true)}
                                onClear={() => setSelectedPoolIds(new Set())}
                            />
                        </div>
                    ),

                    /* EXPLORE TAB - Discover + Curators combined */
                    explore: (
                        <div className="space-y-6">
                            {/* Protocol Comparison Section */}
                            <ProtocolComparison onProtocolClick={(slug) => filterPoolsByProtocol(slug)} />

                            {/* LST Comparison Section */}
                            <LSTComparison />

                            {/* Restaking & Perp LP Section */}
                            <AlternativeYields />

                            {/* Yield Opportunities - Cross-protocol arbitrage detection */}
                            <YieldSpreadsPanel />

                            {/* Curator Strategies - Learn from professional curators */}
                            <CuratorSection />

                            {/* DeFi Tools Section with Quick IL Calculator */}
                            <QuickILCalculator />
                        </div>
                    ),
                }}
            </TabContent>

            {/* Modals - Outside of tabs so they work everywhere */}
            {/* Comparison Panel */}
            <PoolComparisonPanel
                pools={selectedPools}
                isOpen={comparisonOpen}
                onClose={() => setComparisonOpen(false)}
            />

            {/* User Preferences Panel */}
            <UserPreferencesPanel
                isOpen={preferencesOpen}
                onClose={() => setPreferencesOpen(false)}
                onSave={handleSavePreferences}
                initialPreferences={userPreferences || undefined}
                isLoggedIn={!!session?.user}
            />

            {/* Portfolio Optimizer */}
            <PortfolioOptimizer
                isOpen={portfolioOpen}
                onClose={() => setPortfolioOpen(false)}
                onPoolClick={handleExpandFromPick}
                isLoggedIn={!!session?.user}
            />

            {/* Backtest Panel */}
            <BacktestPanel
                isOpen={backtestOpen}
                onClose={() => setBacktestOpen(false)}
                selectedPoolIds={Array.from(selectedPoolIds)}
            />

            {/* Mobile bottom tab spacer - prevents content from being hidden */}
            <MobileTabSpacer />
        </div>
        </CurateLayoutClient>
    );
}
