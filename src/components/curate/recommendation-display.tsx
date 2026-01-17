"use client";

import { useState } from "react";
import { useAllocation } from "@/contexts/allocation-context";
import {
    TrendingUp,
    Shield,
    AlertTriangle,
    ChevronDown,
    PieChart,
    CheckCircle,
    Check,
    Info,
    RefreshCw,
    Lightbulb,
    Scale,
    XCircle,
    ArrowRight,
    ExternalLink,
} from "lucide-react";
import { RiskTolerance } from "./quick-start";

// Enhanced reasoning structure for each allocation
export interface EnhancedReasoning {
    whyThisPool: string;           // Why we chose this specific pool
    whyThisPercentage: string;     // Why this allocation percentage
    alternativesConsidered: {      // What else we looked at
        pool: string;
        protocol: string;
        whyNot: string;
    }[];
    riskMitigation: string;        // How risk is managed in this position
    tradeoff: string;              // What you're giving up
}

export interface RecommendedAllocation {
    poolId: string;
    poolName: string;
    protocol: string;
    asset: string;
    allocation: number; // percentage
    apy: number;
    riskLevel: "low" | "medium" | "high";
    riskScore: number;
    reasoning: string;              // Short one-liner (backward compat)
    enhancedReasoning?: EnhancedReasoning;  // Detailed reasoning
    url?: string; // link to protocol
}

export interface AllocationRecommendation {
    allocations: RecommendedAllocation[];
    summary: {
        totalAmount: number;
        expectedApy: number;
        expectedYield: number;
        overallRisk: "low" | "medium" | "high";
        diversificationScore: number;
    };
    insights: string[];
    warnings: string[];
}

interface RecommendationDisplayProps {
    recommendation: AllocationRecommendation;
    riskTolerance: RiskTolerance;
    onReset: () => void;
    onViewDetails: (poolId: string) => void;
}

const RISK_COLORS = {
    low: "text-green-400 bg-green-500/10 border-green-500/30",
    medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
    high: "text-orange-400 bg-orange-500/10 border-orange-500/30",
};

const ALLOCATION_COLORS = [
    "from-cyan-500 to-cyan-400",
    "from-purple-500 to-purple-400",
    "from-green-500 to-green-400",
    "from-yellow-500 to-yellow-400",
    "from-orange-500 to-orange-400",
];

function formatCurrency(amount: number): string {
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(2)}M`;
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
    return `$${amount.toFixed(0)}`;
}

// Component to display enhanced reasoning for a single allocation
function AllocationReasoningPanel({
    alloc,
    isExpanded,
    onToggle
}: {
    alloc: RecommendedAllocation;
    isExpanded: boolean;
    onToggle: () => void;
}) {
    const reasoning = alloc.enhancedReasoning;

    if (!reasoning) {
        return (
            <p className="text-sm text-slate-400 mt-1">{alloc.reasoning}</p>
        );
    }

    return (
        <div className="mt-1">
            <button
                onClick={(e) => { e.stopPropagation(); onToggle(); }}
                className="flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            >
                <Lightbulb className="h-3 w-3" />
                <span>Why this choice?</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
            </button>

            {isExpanded && (
                <div className="mt-3 space-y-3 pl-3 border-l-2 border-cyan-500/30">
                    {/* Why this pool */}
                    <div>
                        <div className="flex items-center gap-1 text-xs text-cyan-400 mb-1">
                            <CheckCircle className="h-3 w-3" />
                            <span className="font-medium">Why {alloc.poolName}?</span>
                        </div>
                        <p className="text-sm text-slate-300">{reasoning.whyThisPool}</p>
                    </div>

                    {/* Why this percentage */}
                    <div>
                        <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
                            <Scale className="h-3 w-3" />
                            <span className="font-medium">Why {alloc.allocation}%?</span>
                        </div>
                        <p className="text-sm text-slate-400">{reasoning.whyThisPercentage}</p>
                    </div>

                    {/* Alternatives considered */}
                    {reasoning.alternativesConsidered.length > 0 && (
                        <div>
                            <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                                <XCircle className="h-3 w-3" />
                                <span className="font-medium">Alternatives we considered</span>
                            </div>
                            <div className="space-y-1">
                                {reasoning.alternativesConsidered.map((alt, idx) => (
                                    <div key={idx} className="flex items-start gap-2 text-xs">
                                        <ArrowRight className="h-3 w-3 text-slate-600 mt-0.5 shrink-0" />
                                        <span className="text-slate-500">
                                            <span className="text-slate-400">{alt.pool}</span> ({alt.protocol}): {alt.whyNot}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Risk mitigation */}
                    <div>
                        <div className="flex items-center gap-1 text-xs text-green-400/70 mb-1">
                            <Shield className="h-3 w-3" />
                            <span className="font-medium">Risk mitigation</span>
                        </div>
                        <p className="text-sm text-slate-400">{reasoning.riskMitigation}</p>
                    </div>

                    {/* Tradeoff */}
                    <div>
                        <div className="flex items-center gap-1 text-xs text-yellow-400/70 mb-1">
                            <AlertTriangle className="h-3 w-3" />
                            <span className="font-medium">Tradeoff</span>
                        </div>
                        <p className="text-sm text-slate-400">{reasoning.tradeoff}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export function RecommendationDisplay({
    recommendation,
    riskTolerance,
    onReset,
    onViewDetails,
}: RecommendationDisplayProps) {
    const { allocations, summary, insights, warnings } = recommendation;
    const [expandedPool, setExpandedPool] = useState<string | null>(null);
    const { completedPools, togglePoolComplete, allPoolsCompleted, completedCount } = useAllocation();

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                    Here&apos;s Where to Put Your {formatCurrency(summary.totalAmount)}
                </h2>
                <p className="text-slate-400">
                    Based on your{" "}
                    <span className="text-white capitalize">{riskTolerance}</span> risk preference
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-900/70 border border-slate-700 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm text-slate-500">Expected APY</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{summary.expectedApy.toFixed(1)}%</p>
                </div>
                <div className="bg-slate-900/70 border border-slate-700 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-cyan-400 mb-1">
                        <span className="text-sm text-slate-500">Annual Yield</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{formatCurrency(summary.expectedYield)}</p>
                </div>
                <div className="bg-slate-900/70 border border-slate-700 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
                        <Shield className="h-4 w-4" />
                        <span className="text-sm text-slate-500">Risk Level</span>
                    </div>
                    <p className={`text-2xl font-bold capitalize ${
                        summary.overallRisk === "low" ? "text-green-400" :
                        summary.overallRisk === "medium" ? "text-yellow-400" : "text-orange-400"
                    }`}>
                        {summary.overallRisk}
                    </p>
                </div>
            </div>

            {/* Allocation Visual */}
            <div className="bg-slate-900/70 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <PieChart className="h-5 w-5 text-slate-500" />
                        <h3 className="text-lg font-semibold text-white">Your Allocation</h3>
                    </div>
                    {/* Completion status */}
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                        allPoolsCompleted
                            ? "bg-green-500/20 text-green-400"
                            : "bg-slate-700/50 text-slate-400"
                    }`}>
                        {allPoolsCompleted ? (
                            <>
                                <CheckCircle className="h-4 w-4" />
                                <span>All executed</span>
                            </>
                        ) : (
                            <span>{completedCount}/{allocations.length} done</span>
                        )}
                    </div>
                </div>

                {/* Allocation Bar */}
                <div className="h-8 rounded-full overflow-hidden flex mb-6">
                    {allocations.map((alloc, idx) => (
                        <div
                            key={alloc.poolId}
                            className={`bg-gradient-to-r ${ALLOCATION_COLORS[idx % ALLOCATION_COLORS.length]} relative group`}
                            style={{ width: `${alloc.allocation}%` }}
                        >
                            {alloc.allocation >= 15 && (
                                <span className="absolute inset-0 flex items-center justify-center text-white text-sm font-medium">
                                    {alloc.allocation}%
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Allocation List with Execute Actions */}
                <div className="space-y-3">
                    {allocations.map((alloc, idx) => (
                        <div
                            key={alloc.poolId}
                            className={`p-4 bg-slate-800/50 rounded-xl transition-colors border border-slate-700/50 ${
                                expandedPool === alloc.poolId ? "bg-slate-800" : ""
                            }`}
                        >
                            <div className="flex items-start gap-4">
                                {/* Step number */}
                                <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${ALLOCATION_COLORS[idx % ALLOCATION_COLORS.length]} flex items-center justify-center shrink-0`}>
                                    <span className="text-sm font-bold text-white">{idx + 1}</span>
                                </div>

                                {/* Pool info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <span className="font-medium text-white">{alloc.poolName}</span>
                                        <span className="text-sm text-slate-500">{alloc.protocol}</span>
                                        <span className={`text-xs px-1.5 py-0.5 rounded border ${RISK_COLORS[alloc.riskLevel]}`}>
                                            {alloc.riskLevel}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-400">
                                        {alloc.apy.toFixed(1)}% APY
                                    </p>

                                    {/* Reasoning panel */}
                                    <AllocationReasoningPanel
                                        alloc={alloc}
                                        isExpanded={expandedPool === alloc.poolId}
                                        onToggle={() => setExpandedPool(
                                            expandedPool === alloc.poolId ? null : alloc.poolId
                                        )}
                                    />
                                </div>

                                {/* Allocation, Amount & Execute */}
                                <div className="text-right shrink-0 flex flex-col items-end gap-2">
                                    <div>
                                        <p className="text-lg font-bold text-white">{alloc.allocation}%</p>
                                        <p className="text-lg font-bold text-cyan-400">
                                            {formatCurrency(summary.totalAmount * alloc.allocation / 100)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {alloc.url && (
                                            <a
                                                href={alloc.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/50 text-slate-400 hover:bg-cyan-500/20 hover:text-cyan-400 rounded-lg text-xs font-medium transition-colors"
                                            >
                                                Go to {alloc.protocol} <ExternalLink className="h-3 w-3" />
                                            </a>
                                        )}
                                        <button
                                            onClick={() => togglePoolComplete(alloc.poolId)}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                                completedPools.has(alloc.poolId)
                                                    ? "bg-green-500/20 text-green-400"
                                                    : "bg-slate-700/50 text-slate-400 hover:bg-slate-600/50"
                                            }`}
                                        >
                                            <Check className="h-3 w-3" />
                                            {completedPools.has(alloc.poolId) ? "Done" : "Mark done"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Insights - Why this allocation */}
                {insights.length > 0 && (
                    <div className="mt-4 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                            <Info className="h-4 w-4 text-cyan-400" />
                            <span className="text-sm font-medium text-cyan-400">Why this allocation?</span>
                        </div>
                        <ul className="space-y-2">
                            {insights.map((insight, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-cyan-300">
                                    <CheckCircle className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                                    <span>{insight}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Note about self-custody */}
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-xs text-yellow-300">
                        <strong>Note:</strong> You execute all transactions yourself using your own wallet. We never touch your funds.
                    </p>
                </div>
            </div>

            {/* Warnings */}
            {warnings.length > 0 && (
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="h-4 w-4 text-orange-400" />
                        <span className="text-sm font-medium text-orange-400">Things to consider</span>
                    </div>
                    <ul className="space-y-2">
                        {warnings.map((warning, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-orange-300">
                                <span className="text-orange-400">•</span>
                                <span>{warning}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Start over button */}
            <div className="text-center">
                <button
                    onClick={onReset}
                    className="inline-flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                    <RefreshCw className="h-4 w-4" />
                    Start over with different preferences
                </button>
            </div>
        </div>
    );
}
