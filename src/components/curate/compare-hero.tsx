"use client";

import { Eye, Shield, FileText, Wrench } from "lucide-react";

export function CompareHero() {
    return (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-cyan-500/10 border border-cyan-500/20 p-6 mb-6">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/50 pointer-events-none" />

            <div className="relative flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                    <Wrench className="h-5 w-5 text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-white mb-1">
                        Compare protocols and analyze options
                    </h2>
                    <p className="text-sm text-slate-400 leading-relaxed mb-3">
                        Dive deep into protocol comparisons, LST options, yield spreads, and IL calculations. Use these tools to inform your allocation decisions.
                    </p>
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
