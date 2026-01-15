"use client";

import { useState } from "react";
import { Scale, Grid3X3, Clock, Shield, Droplet, Link2, X, Lightbulb } from "lucide-react";
import { CURATION_PRINCIPLES, CurationPrinciple } from "@/lib/curate/curation-principles";

const iconMap: Record<string, React.ElementType> = {
    scale: Scale,
    grid: Grid3X3,
    clock: Clock,
    shield: Shield,
    droplet: Droplet,
    link: Link2,
};

const colorMap: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    cyan: { bg: "bg-cyan-500/10", border: "border-cyan-500/30", text: "text-cyan-400", glow: "hover:shadow-cyan-500/20" },
    purple: { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400", glow: "hover:shadow-purple-500/20" },
    green: { bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-400", glow: "hover:shadow-green-500/20" },
    yellow: { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-400", glow: "hover:shadow-yellow-500/20" },
    blue: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400", glow: "hover:shadow-blue-500/20" },
    orange: { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400", glow: "hover:shadow-orange-500/20" },
};

export function PrinciplesStrip() {
    const [selectedPrinciple, setSelectedPrinciple] = useState<CurationPrinciple | null>(null);

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium text-white">Curation Principles</span>
                <span className="text-xs text-slate-500">— Mental models used by top curators</span>
            </div>

            {/* Principles row */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {CURATION_PRINCIPLES.map((principle) => {
                    const Icon = iconMap[principle.icon];
                    const colors = colorMap[principle.color];
                    const isSelected = selectedPrinciple?.id === principle.id;

                    return (
                        <button
                            key={principle.id}
                            onClick={() => setSelectedPrinciple(isSelected ? null : principle)}
                            className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg border transition-all hover:shadow-lg ${colors.bg} ${colors.border} ${colors.glow} ${
                                isSelected ? "ring-1 ring-white/20" : ""
                            }`}
                        >
                            <Icon className={`h-4 w-4 ${colors.text}`} />
                            <span className="text-sm text-white whitespace-nowrap">{principle.shortName}</span>
                        </button>
                    );
                })}
            </div>

            {/* Expanded detail */}
            {selectedPrinciple && (
                <div className={`relative p-4 rounded-lg border ${colorMap[selectedPrinciple.color].bg} ${colorMap[selectedPrinciple.color].border}`}>
                    <button
                        onClick={() => setSelectedPrinciple(null)}
                        className="absolute top-3 right-3 text-slate-500 hover:text-white"
                    >
                        <X className="h-4 w-4" />
                    </button>

                    <div className="flex items-start gap-3">
                        {(() => {
                            const Icon = iconMap[selectedPrinciple.icon];
                            return <Icon className={`h-5 w-5 mt-0.5 ${colorMap[selectedPrinciple.color].text}`} />;
                        })()}
                        <div className="flex-1 pr-6">
                            <h4 className="font-semibold text-white mb-1">{selectedPrinciple.name}</h4>
                            <p className="text-sm text-slate-300 mb-3">{selectedPrinciple.description}</p>
                            <div className="p-3 bg-slate-900/50 rounded-lg">
                                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Example</p>
                                <p className="text-sm text-slate-400">{selectedPrinciple.example}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
