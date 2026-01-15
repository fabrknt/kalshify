"use client";

import { Search, Filter } from "lucide-react";

interface ExploreHeroProps {
    poolCount: number;
    lowRiskCount: number;
}

export function ExploreHero({ poolCount, lowRiskCount }: ExploreHeroProps) {
    return (
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900 border border-slate-800 rounded-xl">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-white mb-1">
                        Explore Solana Yield Pools
                    </h2>
                    <p className="text-sm text-slate-400">
                        Browse {poolCount}+ pools across Solana DeFi. Filter by risk, TVL, and yield type to find opportunities that match your criteria.
                    </p>
                </div>
                <div className="hidden sm:flex items-center gap-3 shrink-0">
                    <div className="text-center px-3 py-2 bg-slate-800/50 rounded-lg">
                        <div className="text-xl font-bold text-white">{poolCount}+</div>
                        <div className="text-xs text-slate-500">pools</div>
                    </div>
                    <div className="text-center px-3 py-2 bg-slate-800/50 rounded-lg">
                        <div className="text-xl font-bold text-green-400">{lowRiskCount}</div>
                        <div className="text-xs text-slate-500">low risk</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
