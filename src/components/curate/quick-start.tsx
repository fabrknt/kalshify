"use client";

import { useState } from "react";
import {
    DollarSign,
    Shield,
    Zap,
    Flame,
    ArrowRight,
    Clock,
    Eye,
    FileText,
    TrendingUp,
    Rocket,
    FlaskConical,
} from "lucide-react";

// 5-level risk tolerance system for granular allocation control
export type RiskTolerance = "preserver" | "steady" | "balanced" | "growth" | "maximizer";

// Backward compatibility mapping for existing code
export const RISK_TOLERANCE_LEGACY_MAP: Record<string, RiskTolerance> = {
    conservative: "preserver",
    moderate: "balanced",
    aggressive: "maximizer",
};

interface QuickStartProps {
    onSubmit: (amount: number, risk: RiskTolerance) => void;
    isLoading?: boolean;
}

const RISK_OPTIONS: {
    value: RiskTolerance;
    label: string;
    shortLabel: string;
    description: string;
    icon: typeof Shield;
    color: string;
    bgColor: string;
    borderColor: string;
    expectedApy: string;
    riskRange: string;
}[] = [
    {
        value: "preserver",
        label: "Preserver",
        shortLabel: "Safe",
        description: "Capital protection first",
        icon: Shield,
        color: "text-green-400",
        bgColor: "bg-green-500/10",
        borderColor: "border-green-500/30",
        expectedApy: "4-6%",
        riskRange: "Very Low",
    },
    {
        value: "steady",
        label: "Steady",
        shortLabel: "Stable",
        description: "Stable growth, minimal volatility",
        icon: Shield,
        color: "text-emerald-400",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/30",
        expectedApy: "6-8%",
        riskRange: "Low",
    },
    {
        value: "balanced",
        label: "Balanced",
        shortLabel: "Balanced",
        description: "Mix of stability and growth",
        icon: Zap,
        color: "text-yellow-400",
        bgColor: "bg-yellow-500/10",
        borderColor: "border-yellow-500/30",
        expectedApy: "8-12%",
        riskRange: "Medium",
    },
    {
        value: "growth",
        label: "Growth",
        shortLabel: "Growth",
        description: "Accepts volatility for returns",
        icon: TrendingUp,
        color: "text-orange-400",
        bgColor: "bg-orange-500/10",
        borderColor: "border-orange-500/30",
        expectedApy: "12-18%",
        riskRange: "Higher",
    },
    {
        value: "maximizer",
        label: "Maximizer",
        shortLabel: "Max",
        description: "Maximum yield, highest risk",
        icon: Rocket,
        color: "text-red-400",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/30",
        expectedApy: "18%+",
        riskRange: "High",
    },
];

// Export for use in other components
export { RISK_OPTIONS };

const AMOUNT_PRESETS = [1000, 5000, 10000, 25000, 50000, 100000];

export function QuickStart({ onSubmit, isLoading }: QuickStartProps) {
    const [amount, setAmount] = useState<string>("10000");
    const [risk, setRisk] = useState<RiskTolerance>("balanced");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = () => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount < 100) {
            setError("Please enter at least $100");
            return;
        }
        setError(null);
        onSubmit(numAmount, risk);
    };

    const selectedRiskOption = RISK_OPTIONS.find(r => r.value === risk)!;
    const selectedIndex = RISK_OPTIONS.findIndex(r => r.value === risk);

    return (
        <div className="max-w-2xl mx-auto">
            {/* Paper Trading Journey */}
            <div className="mb-8 p-6 bg-gradient-to-br from-purple-900/30 to-cyan-900/30 border border-purple-500/30 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                    <FlaskConical className="h-5 w-5 text-purple-400" />
                    <h2 className="text-lg font-semibold text-white">Recommended: Start with Paper Trading</h2>
                </div>
                <p className="text-sm text-slate-300 mb-5">
                    New to DeFi? Test strategies without risking real money. Track your paper portfolio, then invest when ready.
                </p>
                <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-slate-800/50 rounded-lg border border-purple-500/20">
                        <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Zap className="h-4 w-4 text-purple-400" />
                        </div>
                        <p className="text-sm font-medium text-white">1. Try</p>
                        <p className="text-xs text-slate-400 mt-0.5">Get allocation</p>
                    </div>
                    <div className="text-center p-3 bg-slate-800/50 rounded-lg border border-purple-500/20">
                        <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Eye className="h-4 w-4 text-purple-400" />
                        </div>
                        <p className="text-sm font-medium text-white">2. Track</p>
                        <p className="text-xs text-slate-400 mt-0.5">Watch performance</p>
                    </div>
                    <div className="text-center p-3 bg-slate-800/50 rounded-lg border border-cyan-500/20">
                        <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Rocket className="h-4 w-4 text-cyan-400" />
                        </div>
                        <p className="text-sm font-medium text-white">3. Trade</p>
                        <p className="text-xs text-slate-400 mt-0.5">Execute when ready</p>
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-sm mb-4">
                    <Clock className="h-4 w-4" />
                    Takes 30 seconds
                </div>
                <h1 className="text-3xl font-bold text-white mb-3">
                    Get Your Personalized DeFi Allocation
                </h1>
                <p className="text-slate-400">
                    Enter your amount and risk preference below
                </p>
            </div>

            {/* Form Card */}
            <div className="bg-slate-900/70 border border-slate-700 rounded-2xl p-6 space-y-6">
                {/* Amount Input */}
                <div>
                    <label className="block text-sm font-medium text-white mb-3">
                        How much do you want to invest?
                    </label>
                    <div className="relative mb-3">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="10000"
                            className="w-full pl-11 pr-4 py-4 bg-slate-800 border border-slate-600 rounded-xl text-2xl text-white focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                    </div>
                    {/* Quick presets */}
                    <div className="flex flex-wrap gap-2">
                        {AMOUNT_PRESETS.map(preset => (
                            <button
                                key={preset}
                                onClick={() => setAmount(preset.toString())}
                                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                    parseInt(amount) === preset
                                        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                                        : "bg-slate-800 text-slate-400 hover:text-white border border-transparent"
                                }`}
                            >
                                ${preset >= 1000 ? `${preset / 1000}K` : preset}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Risk Selection - 5 Level Slider */}
                <div>
                    <label className="block text-sm font-medium text-white mb-3">
                        What&apos;s your risk tolerance?
                    </label>

                    {/* Risk Level Buttons */}
                    <div className="flex gap-1 mb-4">
                        {RISK_OPTIONS.map((option, index) => {
                            const Icon = option.icon;
                            const isSelected = risk === option.value;
                            return (
                                <button
                                    key={option.value}
                                    onClick={() => setRisk(option.value)}
                                    className={`flex-1 py-3 px-2 rounded-lg border-2 transition-all ${
                                        isSelected
                                            ? `${option.bgColor} ${option.borderColor}`
                                            : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                                    }`}
                                >
                                    <div className="flex flex-col items-center">
                                        <Icon className={`h-4 w-4 mb-1 ${isSelected ? option.color : "text-slate-500"}`} />
                                        <span className={`text-xs font-medium ${isSelected ? option.color : "text-slate-400"}`}>
                                            {option.shortLabel}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Visual Risk Bar */}
                    <div className="relative mb-4">
                        <div className="flex h-2 rounded-full overflow-hidden">
                            {RISK_OPTIONS.map((option, index) => (
                                <div
                                    key={option.value}
                                    className={`flex-1 transition-opacity ${
                                        index <= selectedIndex ? "opacity-100" : "opacity-30"
                                    }`}
                                    style={{
                                        backgroundColor: index === 0 ? "#22c55e" :
                                                        index === 1 ? "#10b981" :
                                                        index === 2 ? "#eab308" :
                                                        index === 3 ? "#f97316" : "#ef4444"
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Selected Risk Details */}
                    <div className={`p-4 rounded-xl ${selectedRiskOption.bgColor} border ${selectedRiskOption.borderColor}`}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <selectedRiskOption.icon className={`h-5 w-5 ${selectedRiskOption.color}`} />
                                <span className={`font-semibold ${selectedRiskOption.color}`}>
                                    {selectedRiskOption.label}
                                </span>
                            </div>
                            <span className={`text-sm px-2 py-0.5 rounded-full ${selectedRiskOption.bgColor} ${selectedRiskOption.color}`}>
                                {selectedRiskOption.riskRange} Risk
                            </span>
                        </div>
                        <p className="text-sm text-slate-400 mb-2">
                            {selectedRiskOption.description}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Expected APY</span>
                            <span className={`font-semibold ${selectedRiskOption.color}`}>
                                ~{selectedRiskOption.expectedApy}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Error message */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">
                        {error}
                    </div>
                )}

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Analyzing pools...
                        </>
                    ) : (
                        <>
                            Show My Allocation
                            <ArrowRight className="h-5 w-5" />
                        </>
                    )}
                </button>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-6 pt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3 text-green-500" />
                        Read-only
                    </span>
                    <span className="flex items-center gap-1">
                        <Shield className="h-3 w-3 text-green-500" />
                        Non-custodial
                    </span>
                    <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3 text-green-500" />
                        Transparent
                    </span>
                </div>
            </div>

            {/* Bottom note */}
            <p className="text-center text-xs text-slate-500 mt-4">
                We never touch your funds. You execute all transactions yourself.
            </p>
        </div>
    );
}
