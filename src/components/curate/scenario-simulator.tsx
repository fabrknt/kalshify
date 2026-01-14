"use client";

import { useState, useMemo } from "react";
import { Zap, TrendingDown, TrendingUp, AlertTriangle, Shield, Clock, ChevronDown } from "lucide-react";

interface Allocation {
    asset: string;
    allocation: number;
    apy: number;
    riskLevel: "low" | "medium" | "high";
}

interface ScenarioResult {
    portfolioChange: number;
    apyChange: number;
    riskAssessment: string;
    breakdown: {
        asset: string;
        originalValue: number;
        newValue: number;
        change: number;
    }[];
}

interface Scenario {
    id: string;
    name: string;
    description: string;
    icon: "trending-down" | "trending-up" | "alert" | "clock";
    effects: {
        solChange: number;      // % change in SOL price
        ethChange: number;      // % change in ETH price
        stableChange: number;   // % change in stablecoins (usually 0)
        apyMultiplier: number;  // multiplier for APYs
        rewardsCut: number;     // % reduction in reward APYs
    };
}

const SCENARIOS: Scenario[] = [
    {
        id: "market-crash",
        name: "Market Crash (-30%)",
        description: "Crypto market drops 30%, rewards decrease",
        icon: "trending-down",
        effects: {
            solChange: -30,
            ethChange: -30,
            stableChange: 0,
            apyMultiplier: 0.7,
            rewardsCut: 50,
        },
    },
    {
        id: "mild-correction",
        name: "Mild Correction (-15%)",
        description: "Normal market pullback, APYs slightly down",
        icon: "trending-down",
        effects: {
            solChange: -15,
            ethChange: -15,
            stableChange: 0,
            apyMultiplier: 0.9,
            rewardsCut: 20,
        },
    },
    {
        id: "bull-run",
        name: "Bull Run (+50%)",
        description: "Market rallies, demand for leverage increases APYs",
        icon: "trending-up",
        effects: {
            solChange: 50,
            ethChange: 50,
            stableChange: 0,
            apyMultiplier: 1.3,
            rewardsCut: 0,
        },
    },
    {
        id: "rewards-end",
        name: "Rewards End",
        description: "Token incentive programs expire",
        icon: "clock",
        effects: {
            solChange: 0,
            ethChange: 0,
            stableChange: 0,
            apyMultiplier: 1,
            rewardsCut: 100,
        },
    },
    {
        id: "depeg-event",
        name: "Stablecoin Depeg (-5%)",
        description: "One stablecoin loses peg briefly",
        icon: "alert",
        effects: {
            solChange: -10,
            ethChange: -10,
            stableChange: -5,
            apyMultiplier: 0.8,
            rewardsCut: 30,
        },
    },
];

const ICON_MAP = {
    "trending-down": TrendingDown,
    "trending-up": TrendingUp,
    "alert": AlertTriangle,
    "clock": Clock,
};

// Determine if an asset is affected by price changes
function getAssetCategory(asset: string): "sol" | "eth" | "stable" | "other" {
    const solAssets = ["SOL", "JitoSOL", "mSOL", "JITOSOL", "SOL-USDC", "mSOL-SOL", "BONK-SOL"];
    const ethAssets = ["ETH", "WETH", "wstETH", "cbETH"];
    const stableAssets = ["USDC", "USDT", "DAI", "FRAX"];

    if (solAssets.some(s => asset.includes(s))) return "sol";
    if (ethAssets.some(e => asset.includes(e))) return "eth";
    if (stableAssets.includes(asset)) return "stable";
    return "other";
}

function simulateScenario(
    allocations: Allocation[],
    scenario: Scenario,
    totalAmount: number
): ScenarioResult {
    let totalNewValue = 0;
    let totalOriginalValue = totalAmount;
    let weightedApyChange = 0;

    const breakdown = allocations.map(alloc => {
        const originalValue = (totalAmount * alloc.allocation) / 100;
        const category = getAssetCategory(alloc.asset);

        let priceChange = 0;
        switch (category) {
            case "sol":
                priceChange = scenario.effects.solChange;
                break;
            case "eth":
                priceChange = scenario.effects.ethChange;
                break;
            case "stable":
                priceChange = scenario.effects.stableChange;
                break;
            default:
                // LP pairs: weighted average
                priceChange = (scenario.effects.solChange + scenario.effects.stableChange) / 2;
        }

        const newValue = originalValue * (1 + priceChange / 100);
        totalNewValue += newValue;

        // APY change calculation would require knowing base vs reward APY
        // For simplicity, we'll use the multiplier
        weightedApyChange += (alloc.apy * scenario.effects.apyMultiplier - alloc.apy) * (alloc.allocation / 100);

        return {
            asset: alloc.asset,
            originalValue,
            newValue,
            change: ((newValue - originalValue) / originalValue) * 100,
        };
    });

    const portfolioChange = ((totalNewValue - totalOriginalValue) / totalOriginalValue) * 100;

    // Generate risk assessment
    let riskAssessment: string;
    if (portfolioChange < -20) {
        riskAssessment = "Severe impact. This portfolio is highly exposed to this scenario.";
    } else if (portfolioChange < -10) {
        riskAssessment = "Significant impact. Consider increasing stable allocation for protection.";
    } else if (portfolioChange < -5) {
        riskAssessment = "Moderate impact. Portfolio has some protection but still exposed.";
    } else if (portfolioChange < 0) {
        riskAssessment = "Minor impact. Portfolio is relatively well-protected.";
    } else if (portfolioChange > 20) {
        riskAssessment = "Strong performance. Portfolio captures upside well.";
    } else {
        riskAssessment = "Minimal change. Portfolio is stable in this scenario.";
    }

    return {
        portfolioChange,
        apyChange: weightedApyChange,
        riskAssessment,
        breakdown,
    };
}

interface ScenarioSimulatorProps {
    allocations: Allocation[];
    totalAmount: number;
    title?: string;
}

export function ScenarioSimulator({ allocations, totalAmount, title = "Scenario Analysis" }: ScenarioSimulatorProps) {
    const [selectedScenario, setSelectedScenario] = useState<string>("market-crash");
    const [isExpanded, setIsExpanded] = useState(false);

    const scenario = SCENARIOS.find(s => s.id === selectedScenario) || SCENARIOS[0];
    const result = useMemo(
        () => simulateScenario(allocations, scenario, totalAmount),
        [allocations, scenario, totalAmount]
    );

    const Icon = ICON_MAP[scenario.icon];

    if (allocations.length === 0) {
        return (
            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl text-center">
                <p className="text-sm text-slate-500">Add allocations to see scenario analysis</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-500/20">
                        <Zap className="h-5 w-5 text-orange-400" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-sm font-medium text-white">{title}</h3>
                        <p className="text-xs text-slate-500">See how your strategy performs in different conditions</p>
                    </div>
                </div>
                <ChevronDown className={`h-5 w-5 text-slate-500 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
            </button>

            {isExpanded && (
                <div className="p-4 pt-0 space-y-4">
                    {/* Scenario selector */}
                    <div className="flex flex-wrap gap-2">
                        {SCENARIOS.map(s => {
                            const SIcon = ICON_MAP[s.icon];
                            return (
                                <button
                                    key={s.id}
                                    onClick={() => setSelectedScenario(s.id)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                                        selectedScenario === s.id
                                            ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                                            : "bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:border-slate-600"
                                    }`}
                                >
                                    <SIcon className="h-4 w-4" />
                                    {s.name}
                                </button>
                            );
                        })}
                    </div>

                    {/* Scenario description */}
                    <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                        <div className="flex items-center gap-2 mb-1">
                            <Icon className="h-4 w-4 text-orange-400" />
                            <span className="text-sm font-medium text-white">{scenario.name}</span>
                        </div>
                        <p className="text-xs text-slate-400">{scenario.description}</p>
                    </div>

                    {/* Results */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Portfolio change */}
                        <div className="p-3 bg-slate-800/30 rounded-lg">
                            <div className="text-xs text-slate-500 mb-1">Portfolio Value</div>
                            <div className={`text-xl font-bold ${
                                result.portfolioChange >= 0 ? "text-green-400" : "text-red-400"
                            }`}>
                                {result.portfolioChange >= 0 ? "+" : ""}{result.portfolioChange.toFixed(1)}%
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                                ${(totalAmount * (1 + result.portfolioChange / 100)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </div>
                        </div>

                        {/* Risk assessment */}
                        <div className="p-3 bg-slate-800/30 rounded-lg">
                            <div className="text-xs text-slate-500 mb-1">Assessment</div>
                            <div className="flex items-start gap-2">
                                <Shield className={`h-4 w-4 shrink-0 mt-0.5 ${
                                    result.portfolioChange > -5 ? "text-green-400" :
                                    result.portfolioChange > -15 ? "text-yellow-400" : "text-red-400"
                                }`} />
                                <p className="text-xs text-slate-300">{result.riskAssessment}</p>
                            </div>
                        </div>
                    </div>

                    {/* Breakdown by asset */}
                    <div>
                        <h4 className="text-xs text-slate-500 mb-2">Impact by Position</h4>
                        <div className="space-y-1">
                            {result.breakdown
                                .filter(b => b.originalValue > 0)
                                .sort((a, b) => a.change - b.change)
                                .map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between py-1.5 px-2 rounded bg-slate-800/30"
                                    >
                                        <span className="text-sm text-slate-300">{item.asset}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-slate-500">
                                                ${item.originalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </span>
                                            <span className="text-xs text-slate-500">→</span>
                                            <span className={`text-sm font-medium ${
                                                item.change >= 0 ? "text-green-400" : "text-red-400"
                                            }`}>
                                                {item.change >= 0 ? "+" : ""}{item.change.toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* Educational note */}
                    <div className="text-xs text-slate-500 text-center pt-2 border-t border-slate-800">
                        Simulations are estimates based on historical patterns. Actual results may vary.
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Simplified scenario preview for curator cards
 */
interface ScenarioPreviewProps {
    allocations: Allocation[];
}

export function ScenarioPreview({ allocations }: ScenarioPreviewProps) {
    // Quick calculation for crash scenario
    const crashScenario = SCENARIOS.find(s => s.id === "market-crash")!;
    const result = simulateScenario(allocations, crashScenario, 10000);

    return (
        <div className="flex items-center gap-2 text-xs">
            <TrendingDown className="h-3 w-3 text-slate-500" />
            <span className="text-slate-500">If market -30%:</span>
            <span className={result.portfolioChange >= -10 ? "text-green-400" : "text-orange-400"}>
                {result.portfolioChange.toFixed(1)}%
            </span>
        </div>
    );
}
