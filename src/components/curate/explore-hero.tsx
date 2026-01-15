"use client";

import { Eye, Shield, FileText, Search } from "lucide-react";

interface ExploreHeroProps {
    poolCount: number;
    lowRiskCount: number;
}

export function ExploreHero({ poolCount, lowRiskCount }: ExploreHeroProps) {
    return (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-purple-500/10 border border-purple-500/20 p-6 mb-6">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/50 pointer-events-none" />

            <div className="relative flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                    <Search className="h-5 w-5 text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold text-white mb-1">
                                Customize or find alternatives
                            </h2>
                            <p className="text-sm text-slate-400 leading-relaxed mb-3">
                                Want to swap a pool from your allocation? Browse {poolCount}+ pools across Solana DeFi. Compare, backtest, and find alternatives that fit your needs.
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
                    {/* Trust badges */}
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3 text-green-500" />
                            <span>Read-only</span>
                        </span>
                        <span className="flex items-center gap-1">
                            <Shield className="h-3 w-3 text-green-500" />
                            <span>Non-custodial</span>
                        </span>
                        <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3 text-green-500" />
                            <span>Transparent</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
