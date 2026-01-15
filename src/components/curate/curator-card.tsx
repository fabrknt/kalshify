"use client";

import { useState, useMemo } from "react";
import { Shield, TrendingUp, ChevronRight, ChevronDown, Lightbulb, Scale, Grid3X3, Clock, Droplet, Link2 } from "lucide-react";
import { CuratorProfile } from "@/lib/curate/curators";
import { PrincipleBadgeGroup, PrincipleModal, usePrincipleModal } from "./curation-principles";
import { getPrinciple } from "@/lib/curate/curation-principles";

// Mini icon map for principle badges
const miniIconMap: Record<string, React.ElementType> = {
    scale: Scale,
    grid: Grid3X3,
    clock: Clock,
    shield: Shield,
    droplet: Droplet,
    link: Link2,
};

interface AllocationReasoning {
    whyThisAsset: string;
    whyThisPercent: string;
    riskMitigation: string;
    tradeoff: string;
}

interface StrategyAllocation {
    pool: string;
    asset: string;
    allocation: number;
    apy: number;
    riskLevel: "low" | "medium" | "high";
    reasoning?: AllocationReasoning;
    principleIds?: string[];
}

interface StrategyMetrics {
    avgApy: number;
    riskScore: number;
    riskTolerance: "conservative" | "moderate" | "aggressive";
    topAssets: string[];
    allocations?: StrategyAllocation[];
}

interface CuratorCardProps {
    curator: CuratorProfile;
    strategyMetrics?: StrategyMetrics;
    onViewStrategy?: () => void;
}

function formatDollar(amount: number): string {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
    return `$${amount.toLocaleString()}`;
}

const RISK_COLORS = {
    conservative: "text-green-400 bg-green-500/10 border-green-500/30",
    moderate: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
    aggressive: "text-orange-400 bg-orange-500/10 border-orange-500/30",
};

const RISK_LABELS = {
    conservative: "Conservative",
    moderate: "Balanced",
    aggressive: "Aggressive",
};

const ALLOC_RISK_COLORS = {
    low: "text-green-400",
    medium: "text-yellow-400",
    high: "text-orange-400",
};

export function CuratorCard({ curator, strategyMetrics, onViewStrategy }: CuratorCardProps) {
    const [investmentAmount, setInvestmentAmount] = useState<string>("10000");
    const [expandedAllocation, setExpandedAllocation] = useState<number | null>(null);
    const { selectedPrinciple, openPrinciple, closePrinciple } = usePrincipleModal();

    const amount = Number(investmentAmount) || 0;
    const expectedYield = amount * ((strategyMetrics?.avgApy || 0) / 100);

    const displayAllocations = strategyMetrics?.allocations || [];

    // Calculate top principles used across all allocations
    const topPrinciples = useMemo(() => {
        const principleCount: Record<string, number> = {};
        displayAllocations.forEach(alloc => {
            alloc.principleIds?.forEach(id => {
                principleCount[id] = (principleCount[id] || 0) + 1;
            });
        });
        return Object.entries(principleCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([id]) => getPrinciple(id))
            .filter(Boolean);
    }, [displayAllocations]);

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden hover:border-slate-600 transition-all">
            {/* Header */}
            <div className="p-4 pb-3">
                <div className="flex items-start justify-between mb-2">
                    <div>
                        <h3 className="text-lg font-semibold text-white">
                            {curator.name}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1">
                                <Shield className="h-3 w-3 text-green-400" />
                                <span className="text-xs text-green-400">{curator.trustScore}</span>
                            </div>
                            <span className="text-xs text-slate-500">{curator.trackRecord.split(",")[0]}</span>
                        </div>
                    </div>
                    {strategyMetrics && (
                        <div className={`px-2.5 py-1 rounded-lg border text-xs font-medium ${RISK_COLORS[strategyMetrics.riskTolerance]}`}>
                            {RISK_LABELS[strategyMetrics.riskTolerance]}
                        </div>
                    )}
                </div>

                {/* APY highlight */}
                {strategyMetrics && (
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="h-4 w-4 text-green-400" />
                        <span className="text-2xl font-bold text-green-400">
                            {strategyMetrics.avgApy.toFixed(1)}%
                        </span>
                        <span className="text-sm text-slate-400">APY</span>
                    </div>
                )}

                {/* Top principles used by this curator */}
                {topPrinciples.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs text-slate-500">Focus:</span>
                        {topPrinciples.map(principle => {
                            if (!principle) return null;
                            const Icon = miniIconMap[principle.icon];
                            return (
                                <button
                                    key={principle.id}
                                    onClick={() => openPrinciple(principle)}
                                    className="flex items-center gap-1 px-1.5 py-0.5 text-xs rounded bg-slate-700/50 text-slate-300 hover:bg-slate-700 transition-colors"
                                    title={principle.name}
                                >
                                    <Icon className="h-3 w-3" />
                                    <span>{principle.shortName}</span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Allocations - expandable with reasoning */}
            {displayAllocations.length > 0 && (
                <div className="px-4 pb-3">
                    <div className="text-xs text-slate-500 mb-2">Allocation</div>
                    <div className="space-y-1">
                        {displayAllocations.map((alloc, idx) => (
                            <div key={idx}>
                                <button
                                    onClick={() => setExpandedAllocation(expandedAllocation === idx ? null : idx)}
                                    className="w-full flex items-center justify-between text-sm py-1 hover:bg-slate-700/30 rounded px-1 -mx-1 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-medium w-10">{alloc.allocation}%</span>
                                        <span className="text-slate-300">{alloc.asset}</span>
                                        {alloc.reasoning && (
                                            <ChevronDown className={`h-3 w-3 text-slate-500 transition-transform ${expandedAllocation === idx ? "rotate-180" : ""}`} />
                                        )}
                                    </div>
                                    <span className={`text-xs ${ALLOC_RISK_COLORS[alloc.riskLevel]}`}>
                                        {alloc.apy}%
                                    </span>
                                </button>
                                {/* Expanded reasoning */}
                                {expandedAllocation === idx && alloc.reasoning && (
                                    <div className="mt-1 mb-2 ml-1 pl-3 border-l-2 border-cyan-500/30 space-y-2 text-xs">
                                        {/* Principle badges */}
                                        {alloc.principleIds && alloc.principleIds.length > 0 && (
                                            <div className="mb-2">
                                                <PrincipleBadgeGroup
                                                    principleIds={alloc.principleIds}
                                                    onPrincipleClick={openPrinciple}
                                                />
                                            </div>
                                        )}
                                        <div>
                                            <div className="flex items-center gap-1 text-cyan-400 mb-0.5">
                                                <Lightbulb className="h-3 w-3" />
                                                <span className="font-medium">Why {alloc.asset}?</span>
                                            </div>
                                            <p className="text-slate-400">{alloc.reasoning.whyThisAsset}</p>
                                        </div>
                                        <div>
                                            <span className="text-slate-500">Why {alloc.allocation}%: </span>
                                            <span className="text-slate-400">{alloc.reasoning.whyThisPercent}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500">Risk mitigation: </span>
                                            <span className="text-slate-400">{alloc.reasoning.riskMitigation}</span>
                                        </div>
                                        <div>
                                            <span className="text-yellow-500/70">Tradeoff: </span>
                                            <span className="text-slate-400">{alloc.reasoning.tradeoff}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Investment Calculator - inline */}
            <div className="px-4 py-3 bg-slate-900/50 border-t border-slate-700/50">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-slate-400">If you invest</span>
                    <div className="relative flex-1">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                        <input
                            type="text"
                            value={investmentAmount}
                            onChange={(e) => setInvestmentAmount(e.target.value.replace(/[^0-9]/g, ""))}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-slate-800 border border-slate-600 rounded py-1 pl-5 pr-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                            placeholder="10000"
                        />
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Expected annual yield</span>
                    <span className="text-lg font-bold text-green-400">
                        +{formatDollar(expectedYield)}<span className="text-xs font-normal text-slate-400">/yr</span>
                    </span>
                </div>
            </div>

            {/* Footer */}
            <button
                onClick={onViewStrategy}
                className="w-full px-4 py-2.5 bg-slate-900/30 border-t border-slate-700/50 text-sm text-cyan-400 hover:text-cyan-300 hover:bg-slate-800/50 transition-colors flex items-center justify-center gap-1"
            >
                Full Details & How to Replicate
                <ChevronRight className="h-4 w-4" />
            </button>

            {/* Principle detail modal */}
            <PrincipleModal principle={selectedPrinciple} onClose={closePrinciple} />
        </div>
    );
}
