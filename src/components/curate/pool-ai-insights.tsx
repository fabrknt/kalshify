"use client";

import { useState, useEffect } from "react";
import { Sparkles, RefreshCw, CheckCircle, AlertTriangle, TrendingUp, Clock } from "lucide-react";

interface PoolInsight {
    riskExplanation: string;
    opportunities: string[];
    risks: string[];
    apyStabilityAnalysis: string;
    comparison: {
        vsSimilarPools: string;
        relativePosition: "above_average" | "average" | "below_average";
    };
    verdict: string;
}

interface PoolAIInsightsProps {
    poolId: string;
}

export function PoolAIInsights({ poolId }: PoolAIInsightsProps) {
    const [insight, setInsight] = useState<PoolInsight | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cached, setCached] = useState(false);
    const [generatedAt, setGeneratedAt] = useState<string | null>(null);

    const fetchInsight = async (forceRegenerate = false) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/curate/ai/insights/${poolId}`, {
                method: forceRegenerate ? "POST" : "GET",
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to get insight");
            }

            const data = await response.json();
            setInsight(data.insight);
            setCached(data.cached);
            setGeneratedAt(data.generatedAt);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to get insight");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInsight();
    }, [poolId]);

    if (loading) {
        return (
            <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-cyan-400" />
                    <h4 className="text-sm font-semibold text-white">AI Analysis</h4>
                </div>
                <div className="flex items-center justify-center py-6">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Analyzing pool...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-cyan-400" />
                    <h4 className="text-sm font-semibold text-white">AI Analysis</h4>
                </div>
                <div className="text-sm text-red-400 bg-red-500/10 rounded p-3">
                    {error}
                    <button
                        onClick={() => fetchInsight()}
                        className="block mt-2 text-xs underline hover:no-underline"
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    if (!insight) return null;

    const positionColor = {
        above_average: "text-green-400",
        average: "text-yellow-400",
        below_average: "text-red-400",
    };

    return (
        <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-cyan-400" />
                    <h4 className="text-sm font-semibold text-white">AI Analysis</h4>
                </div>
                <div className="flex items-center gap-2">
                    {cached && generatedAt && (
                        <span className="flex items-center gap-1 text-[10px] text-slate-500">
                            <Clock className="h-3 w-3" />
                            {new Date(generatedAt).toLocaleDateString()}
                        </span>
                    )}
                    <button
                        onClick={() => fetchInsight(true)}
                        className="p-1 text-slate-500 hover:text-white transition-colors"
                        title="Regenerate"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            <div className="space-y-4 text-sm">
                {/* Verdict */}
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3">
                    <p className="text-cyan-300 font-medium">{insight.verdict}</p>
                </div>

                {/* Risk Explanation */}
                <div>
                    <h5 className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">
                        Risk Analysis
                    </h5>
                    <p className="text-slate-300">{insight.riskExplanation}</p>
                </div>

                {/* Opportunities & Risks */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h5 className="text-xs font-medium text-green-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Opportunities
                        </h5>
                        <ul className="space-y-1">
                            {insight.opportunities.map((opp, i) => (
                                <li key={i} className="text-slate-300 text-xs flex items-start gap-1.5">
                                    <span className="text-green-400 mt-0.5">+</span>
                                    {opp}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h5 className="text-xs font-medium text-orange-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Risks
                        </h5>
                        <ul className="space-y-1">
                            {insight.risks.map((risk, i) => (
                                <li key={i} className="text-slate-300 text-xs flex items-start gap-1.5">
                                    <span className="text-orange-400 mt-0.5">-</span>
                                    {risk}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* APY Stability */}
                <div>
                    <h5 className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        APY Stability
                    </h5>
                    <p className="text-slate-300">{insight.apyStabilityAnalysis}</p>
                </div>

                {/* Comparison */}
                <div className="border-t border-slate-700 pt-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">vs. Similar Pools</span>
                        <span className={`text-xs font-medium capitalize ${positionColor[insight.comparison.relativePosition]}`}>
                            {insight.comparison.relativePosition.replace("_", " ")}
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{insight.comparison.vsSimilarPools}</p>
                </div>
            </div>
        </div>
    );
}
