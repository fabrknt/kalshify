"use client";

import { useState, useEffect } from "react";
import {
    Newspaper,
    TrendingUp,
    TrendingDown,
    Minus,
    ChevronDown,
    ChevronRight,
    AlertTriangle,
    CheckCircle,
    Info,
    Lightbulb,
    Shield,
    BookOpen,
    RefreshCw,
    Calendar,
} from "lucide-react";
import {
    WeeklyMarketContext,
    MarketTrend,
    ProtocolUpdate,
    MarketHighlight,
    formatTrendValue,
    getRelativeTime,
} from "@/lib/curate/market-context";

const SENTIMENT_STYLES = {
    bullish: {
        bg: "bg-green-500/10",
        border: "border-green-500/30",
        text: "text-green-400",
        label: "Bullish",
    },
    neutral: {
        bg: "bg-slate-500/10",
        border: "border-slate-500/30",
        text: "text-slate-400",
        label: "Neutral",
    },
    bearish: {
        bg: "bg-red-500/10",
        border: "border-red-500/30",
        text: "text-red-400",
        label: "Bearish",
    },
    cautious: {
        bg: "bg-orange-500/10",
        border: "border-orange-500/30",
        text: "text-orange-400",
        label: "Cautious",
    },
};

const HIGHLIGHT_ICONS = {
    opportunity: Lightbulb,
    risk: AlertTriangle,
    trend: TrendingUp,
    education: BookOpen,
};

const HIGHLIGHT_STYLES = {
    opportunity: "bg-green-500/10 border-green-500/20 text-green-400",
    risk: "bg-orange-500/10 border-orange-500/20 text-orange-400",
    trend: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
    education: "bg-purple-500/10 border-purple-500/20 text-purple-400",
};

function TrendCard({ trend }: { trend: MarketTrend }) {
    const TrendIcon = trend.trend === "up" ? TrendingUp : trend.trend === "down" ? TrendingDown : Minus;
    const trendColor = trend.trend === "up" ? "text-green-400" : trend.trend === "down" ? "text-red-400" : "text-slate-400";

    return (
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
            <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400">{trend.metric}</span>
                <TrendIcon className={`h-3 w-3 ${trendColor}`} />
            </div>
            <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-white">
                    {formatTrendValue(trend.metric, trend.current)}
                </span>
                <span className={`text-xs ${trendColor}`}>
                    {trend.changePercent > 0 ? "+" : ""}{trend.changePercent.toFixed(1)}%
                </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{trend.context}</p>
        </div>
    );
}

function ProtocolUpdateItem({ update }: { update: ProtocolUpdate }) {
    const severityStyles = {
        positive: "bg-green-500/10 text-green-400 border-green-500/20",
        warning: "bg-orange-500/10 text-orange-400 border-orange-500/20",
        info: "bg-slate-700/50 text-slate-400 border-slate-600/50",
    };

    const SeverityIcon = update.severity === "positive" ? CheckCircle :
        update.severity === "warning" ? AlertTriangle : Info;

    return (
        <div className={`p-3 rounded-lg border ${severityStyles[update.severity]}`}>
            <div className="flex items-start gap-2">
                <SeverityIcon className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium px-1.5 py-0.5 bg-slate-700/50 rounded text-slate-300">
                            {update.protocol}
                        </span>
                        <span className="text-xs text-slate-500">{getRelativeTime(new Date(update.date))}</span>
                    </div>
                    <h4 className="font-medium text-white text-sm mt-1">{update.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{update.description}</p>
                    {update.impact && (
                        <p className="text-xs text-slate-500 mt-1 italic">Impact: {update.impact}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

function HighlightCard({ highlight }: { highlight: MarketHighlight }) {
    const Icon = HIGHLIGHT_ICONS[highlight.type];

    return (
        <div className={`p-3 rounded-lg border ${HIGHLIGHT_STYLES[highlight.type]}`}>
            <div className="flex items-start gap-2">
                <Icon className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-medium text-white text-sm">{highlight.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">{highlight.description}</p>
                    {highlight.actionable && (
                        <div className="flex items-center gap-1 mt-2 text-xs">
                            <ChevronRight className="h-3 w-3" />
                            <span className="font-medium">{highlight.actionable}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

interface MarketContextCardProps {
    compact?: boolean;
}

export function MarketContextCard({ compact = false }: MarketContextCardProps) {
    const [context, setContext] = useState<WeeklyMarketContext | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(!compact);
    const [activeSection, setActiveSection] = useState<"trends" | "updates" | "highlights">("highlights");

    const fetchContext = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/curate/market");
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setContext(data.data);
                }
            }
        } catch (error) {
            console.error("Failed to fetch market context:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchContext();
    }, []);

    if (isLoading) {
        return (
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                    <RefreshCw className="h-5 w-5 text-slate-500 animate-spin" />
                    <span className="text-slate-400">Loading market context...</span>
                </div>
            </div>
        );
    }

    if (!context) {
        return null;
    }

    const sentimentStyle = SENTIMENT_STYLES[context.sentiment];
    const weekStart = new Date(context.weekOf).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const weekEnd = new Date(context.weekEnd).toLocaleDateString("en-US", { month: "short", day: "numeric" });

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl overflow-hidden">
            {/* Header */}
            <div
                className="p-4 cursor-pointer hover:bg-slate-800/30 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                            <Newspaper className="h-5 w-5 text-cyan-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-semibold">Weekly Market Context</h3>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <Calendar className="h-3 w-3" />
                                <span>{weekStart} - {weekEnd}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Sentiment badge */}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${sentimentStyle.bg} ${sentimentStyle.text} border ${sentimentStyle.border}`}>
                            {sentimentStyle.label}
                        </span>
                        <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                </div>

                {/* Summary - always visible */}
                <p className="text-sm text-slate-400 mt-3">{context.summary}</p>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="px-4 pb-4 border-t border-slate-700/50">
                    {/* Yield Environment Quick Stats */}
                    <div className="grid grid-cols-3 gap-3 py-4 border-b border-slate-700/30">
                        <div className="text-center">
                            <p className="text-xs text-slate-500 mb-1">Stablecoin Avg</p>
                            <p className="text-lg font-bold text-green-400">{context.yieldEnvironment.stablecoinAvgApy}%</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-slate-500 mb-1">LST Avg</p>
                            <p className="text-lg font-bold text-cyan-400">{context.yieldEnvironment.lstAvgApy}%</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-slate-500 mb-1">LP Avg</p>
                            <p className="text-lg font-bold text-purple-400">{context.yieldEnvironment.lpAvgApy}%</p>
                        </div>
                    </div>

                    {/* Risk Snapshot */}
                    <div className="py-3 border-b border-slate-700/30">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="h-4 w-4 text-slate-400" />
                            <span className="text-sm font-medium text-white">Risk Snapshot</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                                <span className="text-slate-500">Volatility:</span>
                                <span className={`font-medium ${
                                    context.riskSnapshot.marketVolatility === "low" ? "text-green-400" :
                                    context.riskSnapshot.marketVolatility === "medium" ? "text-yellow-400" : "text-orange-400"
                                }`}>
                                    {context.riskSnapshot.marketVolatility}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-slate-500">DeFi Risk:</span>
                                <span className={`font-medium ${
                                    context.riskSnapshot.defiRiskLevel === "normal" ? "text-green-400" :
                                    context.riskSnapshot.defiRiskLevel === "elevated" ? "text-yellow-400" : "text-orange-400"
                                }`}>
                                    {context.riskSnapshot.defiRiskLevel}
                                </span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">{context.riskSnapshot.recommendedAction}</p>
                    </div>

                    {/* Section Tabs */}
                    <div className="flex gap-1 py-3 border-b border-slate-700/30">
                        {(["highlights", "trends", "updates"] as const).map(section => (
                            <button
                                key={section}
                                onClick={() => setActiveSection(section)}
                                className={`px-3 py-1.5 rounded-lg text-sm transition-colors capitalize ${
                                    activeSection === section
                                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                                        : "text-slate-400 hover:text-white"
                                }`}
                            >
                                {section === "updates" ? "Protocol Updates" : section}
                            </button>
                        ))}
                    </div>

                    {/* Section Content */}
                    <div className="pt-4 space-y-3">
                        {activeSection === "highlights" && (
                            <>
                                {context.highlights.map((highlight, idx) => (
                                    <HighlightCard key={idx} highlight={highlight} />
                                ))}
                            </>
                        )}

                        {activeSection === "trends" && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {context.trends.map((trend, idx) => (
                                    <TrendCard key={idx} trend={trend} />
                                ))}
                            </div>
                        )}

                        {activeSection === "updates" && (
                            <>
                                {context.protocolUpdates.map((update, idx) => (
                                    <ProtocolUpdateItem key={idx} update={update} />
                                ))}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
