"use client";

import { useState } from "react";
import { X, Briefcase, RefreshCw, AlertTriangle, TrendingUp, PieChart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PortfolioAllocation {
    pool: {
        id: string;
        chain: string;
        project: string;
        symbol: string;
        apy: number;
        riskScore: number;
        riskLevel: string;
    };
    allocationPercent: number;
    allocationUsd: number;
    expectedAnnualYield: number;
    rationale: string;
}

interface PortfolioResult {
    allocations: PortfolioAllocation[];
    summary: {
        totalAllocation: number;
        expectedAnnualYield: number;
        weightedApy: number;
        combinedRiskScore: number;
        diversificationScore: number;
        poolCount: number;
    };
    reasoning: string;
    riskWarnings: string[];
}

interface PortfolioOptimizerProps {
    isOpen: boolean;
    onClose: () => void;
    onPoolClick: (poolId: string) => void;
}

const RISK_COLORS: Record<string, string> = {
    low: "bg-green-500",
    medium: "bg-yellow-500",
    high: "bg-orange-500",
    very_high: "bg-red-500",
};

function formatUsd(amount: number): string {
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(2)}M`;
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
    return `$${amount.toFixed(0)}`;
}

export function PortfolioOptimizer({ isOpen, onClose, onPoolClick }: PortfolioOptimizerProps) {
    const [step, setStep] = useState<"input" | "loading" | "result">("input");
    const [totalAllocation, setTotalAllocation] = useState<string>("10000");
    const [riskTolerance, setRiskTolerance] = useState<"conservative" | "moderate" | "aggressive">("moderate");
    const [diversification, setDiversification] = useState<"focused" | "balanced" | "diversified">("balanced");
    const [result, setResult] = useState<PortfolioResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleOptimize = async () => {
        const amount = parseFloat(totalAllocation);
        if (isNaN(amount) || amount <= 0) {
            setError("Please enter a valid amount");
            return;
        }

        setStep("loading");
        setError(null);

        try {
            const response = await fetch("/api/curate/ai/portfolio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    totalAllocation: amount,
                    riskTolerance,
                    diversification,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to optimize portfolio");
            }

            const data = await response.json();
            setResult(data);
            setStep("result");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to optimize portfolio");
            setStep("input");
        }
    };

    const handleReset = () => {
        setStep("input");
        setResult(null);
        setError(null);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-40"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[90vh] bg-slate-900 border border-slate-700 rounded-xl z-50 overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-700">
                            <div className="flex items-center gap-2">
                                <Briefcase className="h-5 w-5 text-cyan-400" />
                                <h2 className="text-lg font-semibold text-white">Portfolio Optimizer</h2>
                            </div>
                            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {step === "input" && (
                                <div className="space-y-6">
                                    <p className="text-sm text-slate-400">
                                        AI will analyze available pools and suggest an optimal allocation based on your preferences.
                                    </p>

                                    {error && (
                                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">
                                            {error}
                                        </div>
                                    )}

                                    {/* Amount */}
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-2">
                                            Total Allocation
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                            <input
                                                type="number"
                                                min={1000}
                                                value={totalAllocation}
                                                onChange={(e) => setTotalAllocation(e.target.value)}
                                                className="w-full pl-7 pr-3 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                                                placeholder="10000"
                                            />
                                        </div>
                                    </div>

                                    {/* Risk Tolerance */}
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-2">
                                            Risk Tolerance
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {(["conservative", "moderate", "aggressive"] as const).map((level) => (
                                                <button
                                                    key={level}
                                                    onClick={() => setRiskTolerance(level)}
                                                    className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                                                        riskTolerance === level
                                                            ? level === "conservative"
                                                                ? "bg-green-500/20 text-green-400 border border-green-500/50"
                                                                : level === "moderate"
                                                                ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/50"
                                                                : "bg-red-500/20 text-red-400 border border-red-500/50"
                                                            : "bg-slate-800 text-slate-400 border border-slate-700"
                                                    }`}
                                                >
                                                    {level}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Diversification */}
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-2">
                                            Diversification
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {([
                                                { key: "focused", label: "Focused", desc: "3 pools" },
                                                { key: "balanced", label: "Balanced", desc: "4 pools" },
                                                { key: "diversified", label: "Diversified", desc: "5 pools" },
                                            ] as const).map(({ key, label, desc }) => (
                                                <button
                                                    key={key}
                                                    onClick={() => setDiversification(key)}
                                                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                                                        diversification === key
                                                            ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                                                            : "bg-slate-800 text-slate-400 border border-slate-700"
                                                    }`}
                                                >
                                                    <div className="font-medium">{label}</div>
                                                    <div className="text-xs opacity-70">{desc}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleOptimize}
                                        className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-medium rounded-lg transition-colors"
                                    >
                                        Optimize Portfolio
                                    </button>
                                </div>
                            )}

                            {step === "loading" && (
                                <div className="flex flex-col items-center justify-center py-16">
                                    <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin mb-4" />
                                    <p className="text-slate-400">Analyzing pools and optimizing allocation...</p>
                                </div>
                            )}

                            {step === "result" && result && (
                                <div className="space-y-6">
                                    {/* Summary */}
                                    <div className="grid grid-cols-4 gap-3">
                                        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                                            <p className="text-xs text-slate-500">Expected Yield</p>
                                            <p className="text-lg font-bold text-green-400">
                                                {formatUsd(result.summary.expectedAnnualYield)}
                                            </p>
                                            <p className="text-xs text-slate-500">/year</p>
                                        </div>
                                        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                                            <p className="text-xs text-slate-500">Weighted APY</p>
                                            <p className="text-lg font-bold text-cyan-400">
                                                {result.summary.weightedApy.toFixed(2)}%
                                            </p>
                                        </div>
                                        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                                            <p className="text-xs text-slate-500">Risk Score</p>
                                            <p className="text-lg font-bold text-yellow-400">
                                                {result.summary.combinedRiskScore}
                                            </p>
                                        </div>
                                        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                                            <p className="text-xs text-slate-500">Diversification</p>
                                            <p className="text-lg font-bold text-purple-400">
                                                {result.summary.diversificationScore}%
                                            </p>
                                        </div>
                                    </div>

                                    {/* Reasoning */}
                                    <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3">
                                        <p className="text-sm text-cyan-300">{result.reasoning}</p>
                                    </div>

                                    {/* Warnings */}
                                    {result.riskWarnings.length > 0 && (
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                                            <div className="flex items-center gap-2 text-orange-400 text-sm font-medium mb-2">
                                                <AlertTriangle className="h-4 w-4" />
                                                Risk Warnings
                                            </div>
                                            <ul className="space-y-1">
                                                {result.riskWarnings.map((warning, i) => (
                                                    <li key={i} className="text-sm text-orange-300">- {warning}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Allocations */}
                                    <div>
                                        <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                                            <PieChart className="h-4 w-4 text-slate-500" />
                                            Allocation
                                        </h3>
                                        <div className="space-y-2">
                                            {result.allocations.map((alloc) => (
                                                <div
                                                    key={alloc.pool.id}
                                                    onClick={() => {
                                                        onPoolClick(alloc.pool.id);
                                                        onClose();
                                                    }}
                                                    className="flex items-center gap-3 bg-slate-800/50 rounded-lg p-3 cursor-pointer hover:bg-slate-800 transition-colors"
                                                >
                                                    {/* Allocation bar */}
                                                    <div className="w-12 h-12 relative">
                                                        <svg className="w-12 h-12 -rotate-90">
                                                            <circle
                                                                cx="24"
                                                                cy="24"
                                                                r="20"
                                                                fill="none"
                                                                stroke="#334155"
                                                                strokeWidth="4"
                                                            />
                                                            <circle
                                                                cx="24"
                                                                cy="24"
                                                                r="20"
                                                                fill="none"
                                                                stroke="#22d3ee"
                                                                strokeWidth="4"
                                                                strokeDasharray={`${alloc.allocationPercent * 1.256} 125.6`}
                                                            />
                                                        </svg>
                                                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                                                            {alloc.allocationPercent}%
                                                        </span>
                                                    </div>

                                                    {/* Pool info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-white">{alloc.pool.project}</span>
                                                            <span className="text-xs text-slate-500">{alloc.pool.chain}</span>
                                                            <span className={`text-xs px-1.5 py-0.5 rounded ${RISK_COLORS[alloc.pool.riskLevel] || "bg-slate-600"} text-white`}>
                                                                {alloc.pool.riskScore}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-400 truncate">{alloc.rationale}</p>
                                                    </div>

                                                    {/* Amount */}
                                                    <div className="text-right">
                                                        <p className="font-medium text-white">{formatUsd(alloc.allocationUsd)}</p>
                                                        <p className="text-xs text-green-400 flex items-center justify-end gap-1">
                                                            <TrendingUp className="h-3 w-3" />
                                                            {formatUsd(alloc.expectedAnnualYield)}/yr
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleReset}
                                        className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
                                    >
                                        Start Over
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
