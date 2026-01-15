"use client";

import { CheckCircle, AlertCircle } from "lucide-react";

const comparisons = [
    { elsewhere: "APY percentages", here: "Whether that APY is sustainable" },
    { elsewhere: "Risk scores", here: "Why certain risks matter more" },
    { elsewhere: "Protocol lists", here: "Side-by-side strategy comparisons" },
    { elsewhere: "Raw data", here: "Explained reasoning" },
    { elsewhere: "Dashboards to browse", here: "Skills to develop" },
];

export function WhyLearnCuration() {
    return (
        <div className="space-y-6">
            {/* Problem statement */}
            <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="h-4 w-4 text-orange-400" />
                    <p className="text-xs text-slate-500 uppercase tracking-wide">The problem</p>
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">
                    Dashboards show you data. They don&apos;t teach you how to think.
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                    You can find APYs anywhere. But knowing that a pool offers 12% doesn&apos;t tell you:
                </p>
                <ul className="space-y-2 text-sm text-slate-400">
                    <li className="flex items-start gap-2">
                        <span className="text-orange-400 mt-0.5">•</span>
                        <span>Is that yield sustainable or just token emissions?</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-orange-400 mt-0.5">•</span>
                        <span>How much should you allocate to it?</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-orange-400 mt-0.5">•</span>
                        <span>What happens if the market crashes?</span>
                    </li>
                </ul>
            </div>

            {/* Comparison table */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-800">
                    <h3 className="text-sm font-semibold text-white">
                        Data platforms show numbers. FABRKNT builds judgment.
                    </h3>
                </div>
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-800/30">
                            <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">What you get elsewhere</th>
                            <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">What you get here</th>
                        </tr>
                    </thead>
                    <tbody>
                        {comparisons.map((row, idx) => (
                            <tr key={idx} className="border-t border-slate-800/50">
                                <td className="px-4 py-3 text-sm text-slate-500">{row.elsewhere}</td>
                                <td className="px-4 py-3 text-sm text-white">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
                                        {row.here}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
