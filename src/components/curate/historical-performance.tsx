"use client";

import { useState } from "react";
import { History, TrendingUp, TrendingDown, Shield, Activity } from "lucide-react";
import { HistoricalPerformance } from "@/lib/curate/curator-strategies";

interface HistoricalPerformanceDisplayProps {
    performance: HistoricalPerformance[];
    curatorName: string;
}

export function HistoricalPerformanceDisplay({ performance, curatorName }: HistoricalPerformanceDisplayProps) {
    const [selectedPeriod, setSelectedPeriod] = useState<"30d" | "90d" | "180d">("90d");

    const data = performance.find(p => p.period === selectedPeriod);

    if (!data) return null;

    const isPositiveBenchmark = data.benchmarkComparison > 0;

    return (
        <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-purple-400" />
                    <h4 className="text-sm font-medium text-white">Historical Performance</h4>
                </div>
                <div className="flex gap-1 bg-slate-900/50 p-0.5 rounded">
                    {(["30d", "90d", "180d"] as const).map(period => (
                        <button
                            key={period}
                            onClick={() => setSelectedPeriod(period)}
                            className={`px-2 py-1 text-xs rounded transition-colors ${
                                selectedPeriod === period
                                    ? "bg-slate-700 text-white"
                                    : "text-slate-500 hover:text-white"
                            }`}
                        >
                            {period}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {/* Return */}
                <div className="p-2 bg-slate-900/50 rounded">
                    <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                        {data.returnPercent >= 0 ? (
                            <TrendingUp className="h-3 w-3 text-green-400" />
                        ) : (
                            <TrendingDown className="h-3 w-3 text-red-400" />
                        )}
                        Return
                    </div>
                    <div className={`text-lg font-bold ${
                        data.returnPercent >= 0 ? "text-green-400" : "text-red-400"
                    }`}>
                        {data.returnPercent >= 0 ? "+" : ""}{data.returnPercent.toFixed(2)}%
                    </div>
                </div>

                {/* Max Drawdown */}
                <div className="p-2 bg-slate-900/50 rounded">
                    <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                        <Shield className="h-3 w-3 text-orange-400" />
                        Max Drawdown
                    </div>
                    <div className={`text-lg font-bold ${
                        data.maxDrawdown > -5 ? "text-green-400" :
                        data.maxDrawdown > -15 ? "text-yellow-400" : "text-red-400"
                    }`}>
                        {data.maxDrawdown.toFixed(1)}%
                    </div>
                </div>

                {/* Volatility */}
                <div className="p-2 bg-slate-900/50 rounded">
                    <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                        <Activity className="h-3 w-3 text-cyan-400" />
                        Volatility
                    </div>
                    <div className={`text-lg font-bold ${
                        data.volatility < 10 ? "text-green-400" :
                        data.volatility < 20 ? "text-yellow-400" : "text-orange-400"
                    }`}>
                        {data.volatility.toFixed(1)}
                    </div>
                </div>

                {/* Sharpe Ratio */}
                <div className="p-2 bg-slate-900/50 rounded">
                    <div className="text-xs text-slate-500 mb-1">Sharpe Ratio</div>
                    <div className={`text-lg font-bold ${
                        data.sharpeRatio >= 2 ? "text-green-400" :
                        data.sharpeRatio >= 1 ? "text-yellow-400" : "text-orange-400"
                    }`}>
                        {data.sharpeRatio.toFixed(1)}
                    </div>
                </div>
            </div>

            {/* Benchmark comparison */}
            <div className="mt-3 pt-3 border-t border-slate-700/50">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">vs SOL Buy & Hold</span>
                    <span className={`text-sm font-medium ${
                        isPositiveBenchmark ? "text-green-400" : "text-red-400"
                    }`}>
                        {isPositiveBenchmark ? "+" : ""}{data.benchmarkComparison.toFixed(1)}%
                    </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                    {isPositiveBenchmark
                        ? `${curatorName}'s strategy outperformed holding SOL`
                        : `Holding SOL would have outperformed this strategy`
                    }
                </p>
            </div>
        </div>
    );
}

/**
 * Compact performance badge for curator cards
 */
interface PerformanceBadgeProps {
    performance: HistoricalPerformance[];
}

export function PerformanceBadge({ performance }: PerformanceBadgeProps) {
    // Use 90d data by default
    const data = performance.find(p => p.period === "90d") || performance[0];
    if (!data) return null;

    return (
        <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1">
                <History className="h-3 w-3 text-slate-500" />
                <span className="text-slate-500">90d:</span>
                <span className={data.returnPercent >= 0 ? "text-green-400" : "text-red-400"}>
                    {data.returnPercent >= 0 ? "+" : ""}{data.returnPercent.toFixed(2)}%
                </span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-1">
                <span className="text-slate-500">Sharpe:</span>
                <span className={data.sharpeRatio >= 1.5 ? "text-green-400" : "text-slate-400"}>
                    {data.sharpeRatio.toFixed(1)}
                </span>
            </div>
        </div>
    );
}
