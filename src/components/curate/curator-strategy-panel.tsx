"use client";

import { useState, useEffect } from "react";
import { X, Shield, TrendingUp, TrendingDown, Minus, Lightbulb, AlertTriangle, Loader2, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CuratorProfile } from "@/lib/curate/curators";
import { CuratorStrategy, CuratorInsight } from "@/lib/curate/curator-strategies";

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

export function CuratorStrategyPanel({ curatorSlug, isOpen, onClose }: CuratorStrategyPanelProps) {
    const [data, setData] = useState<CuratorData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

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
            // Auto-select first platform
            if (result.strategies.length > 0 && !selectedPlatform) {
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
        const text = currentStrategy.allocations
            .map(a => `${a.allocation}% - ${a.pool} (${a.asset}) @ ${a.apy}% APY`)
            .join("\n");
        navigator.clipboard.writeText(text);
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

                                    {/* Allocations */}
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-sm font-medium text-slate-300">Current Allocations</h3>
                                            <button
                                                onClick={handleCopyStrategy}
                                                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                                            >
                                                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                                {copied ? "Copied!" : "Copy"}
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {currentStrategy.allocations.map((alloc, idx) => (
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
                                                    <div className="flex items-center gap-3">
                                                        <AllocationBar allocation={alloc.allocation} />
                                                        <span className="text-sm text-white font-medium">{alloc.allocation}%</span>
                                                    </div>
                                                </div>
                                            ))}
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
