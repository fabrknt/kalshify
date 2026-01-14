"use client";

import { useState, useEffect } from "react";
import { X, TrendingUp, TrendingDown, Minus, Lightbulb, AlertTriangle, Loader2, Copy, Check, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CuratorProfile } from "@/lib/curate/curators";
import { CuratorStrategy, CuratorInsight } from "@/lib/curate/curator-strategies";
import { HistoricalPerformanceDisplay } from "./historical-performance";
import { ScenarioSimulator } from "./scenario-simulator";

interface CuratorStrategyPanelProps {
    curatorSlug: string;
    isOpen: boolean;
    onClose: () => void;
}

interface CuratorData {
    profile: CuratorProfile;
    strategies: CuratorStrategy[];
    insight: CuratorInsight;
    lastUpdated: string;
}

const RISK_COLORS = {
    low: "text-green-400 bg-green-500/10 border-green-500/20",
    medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    high: "text-orange-400 bg-orange-500/10 border-orange-500/20",
};

const CHANGE_ICONS = {
    increase: TrendingUp,
    decrease: TrendingDown,
    new: TrendingUp,
    exit: TrendingDown,
};

const CHANGE_COLORS = {
    increase: "text-green-400",
    decrease: "text-red-400",
    new: "text-cyan-400",
    exit: "text-orange-400",
};

function AllocationBar({ allocation }: { allocation: number }) {
    return (
        <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
                className="h-full bg-cyan-500 rounded-full transition-all"
                style={{ width: `${allocation}%` }}
            />
        </div>
    );
}

function formatDollar(amount: number): string {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
    return `$${amount.toLocaleString()}`;
}

export function CuratorStrategyPanel({ curatorSlug, isOpen, onClose }: CuratorStrategyPanelProps) {
    const [data, setData] = useState<CuratorData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [investmentAmount, setInvestmentAmount] = useState<string>("10000");
    const [showDollarAmounts, setShowDollarAmounts] = useState(true);

    useEffect(() => {
        if (isOpen && curatorSlug) {
            fetchCuratorData();
        }
    }, [isOpen, curatorSlug]);

    async function fetchCuratorData() {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`/api/curate/curators/${curatorSlug}`);
            if (!response.ok) throw new Error("Failed to fetch curator data");
            const result = await response.json();
            setData(result);
            // Always select first platform for the new curator
            if (result.strategies.length > 0) {
                setSelectedPlatform(result.strategies[0].platform);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load curator data");
        } finally {
            setLoading(false);
        }
    }

    const currentStrategy = data?.strategies.find(s => s.platform === selectedPlatform);

    const handleCopyStrategy = () => {
        if (!currentStrategy) return;
        const amount = Number(investmentAmount) || 0;
        const lines = currentStrategy.allocations.map(a => {
            const dollarAmount = amount > 0 ? amount * (a.allocation / 100) : null;
            const base = `${a.allocation}% - ${a.pool} (${a.asset}) @ ${a.apy}% APY`;
            return dollarAmount ? `${base} → ${formatDollar(dollarAmount)}` : base;
        });
        if (amount > 0) {
            lines.unshift(`${data?.profile.name} Strategy - ${formatDollar(amount)} allocation:`);
            lines.push(`\nExpected yield: +${formatDollar(amount * (currentStrategy.profile.avgApy / 100))}/year`);
        }
        navigator.clipboard.writeText(lines.join("\n"));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 z-40"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed right-0 top-0 h-full w-full max-w-xl bg-slate-900 border-l border-slate-700 z-50 overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-4 flex items-center justify-between z-10">
                            <div>
                                <h2 className="text-lg font-semibold text-white">
                                    {data?.profile.name || "Curator"} Strategy
                                </h2>
                                {data && (
                                    <p className="text-sm text-slate-400">
                                        Last updated: {new Date(data.lastUpdated).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-4 pb-24 md:pb-4">
                            {loading ? (
                                <div className="flex items-center justify-center py-12 text-slate-400">
                                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                    Loading strategy...
                                </div>
                            ) : error ? (
                                <div className="flex items-center justify-center py-12 text-red-400">
                                    <AlertTriangle className="h-5 w-5 mr-2" />
                                    {error}
                                </div>
                            ) : data && currentStrategy ? (
                                <>
                                    {/* Platform Tabs */}
                                    {data.strategies.length > 1 && (
                                        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                                            {data.strategies.map((strategy) => (
                                                <button
                                                    key={strategy.platform}
                                                    onClick={() => setSelectedPlatform(strategy.platform)}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                                                        selectedPlatform === strategy.platform
                                                            ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                                                            : "bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600"
                                                    }`}
                                                >
                                                    {strategy.platform} ({strategy.chain})
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Follow This Strategy - Investment Calculator */}
                                    <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl p-4 mb-6 border border-cyan-500/20">
                                        <div className="flex items-center gap-2 mb-3">
                                            <DollarSign className="h-4 w-4 text-cyan-400" />
                                            <h3 className="text-sm font-medium text-cyan-300">Follow This Strategy</h3>
                                        </div>
                                        <p className="text-xs text-slate-400 mb-3">
                                            Enter your investment amount to see exactly how to allocate
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <div className="relative flex-1">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                                <input
                                                    type="text"
                                                    value={investmentAmount}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/[^0-9]/g, "");
                                                        setInvestmentAmount(value);
                                                    }}
                                                    className="w-full bg-slate-800 border border-slate-600 rounded-lg py-2 pl-7 pr-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                                    placeholder="10000"
                                                />
                                            </div>
                                            <div className="flex gap-1">
                                                {["1000", "5000", "10000", "50000"].map((preset) => (
                                                    <button
                                                        key={preset}
                                                        onClick={() => setInvestmentAmount(preset)}
                                                        className={`px-2 py-1 text-xs rounded transition-colors ${
                                                            investmentAmount === preset
                                                                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                                                                : "bg-slate-700 text-slate-400 border border-slate-600 hover:border-slate-500"
                                                        }`}
                                                    >
                                                        ${Number(preset).toLocaleString()}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        {investmentAmount && Number(investmentAmount) > 0 && (
                                            <div className="mt-4 pt-4 border-t border-slate-700/50">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-slate-400">Expected Annual Yield</span>
                                                    <span className="text-green-400 font-semibold">
                                                        +{formatDollar(Number(investmentAmount) * (currentStrategy.profile.avgApy / 100))}/year
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Strategy Profile */}
                                    <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-slate-700">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-sm font-medium text-slate-300">Strategy Profile</h3>
                                            <span className={`px-2 py-1 text-xs rounded capitalize ${
                                                currentStrategy.profile.riskTolerance === "conservative"
                                                    ? "bg-green-500/20 text-green-400"
                                                    : currentStrategy.profile.riskTolerance === "moderate"
                                                    ? "bg-yellow-500/20 text-yellow-400"
                                                    : "bg-orange-500/20 text-orange-400"
                                            }`}>
                                                {currentStrategy.profile.riskTolerance}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <div className="text-xs text-slate-500">Avg APY</div>
                                                <div className="text-lg font-semibold text-green-400">
                                                    {currentStrategy.profile.avgApy.toFixed(1)}%
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-slate-500">Avg Risk</div>
                                                <div className="text-lg font-semibold text-white">
                                                    {currentStrategy.profile.avgRiskScore}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-slate-500">Diversification</div>
                                                <div className="text-lg font-semibold text-cyan-400">
                                                    {currentStrategy.profile.diversificationScore}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Historical Performance */}
                                    {currentStrategy.historicalPerformance && currentStrategy.historicalPerformance.length > 0 && (
                                        <div className="mb-6">
                                            <HistoricalPerformanceDisplay
                                                performance={currentStrategy.historicalPerformance}
                                                curatorName={data.profile.name}
                                            />
                                        </div>
                                    )}

                                    {/* Scenario Analysis */}
                                    <div className="mb-6">
                                        <ScenarioSimulator
                                            allocations={currentStrategy.allocations}
                                            totalAmount={Number(investmentAmount) || 10000}
                                            title="Stress Test This Strategy"
                                        />
                                    </div>

                                    {/* Allocations */}
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-sm font-medium text-slate-300">
                                                {investmentAmount && Number(investmentAmount) > 0
                                                    ? `Your ${formatDollar(Number(investmentAmount))} Allocation`
                                                    : "Allocation Breakdown"}
                                            </h3>
                                            <button
                                                onClick={handleCopyStrategy}
                                                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                                            >
                                                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                                {copied ? "Copied!" : "Copy"}
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {currentStrategy.allocations.map((alloc, idx) => {
                                                const dollarAmount = investmentAmount && Number(investmentAmount) > 0
                                                    ? Number(investmentAmount) * (alloc.allocation / 100)
                                                    : null;
                                                const annualYield = dollarAmount
                                                    ? dollarAmount * (alloc.apy / 100)
                                                    : null;

                                                return (
                                                    <div
                                                        key={idx}
                                                        className="bg-slate-800/50 rounded-lg p-3 border border-slate-700"
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div>
                                                                <div className="text-sm font-medium text-white">{alloc.pool}</div>
                                                                <div className="text-xs text-slate-400">{alloc.asset}</div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-sm font-semibold text-green-400">{alloc.apy}% APY</div>
                                                                <span className={`text-xs px-1.5 py-0.5 rounded border ${RISK_COLORS[alloc.riskLevel]}`}>
                                                                    {alloc.riskLevel}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <AllocationBar allocation={alloc.allocation} />
                                                                <span className="text-sm text-white font-medium">{alloc.allocation}%</span>
                                                            </div>
                                                            {dollarAmount !== null && (
                                                                <div className="text-right">
                                                                    <div className="text-sm font-semibold text-cyan-400">
                                                                        {formatDollar(dollarAmount)}
                                                                    </div>
                                                                    <div className="text-xs text-green-400/70">
                                                                        +{formatDollar(annualYield!)}/yr
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {/* Reasoning section */}
                                                        {alloc.reasoning && (
                                                            <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-2 text-xs">
                                                                <div className="flex items-start gap-2">
                                                                    <Lightbulb className="h-3.5 w-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />
                                                                    <p className="text-slate-300">{alloc.reasoning.whyThisAsset}</p>
                                                                </div>
                                                                <div className="pl-5 space-y-1 text-slate-400">
                                                                    <p><span className="text-slate-500">Allocation: </span>{alloc.reasoning.whyThisPercent}</p>
                                                                    <p><span className="text-slate-500">Risk: </span>{alloc.reasoning.riskMitigation}</p>
                                                                    <p><span className="text-yellow-500/70">Tradeoff: </span>{alloc.reasoning.tradeoff}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Recent Changes */}
                                    {currentStrategy.recentChanges.length > 0 && (
                                        <div className="mb-6">
                                            <h3 className="text-sm font-medium text-slate-300 mb-3">Recent Changes</h3>
                                            <div className="space-y-2">
                                                {currentStrategy.recentChanges.slice(0, 3).map((change, idx) => {
                                                    const Icon = CHANGE_ICONS[change.type];
                                                    return (
                                                        <div
                                                            key={idx}
                                                            className="flex items-start gap-3 text-sm bg-slate-800/30 rounded-lg p-3"
                                                        >
                                                            <Icon className={`h-4 w-4 mt-0.5 ${CHANGE_COLORS[change.type]}`} />
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-white">{change.pool}</span>
                                                                    <span className="text-slate-500">
                                                                        {change.oldAllocation}% → {change.newAllocation}%
                                                                    </span>
                                                                </div>
                                                                {change.reason && (
                                                                    <p className="text-xs text-slate-400 mt-1">{change.reason}</p>
                                                                )}
                                                                <p className="text-xs text-slate-500 mt-1">{change.date}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* AI Insight */}
                                    <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg p-4 border border-cyan-500/20 mb-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Lightbulb className="h-4 w-4 text-cyan-400" />
                                            <h3 className="text-sm font-medium text-cyan-300">Strategy Analysis</h3>
                                        </div>
                                        <p className="text-sm text-slate-300 mb-4">
                                            {data.insight.strategyAnalysis}
                                        </p>
                                        <div className="space-y-2">
                                            {data.insight.keyTakeaways.slice(0, 3).map((takeaway, idx) => (
                                                <div key={idx} className="flex items-start gap-2 text-xs text-slate-400">
                                                    <span className="text-cyan-400 mt-0.5">•</span>
                                                    {takeaway}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Considerations */}
                                    <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
                                        <div className="flex items-center gap-2 mb-3">
                                            <AlertTriangle className="h-4 w-4 text-yellow-400" />
                                            <h3 className="text-sm font-medium text-slate-300">Important Considerations</h3>
                                        </div>
                                        <ul className="space-y-1">
                                            {data.insight.considerations.map((item, idx) => (
                                                <li key={idx} className="text-xs text-slate-400 flex items-start gap-2">
                                                    <Minus className="h-3 w-3 mt-0.5 text-slate-600" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* End of content indicator */}
                                    <div className="mt-6 pt-4 border-t border-slate-800 text-center">
                                        <p className="text-xs text-slate-600">
                                            End of strategy details
                                        </p>
                                    </div>
                                </>
                            ) : null}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
