"use client";

import { useState, useEffect } from "react";
import { QuickStart, RiskTolerance } from "./quick-start";
import {
    RecommendationDisplay,
    AllocationRecommendation,
} from "./recommendation-display";
import { PaperPortfolio } from "./paper-portfolio";
import { generateRecommendation } from "@/lib/curate/recommendation-engine";
import { useAllocation } from "@/contexts/allocation-context";
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle,
    Lightbulb,
    BookOpen,
    ChevronRight,
    Zap,
    Eye,
    Rocket,
} from "lucide-react";

type FlowStep = "input" | "recommendation";

interface ActionableFlowProps {
    onExplore?: () => void; // Callback to switch to explore mode
    onLearn?: () => void;   // Callback to switch to learn mode
}

export function ActionableFlow({ onExplore, onLearn }: ActionableFlowProps) {
    const { allocation: savedAllocation, riskTolerance: savedRisk, setAllocation, clearAllocation, hasAllocation, paperHistory, saveToPaperHistory, allPoolsCompleted } = useAllocation();

    // Check if current allocation is saved to paper portfolio
    const isAllocationSaved = savedAllocation && paperHistory.some(
        entry => entry.allocation.summary.totalAmount === savedAllocation.summary.totalAmount &&
            entry.allocation.summary.expectedApy === savedAllocation.summary.expectedApy
    );

    // Initialize from context if allocation exists
    const [step, setStep] = useState<FlowStep>(() => hasAllocation ? "recommendation" : "input");
    const [isLoading, setIsLoading] = useState(false);
    const [amount, setAmount] = useState<number>(() => savedAllocation?.summary.totalAmount || 0);
    const [riskTolerance, setRiskToleranceState] = useState<RiskTolerance>(() => savedRisk || "balanced");
    const [recommendation, setRecommendation] = useState<AllocationRecommendation | null>(savedAllocation);

    // Sync with context when it changes
    useEffect(() => {
        if (savedAllocation && savedRisk) {
            setRecommendation(savedAllocation);
            setAmount(savedAllocation.summary.totalAmount);
            setRiskToleranceState(savedRisk);
            if (step === "input") {
                setStep("recommendation");
            }
        }
    }, [savedAllocation, savedRisk]);

    const handleSubmit = async (inputAmount: number, risk: RiskTolerance) => {
        setIsLoading(true);
        setAmount(inputAmount);
        setRiskToleranceState(risk);

        // Simulate a brief loading state for UX
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Generate recommendation
        const rec = generateRecommendation(inputAmount, risk);
        setRecommendation(rec);

        // Save to context for other tabs
        setAllocation(rec, risk);

        // Auto-save to paper portfolio
        setTimeout(() => {
            saveToPaperHistory();
        }, 100);

        setStep("recommendation");
        setIsLoading(false);
    };

    const handleViewDetails = (_poolId: string) => {
        // Pool IDs are internal - clicking expands the reasoning panel instead
        // The toggle is handled by the AllocationReasoningPanel component
    };

    const handleReset = () => {
        setStep("input");
        setRecommendation(null);
        clearAllocation();
    };

    // Journey progress: Try (got allocation) → Track (saved to paper) → Trade (execute)
    const journeyState = {
        tryComplete: step === "recommendation",
        trackComplete: isAllocationSaved,
        tradeComplete: allPoolsCompleted,
    };

    return (
        <div className="min-h-[80vh] py-8">
            {/* Journey Progress Bar */}
            <div className="max-w-3xl mx-auto mb-8 px-4">
                <div className="bg-gradient-to-r from-purple-900/30 to-cyan-900/30 border border-purple-500/30 rounded-xl p-4">
                    <div className="flex items-center justify-center gap-3 md:gap-6">
                        {/* Try */}
                        <div className="flex items-center gap-2">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                                journeyState.tryComplete
                                    ? "bg-green-500"
                                    : step === "input"
                                    ? "bg-gradient-to-r from-purple-500 to-cyan-500 ring-2 ring-purple-400/50 ring-offset-2 ring-offset-slate-900"
                                    : "bg-slate-700"
                            }`}>
                                {journeyState.tryComplete ? (
                                    <CheckCircle className="h-5 w-5 text-white" />
                                ) : (
                                    <Zap className="h-5 w-5 text-white" />
                                )}
                            </div>
                            <span className={`text-sm font-medium ${
                                journeyState.tryComplete ? "text-green-400" : step === "input" ? "text-purple-400" : "text-slate-500"
                            }`}>Try</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-600" />
                        {/* Track */}
                        <div className={`flex items-center gap-2 ${!journeyState.tryComplete && "opacity-50"}`}>
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                                journeyState.trackComplete
                                    ? "bg-green-500"
                                    : journeyState.tryComplete
                                    ? "bg-gradient-to-r from-purple-500 to-cyan-500 ring-2 ring-purple-400/50 ring-offset-2 ring-offset-slate-900"
                                    : "bg-slate-700"
                            }`}>
                                {journeyState.trackComplete ? (
                                    <CheckCircle className="h-5 w-5 text-white" />
                                ) : (
                                    <Eye className="h-5 w-5 text-white" />
                                )}
                            </div>
                            <span className={`text-sm font-medium ${
                                journeyState.trackComplete ? "text-green-400" : journeyState.tryComplete ? "text-purple-400" : "text-slate-500"
                            }`}>Track</span>
                        </div>
                        <ArrowRight className={`h-4 w-4 text-slate-600 ${!journeyState.tryComplete && "opacity-50"}`} />
                        {/* Trade */}
                        <div className={`flex items-center gap-2 ${!journeyState.trackComplete && "opacity-50"}`}>
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                                journeyState.tradeComplete
                                    ? "bg-green-500"
                                    : journeyState.trackComplete
                                    ? "bg-gradient-to-r from-cyan-500 to-purple-500 ring-2 ring-cyan-400/50 ring-offset-2 ring-offset-slate-900"
                                    : "bg-slate-700"
                            }`}>
                                {journeyState.tradeComplete ? (
                                    <CheckCircle className="h-5 w-5 text-white" />
                                ) : (
                                    <Rocket className={`h-5 w-5 ${journeyState.trackComplete ? "text-white" : "text-slate-500"}`} />
                                )}
                            </div>
                            <span className={`text-sm font-medium ${
                                journeyState.tradeComplete ? "text-green-400" : journeyState.trackComplete ? "text-cyan-400" : "text-slate-500"
                            }`}>Trade</span>
                        </div>
                    </div>
                    <p className="text-center text-sm text-slate-400 mt-3">
                        {!journeyState.tryComplete && "Get your personalized allocation to start"}
                        {journeyState.tryComplete && !journeyState.trackComplete && "Save to Paper Portfolio to track performance"}
                        {journeyState.trackComplete && !journeyState.tradeComplete && "Track performance, then execute when ready"}
                        {journeyState.tradeComplete && "All positions executed! Track your portfolio performance."}
                    </p>
                </div>
            </div>

            {/* Back button */}
            {step !== "input" && (
                <div className="max-w-3xl mx-auto mb-4 px-4">
                    <button
                        onClick={() => setStep("input")}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </button>
                </div>
            )}

            {/* Main Content */}
            <div className="px-4">
                {step === "input" && (
                    <>
                        <QuickStart onSubmit={handleSubmit} isLoading={isLoading} />

                        {/* Alternative paths */}
                        <div className="max-w-2xl mx-auto mt-12 pt-8 border-t border-slate-800">
                            <p className="text-center text-sm text-slate-500 mb-4">
                                Want to explore on your own?
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                {onExplore && (
                                    <button
                                        onClick={onExplore}
                                        className="flex items-center gap-3 p-4 bg-slate-900/50 border border-slate-700 rounded-xl hover:border-slate-600 transition-colors text-left"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                                            <Lightbulb className="h-5 w-5 text-cyan-400" />
                                        </div>
                                        <div className="flex-1">
                                            <span className="font-medium text-white">Browse Pools</span>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Explore 200+ yield opportunities
                                            </p>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-slate-500" />
                                    </button>
                                )}
                                {onLearn && (
                                    <button
                                        onClick={onLearn}
                                        className="flex items-center gap-3 p-4 bg-slate-900/50 border border-slate-700 rounded-xl hover:border-slate-600 transition-colors text-left"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                            <BookOpen className="h-5 w-5 text-purple-400" />
                                        </div>
                                        <div className="flex-1">
                                            <span className="font-medium text-white">Learn Curation</span>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Understand how curators think
                                            </p>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-slate-500" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {step === "recommendation" && recommendation && (
                    <>
                        <RecommendationDisplay
                            recommendation={recommendation}
                            riskTolerance={riskTolerance}
                            onReset={handleReset}
                            onViewDetails={handleViewDetails}
                        />

                        {/* Paper Portfolio Section */}
                        <div className="max-w-3xl mx-auto mt-8">
                            <PaperPortfolio />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
