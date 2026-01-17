"use client";

import { useState, useEffect } from "react";
import {
    FlaskConical,
    ChevronDown,
    Trash2,
    RotateCcw,
    Save,
    Calendar,
    TrendingUp,
    TrendingDown,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    Minus,
    BarChart3,
    Shield,
    X,
} from "lucide-react";
import { useAllocation, PaperPortfolioEntry, PerformanceMetrics } from "@/contexts/allocation-context";
import { RiskTolerance } from "./quick-start";

const RISK_LABELS: Record<RiskTolerance, string> = {
    preserver: "Preserver",
    steady: "Steady",
    balanced: "Balanced",
    growth: "Growth",
    maximizer: "Maximizer",
};

const RISK_COLORS: Record<RiskTolerance, string> = {
    preserver: "text-green-400 bg-green-500/10 border-green-500/30",
    steady: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    balanced: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
    growth: "text-orange-400 bg-orange-500/10 border-orange-500/30",
    maximizer: "text-red-400 bg-red-500/10 border-red-500/30",
};

function formatCurrency(amount: number): string {
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(2)}M`;
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
    return `$${amount.toFixed(0)}`;
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
}

function TrendIndicator({ trend, change }: { trend: "up" | "down" | "stable"; change: number }) {
    if (trend === "up") {
        return (
            <span className="flex items-center gap-0.5 text-green-400">
                <ArrowUpRight className="h-3 w-3" />
                <span className="text-xs">+{change.toFixed(1)}%</span>
            </span>
        );
    }
    if (trend === "down") {
        return (
            <span className="flex items-center gap-0.5 text-red-400">
                <ArrowDownRight className="h-3 w-3" />
                <span className="text-xs">{change.toFixed(1)}%</span>
            </span>
        );
    }
    return (
        <span className="flex items-center gap-0.5 text-slate-400">
            <Minus className="h-3 w-3" />
            <span className="text-xs">Stable</span>
        </span>
    );
}

function PaperPortfolioItem({
    entry,
    metrics,
    onRestore,
    onDelete,
}: {
    entry: PaperPortfolioEntry;
    metrics: PerformanceMetrics | null;
    onRestore: () => void;
    onDelete: () => void;
}) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-slate-800/50 rounded-lg border border-slate-700/50">
            <div
                className="p-3 cursor-pointer hover:bg-slate-800/70 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FlaskConical className="h-4 w-4 text-purple-400" />
                        <div>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-0.5 rounded border ${RISK_COLORS[entry.riskTolerance]}`}>
                                    {RISK_LABELS[entry.riskTolerance]}
                                </span>
                                <span className="text-sm text-white">
                                    {formatCurrency(entry.allocation.summary.totalAmount)}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                                <span className="flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" />
                                    {metrics?.currentApy.toFixed(1) ?? entry.allocation.summary.expectedApy.toFixed(1)}% APY
                                </span>
                                {metrics && (
                                    <TrendIndicator trend={metrics.apyTrend} change={metrics.apyChange} />
                                )}
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {metrics ? `${metrics.daysSinceCreated}d` : formatDate(entry.createdAt)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </div>
            </div>

            {isExpanded && (
                <div className="px-3 pb-3 border-t border-slate-700/50">
                    {/* Performance Summary */}
                    {metrics && metrics.daysSinceCreated > 0 && (
                        <div className="pt-3 pb-2 mb-2 border-b border-slate-700/30">
                            <div className="flex items-center gap-2 mb-2">
                                <BarChart3 className="h-3 w-3 text-purple-400" />
                                <span className="text-xs font-medium text-purple-400">Performance</span>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <p className="text-xs text-slate-500">Tracking</p>
                                    <p className="text-sm text-white">{metrics.daysSinceCreated} days</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Est. Yield</p>
                                    <p className="text-sm text-green-400">
                                        +{formatCurrency(metrics.expectedYieldToDate)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">APY Trend</p>
                                    <div className="flex items-center gap-1">
                                        {metrics.apyTrend === "up" && <TrendingUp className="h-3 w-3 text-green-400" />}
                                        {metrics.apyTrend === "down" && <TrendingDown className="h-3 w-3 text-red-400" />}
                                        {metrics.apyTrend === "stable" && <Minus className="h-3 w-3 text-slate-400" />}
                                        <span className={`text-sm ${
                                            metrics.apyTrend === "up" ? "text-green-400" :
                                            metrics.apyTrend === "down" ? "text-red-400" : "text-slate-400"
                                        }`}>
                                            {metrics.apyTrend === "up" ? "Rising" :
                                             metrics.apyTrend === "down" ? "Falling" : "Stable"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {metrics.snapshots.length > 1 && (
                                <p className="text-xs text-slate-500 mt-2">
                                    {metrics.snapshots.length} data points collected
                                </p>
                            )}
                        </div>
                    )}

                    {/* Pool breakdown */}
                    <div className="pt-2 space-y-1.5">
                        {entry.allocation.allocations.map((alloc, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-300">{alloc.poolName}</span>
                                    <span className="text-xs text-slate-500">{alloc.protocol}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-slate-400">{alloc.apy.toFixed(1)}%</span>
                                    <span className="text-white font-medium">{alloc.allocation}%</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {entry.notes && (
                        <p className="mt-2 text-xs text-slate-400 italic">{entry.notes}</p>
                    )}

                    <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/30">
                        <button
                            onClick={(e) => { e.stopPropagation(); onRestore(); }}
                            className="flex items-center gap-1 px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs hover:bg-cyan-500/30 transition-colors"
                        >
                            <RotateCcw className="h-3 w-3" />
                            Load
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            className="flex items-center gap-1 px-2 py-1 text-slate-400 hover:text-red-400 rounded text-xs transition-colors"
                        >
                            <Trash2 className="h-3 w-3" />
                            Delete
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// Prompt to sign in after tracking for a while
function SignInPrompt({ trackingDays, onDismiss }: { trackingDays: number; onDismiss: () => void }) {
    return (
        <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-lg relative">
            <button
                onClick={onDismiss}
                className="absolute top-2 right-2 p-1 text-slate-500 hover:text-white transition-colors"
            >
                <X className="h-4 w-4" />
            </button>
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center shrink-0">
                    <Shield className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                    <h4 className="text-sm font-medium text-white mb-1">
                        Protect your {trackingDays}-day track record
                    </h4>
                    <p className="text-xs text-slate-400 mb-3">
                        Sign in to preserve your portfolio history and access it from any device.
                        Your data stays safe even if you clear your browser.
                    </p>
                    <a
                        href="/auth/signin"
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-500 text-white rounded-lg text-sm font-medium hover:bg-cyan-400 transition-colors"
                    >
                        Sign in to save
                    </a>
                </div>
            </div>
        </div>
    );
}

export function PaperPortfolio() {
    const {
        allocation,
        paperHistory,
        saveToPaperHistory,
        deleteFromPaperHistory,
        restoreFromPaperHistory,
        captureSnapshot,
        getPerformanceMetrics,
        trackingDays,
    } = useAllocation();

    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [notes, setNotes] = useState("");
    const [dismissedSignInPrompt, setDismissedSignInPrompt] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("fabrknt_signin_prompt_dismissed") === "true";
        }
        return false;
    });

    const handleDismissSignInPrompt = () => {
        setDismissedSignInPrompt(true);
        if (typeof window !== "undefined") {
            localStorage.setItem("fabrknt_signin_prompt_dismissed", "true");
        }
    };

    // Show sign-in prompt after 7+ days of tracking
    const shouldShowSignInPrompt = trackingDays >= 7 && !dismissedSignInPrompt && paperHistory.length > 0;

    // Capture snapshots for all portfolios on mount
    useEffect(() => {
        paperHistory.forEach(entry => {
            captureSnapshot(entry.id);
        });
    }, [paperHistory, captureSnapshot]);

    const handleSave = () => {
        saveToPaperHistory(notes || undefined);
        setNotes("");
        setShowSaveDialog(false);
    };

    // Check if current allocation is already saved
    const isCurrentSaved = allocation && paperHistory.some(
        entry => entry.allocation.summary.totalAmount === allocation.summary.totalAmount &&
            entry.allocation.summary.expectedApy === allocation.summary.expectedApy
    );

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FlaskConical className="h-5 w-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">Paper Portfolio</h3>
                    <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded border border-purple-500/30">
                        No sign-in required
                    </span>
                </div>
            </div>

            <p className="text-sm text-slate-400">
                Track allocations over time without real money. See how recommendations perform before investing.
            </p>

            {/* Sign-in prompt after tracking for a while */}
            {shouldShowSignInPrompt && (
                <SignInPrompt
                    trackingDays={trackingDays}
                    onDismiss={handleDismissSignInPrompt}
                />
            )}

            {/* Tracking summary */}
            {trackingDays > 0 && paperHistory.length > 0 && !shouldShowSignInPrompt && (
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-purple-400" />
                            <span className="text-sm text-purple-300">
                                Tracking for {trackingDays} day{trackingDays !== 1 ? "s" : ""}
                            </span>
                        </div>
                        <span className="text-xs text-slate-400">
                            {paperHistory.length} allocation{paperHistory.length !== 1 ? "s" : ""}
                        </span>
                    </div>
                </div>
            )}

            {/* Save current allocation */}
            {allocation && !isCurrentSaved && (
                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    {showSaveDialog ? (
                        <div className="space-y-3">
                            <input
                                type="text"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add a note (optional)..."
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-400 transition-colors"
                                >
                                    <Save className="h-4 w-4" />
                                    Save to History
                                </button>
                                <button
                                    onClick={() => setShowSaveDialog(false)}
                                    className="px-3 py-1.5 text-slate-400 text-sm hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-300">Current allocation not saved</p>
                                <p className="text-xs text-slate-400">Save it to track performance over time</p>
                            </div>
                            <button
                                onClick={() => setShowSaveDialog(true)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg text-sm hover:bg-purple-500/30 transition-colors"
                            >
                                <Save className="h-4 w-4" />
                                Save
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* History list */}
            {paperHistory.length > 0 ? (
                <div className="space-y-2">
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Saved Allocations</p>
                    {paperHistory.map((entry) => (
                        <PaperPortfolioItem
                            key={entry.id}
                            entry={entry}
                            metrics={getPerformanceMetrics(entry.id)}
                            onRestore={() => restoreFromPaperHistory(entry.id)}
                            onDelete={() => deleteFromPaperHistory(entry.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="p-6 bg-slate-800/30 border border-slate-700/50 rounded-lg text-center">
                    <Clock className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">No saved allocations yet</p>
                    <p className="text-xs text-slate-500 mt-1">
                        Get an allocation and save it to start tracking
                    </p>
                </div>
            )}

            {/* Info */}
            <p className="text-xs text-slate-500">
                Stored in your browser. Sign in to sync across devices.
            </p>
        </div>
    );
}
