"use client";

import { ZoomIn, ZoomOut, Maximize2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GraphControlsProps {
    onZoomIn: () => void;
    onZoomOut: () => void;
    onResetView: () => void;
    selectedCategory: string | null;
    selectedChain: string | null;
    onCategoryChange: (category: string | null) => void;
    onChainChange: (chain: string | null) => void;
}

const CATEGORIES = [
    { value: "defi", label: "DeFi" },
    { value: "infrastructure", label: "Infra" },
    { value: "nft", label: "NFT" },
    { value: "dao", label: "DAO" },
    { value: "gaming", label: "Gaming" },
];

const CHAINS = [
    { value: "ethereum", label: "ETH" },
    { value: "solana", label: "SOL" },
    { value: "base", label: "Base" },
    { value: "arbitrum", label: "ARB" },
    { value: "optimism", label: "OP" },
    { value: "polygon", label: "MATIC" },
];

export function GraphControls({
    onZoomIn,
    onZoomOut,
    onResetView,
    selectedCategory,
    selectedChain,
    onCategoryChange,
    onChainChange,
}: GraphControlsProps) {
    return (
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            {/* Zoom controls */}
            <div className="flex flex-col gap-1 bg-slate-900/90 backdrop-blur-sm rounded-lg border border-slate-700 p-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800"
                    onClick={onZoomIn}
                    title="Zoom in"
                >
                    <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800"
                    onClick={onZoomOut}
                    title="Zoom out"
                >
                    <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800"
                    onClick={onResetView}
                    title="Reset view"
                >
                    <Maximize2 className="h-4 w-4" />
                </Button>
            </div>

            {/* Filter controls */}
            <div className="bg-slate-900/90 backdrop-blur-sm rounded-lg border border-slate-700 p-2">
                <div className="flex items-center gap-1 mb-2 text-xs text-slate-400">
                    <Filter className="h-3 w-3" />
                    <span>Filters</span>
                </div>

                {/* Category filter */}
                <div className="mb-2">
                    <div className="text-[10px] text-slate-500 mb-1">Category</div>
                    <div className="flex flex-wrap gap-1">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.value}
                                onClick={() =>
                                    onCategoryChange(selectedCategory === cat.value ? null : cat.value)
                                }
                                className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
                                    selectedCategory === cat.value
                                        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                                        : "bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600"
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chain filter */}
                <div>
                    <div className="text-[10px] text-slate-500 mb-1">Chain</div>
                    <div className="flex flex-wrap gap-1">
                        {CHAINS.map((chain) => (
                            <button
                                key={chain.value}
                                onClick={() =>
                                    onChainChange(selectedChain === chain.value ? null : chain.value)
                                }
                                className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
                                    selectedChain === chain.value
                                        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                                        : "bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600"
                                }`}
                            >
                                {chain.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
