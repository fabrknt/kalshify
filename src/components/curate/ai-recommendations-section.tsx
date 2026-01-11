"use client";

import { useState, useEffect } from "react";
import { Sparkles, RefreshCw, TrendingUp, TrendingDown, Minus, Target, AlertCircle } from "lucide-react";

interface PoolRecommendation {
    poolId: string;
    rank: number;
    matchScore: number;
    reasoning: string;
    highlights: string[];
    pool: {
        id: string;
        chain: string;
        project: string;
        symbol: string;
        tvlUsd: number;
        apy: number;
        riskScore: number;
        riskLevel: string;
        stablecoin: boolean;
        apyStability?: {
            trend: "up" | "down" | "stable";
        } | null;
    };
}

interface AIRecommendationsSectionProps {
    hasPreferences: boolean;
    onSetPreferences: () => void;
    onPoolClick: (poolId: string) => void;
}

function formatTvl(tvl: number): string {
    if (tvl >= 1_000_000_000) return `$${(tvl / 1_000_000_000).toFixed(1)}B`;
    if (tvl >= 1_000_000) return `$${(tvl / 1_000_000).toFixed(1)}M`;
    return `$${(tvl / 1_000).toFixed(0)}K`;
}

const RISK_COLORS: Record<string, string> = {
    low: "text-green-400",
    medium: "text-yellow-400",
    high: "text-orange-400",
    very_high: "text-red-400",
};

export function AIRecommendationsSection({
    hasPreferences,
    onSetPreferences,
    onPoolClick,
}: AIRecommendationsSectionProps) {
    const [recommendations, setRecommendations] = useState<PoolRecommendation[]>([]);
    const [summary, setSummary] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRecommendations = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch("/api/curate/ai/recommendations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}), // Will use saved preferences or defaults
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to get recommendations");
            }

            const data = await response.json();
            setRecommendations(data.recommendations || []);
            setSummary(data.preferenceSummary || "");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to get recommendations");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (hasPreferences) {
            fetchRecommendations();
        }
    }, [hasPreferences]);

    if (!hasPreferences) {
        return (
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-5 w-5 text-cyan-400" />
                    <h2 className="text-lg font-semibold text-white">AI Recommendations</h2>
                </div>
                <p className="text-slate-400 text-sm mb-4">
                    Set your investment preferences to get personalized yield recommendations powered by AI.
                </p>
                <button
                    onClick={onSetPreferences}
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-medium text-sm rounded-lg transition-colors"
                >
                    Set Preferences
                </button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-cyan-400" />
                    <h2 className="text-lg font-semibold text-white">AI Recommendations</h2>
                </div>
                <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-3 text-slate-400">
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        <span>Analyzing pools for you...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-cyan-400" />
                    <h2 className="text-lg font-semibold text-white">AI Recommendations</h2>
                </div>
                <div className="flex items-center gap-3 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <div>
                        <p className="text-sm">{error}</p>
                        <button
                            onClick={fetchRecommendations}
                            className="text-sm underline hover:no-underline mt-1"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-cyan-400" />
                    <h2 className="text-sm font-semibold text-white">AI Recommendations</h2>
                    {summary && <span className="text-xs text-slate-500">- {summary}</span>}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onSetPreferences}
                        className="text-xs text-slate-400 hover:text-white transition-colors"
                    >
                        Edit Preferences
                    </button>
                    <button
                        onClick={fetchRecommendations}
                        className="p-1.5 text-slate-400 hover:text-white transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {recommendations.slice(0, 5).map((rec) => (
                    <div
                        key={rec.pool.id}
                        onClick={() => onPoolClick(rec.pool.id)}
                        className="relative bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl p-4 cursor-pointer hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/10"
                    >
                        {/* Rank badge */}
                        <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-cyan-500 text-slate-900 text-xs font-bold flex items-center justify-center">
                            {rec.rank}
                        </div>

                        {/* Match score */}
                        <div className="absolute top-2 right-2 flex items-center gap-1">
                            <Target className="h-3 w-3 text-green-400" />
                            <span className="text-xs text-green-400 font-medium">{rec.matchScore}%</span>
                        </div>

                        <div className="mt-1">
                            <h4 className="text-white font-semibold text-sm">{rec.pool.project}</h4>
                            <p className="text-xs text-slate-500">{rec.pool.symbol}</p>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <p className="text-slate-500">APY</p>
                                <p className="text-green-400 font-medium flex items-center gap-1">
                                    {rec.pool.apy.toFixed(1)}%
                                    {rec.pool.apyStability?.trend && (
                                        <span className={
                                            rec.pool.apyStability.trend === "up" ? "text-green-400" :
                                            rec.pool.apyStability.trend === "down" ? "text-red-400" : "text-slate-500"
                                        }>
                                            {rec.pool.apyStability.trend === "up" && <TrendingUp className="h-3 w-3" />}
                                            {rec.pool.apyStability.trend === "down" && <TrendingDown className="h-3 w-3" />}
                                            {rec.pool.apyStability.trend === "stable" && <Minus className="h-3 w-3" />}
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div>
                                <p className="text-slate-500">Risk</p>
                                <p className={`font-medium ${RISK_COLORS[rec.pool.riskLevel] || "text-slate-400"}`}>
                                    {rec.pool.riskScore}
                                </p>
                            </div>
                        </div>

                        <p className="mt-3 text-xs text-slate-400 line-clamp-2">{rec.reasoning}</p>

                        <div className="mt-2 flex flex-wrap gap-1">
                            {rec.highlights.slice(0, 2).map((h, i) => (
                                <span key={i} className="text-[10px] px-1.5 py-0.5 bg-slate-700/50 text-slate-300 rounded">
                                    {h}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
