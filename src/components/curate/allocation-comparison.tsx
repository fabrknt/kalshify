"use client";

import { useState } from "react";
import { useAllocation } from "@/contexts/allocation-context";
import {
    GitCompare,
    TrendingUp,
    Shield,
    ChevronDown,
    CheckCircle,
    AlertTriangle,
    ExternalLink,
    Info,
} from "lucide-react";
import { RiskTolerance } from "./quick-start";

// Enhanced curator data with detailed allocations
interface CuratorAllocation {
    asset: string;
    protocol: string;
    percent: number;
    category: "stablecoin" | "lst" | "lp" | "vault";
}

interface CuratorProfile {
    id: string;
    name: string;
    description: string;
    style: "Very Conservative" | "Conservative" | "Moderate" | "Aggressive" | "Very Aggressive";
    matchesRiskLevels: RiskTolerance[];
    expectedApy: number;
    riskLevel: "low" | "medium" | "high";
    riskScore: number;
    tvlManaged: string;
    allocations: CuratorAllocation[];
    philosophy: string;
    strengths: string[];
    url?: string;
}

const CURATOR_PROFILES: CuratorProfile[] = [
    {
        id: "gauntlet-conservative",
        name: "Gauntlet",
        description: "Risk-focused DeFi strategist with institutional approach",
        style: "Very Conservative",
        matchesRiskLevels: ["preserver"],
        expectedApy: 5.5,
        riskLevel: "low",
        riskScore: 12,
        tvlManaged: "$2.1B",
        allocations: [
            { asset: "USDC", protocol: "Kamino", percent: 50, category: "stablecoin" },
            { asset: "USDC", protocol: "Marginfi", percent: 30, category: "stablecoin" },
            { asset: "USDT", protocol: "Kamino", percent: 20, category: "stablecoin" },
        ],
        philosophy: "Capital preservation first. Only battle-tested protocols with proven track records.",
        strengths: ["Lowest risk exposure", "100% stablecoin", "Multi-protocol diversification"],
        url: "https://gauntlet.xyz",
    },
    {
        id: "steakhouse-steady",
        name: "Steakhouse",
        description: "Methodical yield optimization with risk awareness",
        style: "Conservative",
        matchesRiskLevels: ["steady"],
        expectedApy: 7.2,
        riskLevel: "low",
        riskScore: 18,
        tvlManaged: "$850M",
        allocations: [
            { asset: "USDC", protocol: "Kamino", percent: 40, category: "stablecoin" },
            { asset: "mSOL", protocol: "Marinade", percent: 35, category: "lst" },
            { asset: "USDC", protocol: "Marginfi", percent: 15, category: "stablecoin" },
            { asset: "SOL", protocol: "Kamino", percent: 10, category: "stablecoin" },
        ],
        philosophy: "Steady growth through diversified yield sources. LST exposure for upside.",
        strengths: ["Balanced stablecoin/LST mix", "Low volatility", "Consistent returns"],
        url: "https://steakhouse.financial",
    },
    {
        id: "morpho-balanced",
        name: "Morpho Labs",
        description: "Efficient yield aggregation with smart rebalancing",
        style: "Moderate",
        matchesRiskLevels: ["balanced"],
        expectedApy: 9.8,
        riskLevel: "medium",
        riskScore: 28,
        tvlManaged: "$1.2B",
        allocations: [
            { asset: "USDC", protocol: "Kamino", percent: 30, category: "stablecoin" },
            { asset: "JitoSOL", protocol: "Jito", percent: 30, category: "lst" },
            { asset: "mSOL", protocol: "Marinade", percent: 20, category: "lst" },
            { asset: "USDC", protocol: "Drift", percent: 20, category: "vault" },
        ],
        philosophy: "Optimize risk-adjusted returns through smart allocation and rebalancing.",
        strengths: ["Active rebalancing", "MEV capture via JitoSOL", "Vault diversification"],
    },
    {
        id: "re7-growth",
        name: "RE7 Capital",
        description: "Yield-focused with calculated risk taking",
        style: "Aggressive",
        matchesRiskLevels: ["growth"],
        expectedApy: 14.5,
        riskLevel: "medium",
        riskScore: 42,
        tvlManaged: "$320M",
        allocations: [
            { asset: "JLP", protocol: "Jupiter", percent: 30, category: "vault" },
            { asset: "JitoSOL", protocol: "Jito", percent: 25, category: "lst" },
            { asset: "USDC", protocol: "Kamino", percent: 25, category: "stablecoin" },
            { asset: "SOL-USDC", protocol: "Meteora", percent: 20, category: "lp" },
        ],
        philosophy: "Aggressive yield pursuit with strategic risk management.",
        strengths: ["High yield potential", "Perp vault exposure", "LP fee capture"],
    },
    {
        id: "defi-maximizer",
        name: "DeFi Maximizer",
        description: "Maximum yield extraction across protocols",
        style: "Very Aggressive",
        matchesRiskLevels: ["maximizer"],
        expectedApy: 22.0,
        riskLevel: "high",
        riskScore: 58,
        tvlManaged: "$95M",
        allocations: [
            { asset: "JLP", protocol: "Jupiter", percent: 35, category: "vault" },
            { asset: "SOL-USDC", protocol: "Meteora DLMM", percent: 25, category: "lp" },
            { asset: "SOL Multiply", protocol: "Kamino", percent: 20, category: "vault" },
            { asset: "JitoSOL", protocol: "Jito", percent: 10, category: "lst" },
            { asset: "USDC", protocol: "Drift", percent: 10, category: "vault" },
        ],
        philosophy: "Maximum yield through leverage and active management. High risk, high reward.",
        strengths: ["Highest yield potential", "Leverage strategies", "Active LP management"],
    },
];

const RISK_COLORS = {
    low: "text-green-400",
    medium: "text-yellow-400",
    high: "text-orange-400",
};

const CATEGORY_COLORS = {
    stablecoin: "bg-green-500/20 text-green-400 border-green-500/30",
    lst: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    lp: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    vault: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

interface ComparisonInsight {
    type: "positive" | "neutral" | "warning";
    message: string;
}

function generateInsights(
    userApy: number,
    userRisk: "low" | "medium" | "high",
    curatorApy: number,
    curatorRisk: "low" | "medium" | "high",
    curatorName: string
): ComparisonInsight[] {
    const insights: ComparisonInsight[] = [];
    const apyDiff = userApy - curatorApy;
    const riskOrder = { low: 1, medium: 2, high: 3 };
    const riskDiff = riskOrder[userRisk] - riskOrder[curatorRisk];

    if (apyDiff > 2) {
        insights.push({
            type: "positive",
            message: `Your allocation targets ${apyDiff.toFixed(1)}% higher APY than ${curatorName}`,
        });
    } else if (apyDiff < -2) {
        insights.push({
            type: "neutral",
            message: `${curatorName} targets ${Math.abs(apyDiff).toFixed(1)}% higher APY`,
        });
    }

    if (riskDiff < 0) {
        insights.push({
            type: "positive",
            message: "Your allocation has lower risk exposure",
        });
    } else if (riskDiff > 0) {
        insights.push({
            type: "warning",
            message: "Your allocation has higher risk than this curator",
        });
    }

    if (Math.abs(apyDiff) <= 1 && riskDiff === 0) {
        insights.push({
            type: "positive",
            message: `Your allocation closely matches ${curatorName}'s professional approach`,
        });
    }

    return insights;
}

export function AllocationComparison() {
    const { allocation, riskTolerance, hasAllocation } = useAllocation();
    const [selectedCuratorId, setSelectedCuratorId] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    if (!hasAllocation || !allocation) {
        return null;
    }

    // Find matching curator by risk tolerance, or use selected
    const defaultCurator = riskTolerance
        ? CURATOR_PROFILES.find(c => c.matchesRiskLevels.includes(riskTolerance)) || CURATOR_PROFILES[2]
        : CURATOR_PROFILES[2];

    const selectedCurator = selectedCuratorId
        ? CURATOR_PROFILES.find(c => c.id === selectedCuratorId) || defaultCurator
        : defaultCurator;

    const { summary, allocations: userAllocations } = allocation;

    const insights = generateInsights(
        summary.expectedApy,
        summary.overallRisk,
        selectedCurator.expectedApy,
        selectedCurator.riskLevel,
        selectedCurator.name
    );

    // Calculate category breakdowns
    const userCategories = userAllocations.reduce((acc, alloc) => {
        // Infer category from pool name
        const name = alloc.poolName.toLowerCase();
        let category: "stablecoin" | "lst" | "lp" | "vault" = "stablecoin";
        if (name.includes("sol") && name.includes("usdc")) category = "lp";
        else if (name.includes("jitosol") || name.includes("msol") || name.includes("inf")) category = "lst";
        else if (name.includes("jlp") || name.includes("multiply") || name.includes("insurance")) category = "vault";

        acc[category] = (acc[category] || 0) + alloc.allocation;
        return acc;
    }, {} as Record<string, number>);

    const curatorCategories = selectedCurator.allocations.reduce((acc, alloc) => {
        acc[alloc.category] = (acc[alloc.category] || 0) + alloc.percent;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl overflow-hidden">
            {/* Header */}
            <div
                className="p-4 cursor-pointer hover:bg-slate-800/30 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <GitCompare className="h-5 w-5 text-purple-400" />
                        <div>
                            <h3 className="text-white font-semibold">Compare with Curators</h3>
                            <p className="text-xs text-slate-400">
                                See how your allocation stacks up against professionals
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Quick comparison badge */}
                        <div className="hidden sm:flex items-center gap-2 text-sm">
                            <span className="text-slate-400">vs {selectedCurator.name}:</span>
                            {summary.expectedApy > selectedCurator.expectedApy ? (
                                <span className="text-green-400">+{(summary.expectedApy - selectedCurator.expectedApy).toFixed(1)}% APY</span>
                            ) : summary.expectedApy < selectedCurator.expectedApy ? (
                                <span className="text-slate-400">{(summary.expectedApy - selectedCurator.expectedApy).toFixed(1)}% APY</span>
                            ) : (
                                <span className="text-cyan-400">Matched</span>
                            )}
                        </div>
                        <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="px-4 pb-4 border-t border-slate-700/50">
                    {/* Curator Selector */}
                    <div className="py-4 border-b border-slate-700/30">
                        <label className="text-xs text-slate-400 mb-2 block">Compare with:</label>
                        <div className="flex flex-wrap gap-2">
                            {CURATOR_PROFILES.map(curator => (
                                <button
                                    key={curator.id}
                                    onClick={() => setSelectedCuratorId(curator.id)}
                                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                        selectedCurator.id === curator.id
                                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/50"
                                            : "bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600"
                                    }`}
                                >
                                    <span className="font-medium">{curator.name}</span>
                                    <span className="text-xs ml-1 opacity-70">({curator.style})</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Side by Side Comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                        {/* Your Allocation */}
                        <div className="bg-slate-800/50 rounded-lg p-4 border border-cyan-500/20">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-cyan-400">Your Allocation</span>
                                <span className="text-xs text-slate-500 capitalize">{riskTolerance}</span>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center gap-1">
                                    <TrendingUp className="h-4 w-4 text-green-400" />
                                    <span className="text-white font-bold">{summary.expectedApy.toFixed(1)}%</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Shield className="h-4 w-4 text-slate-400" />
                                    <span className={RISK_COLORS[summary.overallRisk]}>{summary.overallRisk}</span>
                                </div>
                            </div>

                            {/* Category breakdown bar */}
                            <div className="mb-3">
                                <div className="h-2 rounded-full overflow-hidden flex">
                                    {Object.entries(userCategories).map(([cat, percent]) => (
                                        <div
                                            key={cat}
                                            className={`${cat === "stablecoin" ? "bg-green-500" : cat === "lst" ? "bg-cyan-500" : cat === "lp" ? "bg-purple-500" : "bg-orange-500"}`}
                                            style={{ width: `${percent}%` }}
                                        />
                                    ))}
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {Object.entries(userCategories).map(([cat, percent]) => (
                                        <span key={cat} className={`text-xs px-1.5 py-0.5 rounded border ${CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS]}`}>
                                            {cat}: {percent}%
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Positions */}
                            <div className="space-y-1.5">
                                {userAllocations.map((alloc, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-300">{alloc.poolName}</span>
                                            <span className="text-xs text-slate-500">{alloc.protocol}</span>
                                        </div>
                                        <span className="text-white font-medium">{alloc.allocation}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Curator Allocation */}
                        <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/20">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-purple-400">{selectedCurator.name}</span>
                                    {selectedCurator.url && (
                                        <a
                                            href={selectedCurator.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-slate-500 hover:text-slate-300"
                                            onClick={e => e.stopPropagation()}
                                        >
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    )}
                                </div>
                                <span className="text-xs text-slate-500">{selectedCurator.tvlManaged} managed</span>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center gap-1">
                                    <TrendingUp className="h-4 w-4 text-green-400" />
                                    <span className="text-white font-bold">{selectedCurator.expectedApy}%</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Shield className="h-4 w-4 text-slate-400" />
                                    <span className={RISK_COLORS[selectedCurator.riskLevel]}>{selectedCurator.riskLevel}</span>
                                </div>
                            </div>

                            {/* Category breakdown bar */}
                            <div className="mb-3">
                                <div className="h-2 rounded-full overflow-hidden flex">
                                    {Object.entries(curatorCategories).map(([cat, percent]) => (
                                        <div
                                            key={cat}
                                            className={`${cat === "stablecoin" ? "bg-green-500" : cat === "lst" ? "bg-cyan-500" : cat === "lp" ? "bg-purple-500" : "bg-orange-500"}`}
                                            style={{ width: `${percent}%` }}
                                        />
                                    ))}
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {Object.entries(curatorCategories).map(([cat, percent]) => (
                                        <span key={cat} className={`text-xs px-1.5 py-0.5 rounded border ${CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS]}`}>
                                            {cat}: {percent}%
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Positions */}
                            <div className="space-y-1.5">
                                {selectedCurator.allocations.map((alloc, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-300">{alloc.asset}</span>
                                            <span className="text-xs text-slate-500">{alloc.protocol}</span>
                                        </div>
                                        <span className="text-white font-medium">{alloc.percent}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Curator Philosophy */}
                    <div className="p-3 bg-slate-800/30 rounded-lg mb-4">
                        <div className="flex items-start gap-2">
                            <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs text-slate-400 mb-1">{selectedCurator.name}'s approach:</p>
                                <p className="text-sm text-slate-300">{selectedCurator.philosophy}</p>
                            </div>
                        </div>
                    </div>

                    {/* Insights */}
                    {insights.length > 0 && (
                        <div className="space-y-2">
                            {insights.map((insight, idx) => (
                                <div
                                    key={idx}
                                    className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                                        insight.type === "positive"
                                            ? "bg-green-500/10 text-green-400"
                                            : insight.type === "warning"
                                            ? "bg-orange-500/10 text-orange-400"
                                            : "bg-slate-800/50 text-slate-400"
                                    }`}
                                >
                                    {insight.type === "positive" ? (
                                        <CheckCircle className="h-4 w-4 shrink-0" />
                                    ) : insight.type === "warning" ? (
                                        <AlertTriangle className="h-4 w-4 shrink-0" />
                                    ) : (
                                        <Info className="h-4 w-4 shrink-0" />
                                    )}
                                    <span>{insight.message}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Curator Strengths */}
                    <div className="mt-4 pt-4 border-t border-slate-700/30">
                        <p className="text-xs text-slate-400 mb-2">{selectedCurator.name}'s strengths:</p>
                        <div className="flex flex-wrap gap-2">
                            {selectedCurator.strengths.map((strength, idx) => (
                                <span
                                    key={idx}
                                    className="text-xs px-2 py-1 bg-purple-500/10 text-purple-300 rounded-full border border-purple-500/20"
                                >
                                    {strength}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
