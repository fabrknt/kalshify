"use client";

import { useState, useMemo } from "react";
import {
    Hammer,
    Plus,
    Minus,
    Trash2,
    TrendingUp,
    Shield,
    AlertTriangle,
    Info,
    ChevronDown,
    RotateCcw,
} from "lucide-react";
import {
    UserStrategy,
    UserAllocation,
    BUILDER_POOLS,
    BuilderPool,
    createEmptyStrategy,
    calculateStrategyMetrics,
} from "@/lib/curate/user-strategy";
import { generateStrategyFeedback, StrategyFeedback } from "@/lib/curate/strategy-feedback";
import { StrategyFeedbackDisplay } from "./strategy-feedback";
import { StrategyComparison } from "./strategy-comparison";
import { ScenarioSimulator } from "./scenario-simulator";

const RISK_COLORS = {
    low: "text-green-400 bg-green-500/10 border-green-500/30",
    medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
    high: "text-orange-400 bg-orange-500/10 border-orange-500/30",
};

const CATEGORY_LABELS: Record<string, string> = {
    stablecoin: "Stablecoins",
    lending: "Lending",
    lp: "Liquidity Pools",
    lst: "Liquid Staking",
    vault: "Vaults",
};

interface PoolSelectorProps {
    pool: BuilderPool;
    allocation: number;
    onAllocationChange: (value: number) => void;
    onRemove: () => void;
}

function PoolSelector({ pool, allocation, onAllocationChange, onRemove }: PoolSelectorProps) {
    return (
        <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{pool.name}</span>
                    <span className="text-xs text-slate-500">{pool.protocol}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded border ${RISK_COLORS[pool.riskLevel]}`}>
                        {pool.riskLevel}
                    </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    <span className="text-green-400">{pool.apy}% APY</span>
                    <span>Risk: {pool.riskScore}</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onAllocationChange(Math.max(0, allocation - 5))}
                    className="p-1 text-slate-400 hover:text-white bg-slate-700/50 rounded"
                >
                    <Minus className="h-4 w-4" />
                </button>
                <div className="w-16 text-center">
                    <input
                        type="number"
                        value={allocation}
                        onChange={(e) => onAllocationChange(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                        className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-center text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                    <span className="text-xs text-slate-500">%</span>
                </div>
                <button
                    onClick={() => onAllocationChange(Math.min(100, allocation + 5))}
                    className="p-1 text-slate-400 hover:text-white bg-slate-700/50 rounded"
                >
                    <Plus className="h-4 w-4" />
                </button>
                <button
                    onClick={onRemove}
                    className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

interface PoolPickerProps {
    availablePools: BuilderPool[];
    onAddPool: (pool: BuilderPool) => void;
}

function PoolPicker({ availablePools, onAddPool }: PoolPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

    const categories = useMemo(() => {
        const cats = new Set(availablePools.map(p => p.category));
        return Array.from(cats);
    }, [availablePools]);

    const filteredPools = categoryFilter
        ? availablePools.filter(p => p.category === categoryFilter)
        : availablePools;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/20 transition-colors"
            >
                <Plus className="h-4 w-4" />
                Add Pool
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 max-h-96 overflow-y-auto bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50">
                    {/* Category filter */}
                    <div className="sticky top-0 bg-slate-900 p-2 border-b border-slate-700/50">
                        <div className="flex flex-wrap gap-1">
                            <button
                                onClick={() => setCategoryFilter(null)}
                                className={`px-2 py-1 text-xs rounded transition-colors ${
                                    categoryFilter === null
                                        ? "bg-cyan-500/20 text-cyan-400"
                                        : "text-slate-400 hover:text-white"
                                }`}
                            >
                                All
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setCategoryFilter(cat)}
                                    className={`px-2 py-1 text-xs rounded transition-colors ${
                                        categoryFilter === cat
                                            ? "bg-cyan-500/20 text-cyan-400"
                                            : "text-slate-400 hover:text-white"
                                    }`}
                                >
                                    {CATEGORY_LABELS[cat] || cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Pool list */}
                    <div className="p-2 space-y-1">
                        {filteredPools.map(pool => (
                            <button
                                key={pool.id}
                                onClick={() => {
                                    onAddPool(pool);
                                    setIsOpen(false);
                                }}
                                className="w-full text-left p-2 rounded hover:bg-slate-800 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-sm text-white">{pool.name}</span>
                                        <span className="text-xs text-slate-500 ml-2">{pool.protocol}</span>
                                    </div>
                                    <span className={`text-xs px-1.5 py-0.5 rounded border ${RISK_COLORS[pool.riskLevel]}`}>
                                        {pool.riskLevel}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 mt-0.5 text-xs">
                                    <span className="text-green-400">{pool.apy}% APY</span>
                                    <span className="text-slate-500">Risk: {pool.riskScore}</span>
                                </div>
                            </button>
                        ))}
                        {filteredPools.length === 0 && (
                            <p className="text-sm text-slate-500 text-center py-4">No pools available</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export function StrategyBuilder() {
    const [strategy, setStrategy] = useState<UserStrategy>(() =>
        createEmptyStrategy("moderate", 10000)
    );
    const [showComparison, setShowComparison] = useState(false);

    // Calculate what pools are already selected
    const selectedPoolIds = new Set(strategy.allocations.map(a => a.poolId));
    const availablePools = BUILDER_POOLS.filter(p => !selectedPoolIds.has(p.id));

    // Calculate metrics and feedback
    const metrics = useMemo(
        () => calculateStrategyMetrics(strategy.allocations),
        [strategy.allocations]
    );

    const feedback = useMemo(
        () => generateStrategyFeedback(strategy),
        [strategy]
    );

    const totalAllocation = strategy.allocations.reduce((sum, a) => sum + a.allocation, 0);

    // Handlers
    const handleAddPool = (pool: BuilderPool) => {
        const newAllocation: UserAllocation = {
            poolId: pool.id,
            poolName: pool.name,
            asset: pool.asset,
            allocation: 0,
            apy: pool.apy,
            riskLevel: pool.riskLevel,
            protocol: pool.protocol,
        };
        setStrategy(prev => ({
            ...prev,
            allocations: [...prev.allocations, newAllocation],
            updatedAt: new Date().toISOString(),
        }));
    };

    const handleAllocationChange = (poolId: string, value: number) => {
        setStrategy(prev => ({
            ...prev,
            allocations: prev.allocations.map(a =>
                a.poolId === poolId ? { ...a, allocation: value } : a
            ),
            updatedAt: new Date().toISOString(),
        }));
    };

    const handleRemovePool = (poolId: string) => {
        setStrategy(prev => ({
            ...prev,
            allocations: prev.allocations.filter(a => a.poolId !== poolId),
            updatedAt: new Date().toISOString(),
        }));
    };

    const handleRiskPreferenceChange = (pref: "conservative" | "moderate" | "aggressive") => {
        setStrategy(prev => ({
            ...prev,
            riskPreference: pref,
            updatedAt: new Date().toISOString(),
        }));
    };

    const handleAmountChange = (amount: number) => {
        setStrategy(prev => ({
            ...prev,
            totalAmount: amount,
            updatedAt: new Date().toISOString(),
        }));
    };

    const handleReset = () => {
        setStrategy(createEmptyStrategy(strategy.riskPreference, strategy.totalAmount));
    };

    // Calculate expected yield
    const expectedYield = (strategy.totalAmount * metrics.weightedApy) / 100;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-cyan-500/10 border border-cyan-500/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-cyan-500/20">
                        <Hammer className="h-6 w-6 text-cyan-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Strategy Builder</h2>
                        <p className="text-sm text-slate-400">Create your own allocation and get real-time feedback</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left column - Builder */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Settings row */}
                    <div className="flex flex-wrap items-center gap-4 p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                        {/* Investment amount */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-400">Investment:</span>
                            <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                <input
                                    type="number"
                                    value={strategy.totalAmount}
                                    onChange={(e) => handleAmountChange(parseInt(e.target.value) || 0)}
                                    className="w-28 bg-slate-800 border border-slate-600 rounded pl-5 pr-2 py-1.5 text-white text-sm focus:outline-none focus:border-cyan-500"
                                />
                            </div>
                        </div>

                        {/* Risk preference */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-400">Risk:</span>
                            <div className="flex gap-1 bg-slate-800 p-1 rounded-lg">
                                {(["conservative", "moderate", "aggressive"] as const).map(pref => (
                                    <button
                                        key={pref}
                                        onClick={() => handleRiskPreferenceChange(pref)}
                                        className={`px-3 py-1 text-xs rounded transition-colors capitalize ${
                                            strategy.riskPreference === pref
                                                ? "bg-slate-600 text-white"
                                                : "text-slate-400 hover:text-white"
                                        }`}
                                    >
                                        {pref}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Reset */}
                        <button
                            onClick={handleReset}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                        >
                            <RotateCcw className="h-3 w-3" />
                            Reset
                        </button>
                    </div>

                    {/* Allocation progress */}
                    <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-400">Total Allocation</span>
                            <span className={`text-lg font-bold ${
                                totalAllocation === 100
                                    ? "text-green-400"
                                    : totalAllocation > 100
                                    ? "text-red-400"
                                    : "text-yellow-400"
                            }`}>
                                {totalAllocation}%
                            </span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all ${
                                    totalAllocation === 100
                                        ? "bg-green-500"
                                        : totalAllocation > 100
                                        ? "bg-red-500"
                                        : "bg-yellow-500"
                                }`}
                                style={{ width: `${Math.min(100, totalAllocation)}%` }}
                            />
                        </div>
                        {totalAllocation !== 100 && (
                            <p className="text-xs text-slate-500 mt-1">
                                {totalAllocation < 100
                                    ? `Add ${100 - totalAllocation}% more allocation`
                                    : `Remove ${totalAllocation - 100}% allocation`}
                            </p>
                        )}
                    </div>

                    {/* Selected pools */}
                    <div className="space-y-2">
                        {strategy.allocations.length === 0 ? (
                            <div className="p-8 bg-slate-900/50 border border-slate-800 border-dashed rounded-xl text-center">
                                <p className="text-slate-500 mb-2">No pools selected</p>
                                <p className="text-xs text-slate-600">Add pools below to start building your strategy</p>
                            </div>
                        ) : (
                            strategy.allocations.map(alloc => {
                                const pool = BUILDER_POOLS.find(p => p.id === alloc.poolId);
                                if (!pool) return null;
                                return (
                                    <PoolSelector
                                        key={alloc.poolId}
                                        pool={pool}
                                        allocation={alloc.allocation}
                                        onAllocationChange={(v) => handleAllocationChange(alloc.poolId, v)}
                                        onRemove={() => handleRemovePool(alloc.poolId)}
                                    />
                                );
                            })
                        )}
                    </div>

                    {/* Add pool button */}
                    <PoolPicker availablePools={availablePools} onAddPool={handleAddPool} />
                </div>

                {/* Right column - Metrics & Feedback */}
                <div className="space-y-4">
                    {/* Quick metrics */}
                    <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl space-y-3">
                        <h3 className="text-sm font-medium text-white">Strategy Metrics</h3>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-400">Expected APY</span>
                            <span className="text-lg font-bold text-green-400">
                                {metrics.weightedApy.toFixed(1)}%
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-400">Risk Score</span>
                            <span className={`text-lg font-bold ${
                                metrics.weightedRiskScore <= 25
                                    ? "text-green-400"
                                    : metrics.weightedRiskScore <= 45
                                    ? "text-yellow-400"
                                    : "text-orange-400"
                            }`}>
                                {metrics.weightedRiskScore.toFixed(0)}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-400">Stablecoins</span>
                            <span className="text-sm text-white">{metrics.stablecoinPercent.toFixed(0)}%</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-400">Protocols</span>
                            <span className="text-sm text-white">{metrics.protocolCount}</span>
                        </div>

                        <div className="pt-3 border-t border-slate-700/50">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-400">Expected Yield</span>
                                <span className="text-lg font-bold text-green-400">
                                    ${expectedYield.toLocaleString(undefined, { maximumFractionDigits: 0 })}/yr
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Feedback */}
                    <StrategyFeedbackDisplay feedback={feedback} />

                    {/* Compare button */}
                    <button
                        onClick={() => setShowComparison(!showComparison)}
                        className="w-full px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-400 hover:bg-purple-500/20 transition-colors text-sm"
                    >
                        {showComparison ? "Hide Comparison" : "Compare to Curators"}
                    </button>

                    {/* Comparison */}
                    {showComparison && <StrategyComparison strategy={strategy} />}

                    {/* Scenario simulator */}
                    <ScenarioSimulator
                        allocations={strategy.allocations}
                        totalAmount={strategy.totalAmount}
                        title="What If Scenarios"
                    />
                </div>
            </div>
        </div>
    );
}
