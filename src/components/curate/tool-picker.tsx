"use client";

import { useState } from "react";
import { ChevronLeft, Building2, Droplet, TrendingUp, Coins, Calculator } from "lucide-react";

interface Tool {
    id: string;
    name: string;
    description: string;
    icon: React.ElementType;
    color: string;
}

const tools: Tool[] = [
    {
        id: "protocol-comparison",
        name: "Protocol Comparison",
        description: "Compare TVL, yields, and risk across Solana protocols",
        icon: Building2,
        color: "purple",
    },
    {
        id: "lst-comparison",
        name: "LST Comparison",
        description: "Compare liquid staking tokens and their yields",
        icon: Droplet,
        color: "cyan",
    },
    {
        id: "yield-spreads",
        name: "Yield Spreads",
        description: "Find yield opportunities across different protocols",
        icon: TrendingUp,
        color: "green",
    },
    {
        id: "alternative-yields",
        name: "Alternative Yields",
        description: "Explore non-traditional yield sources",
        icon: Coins,
        color: "orange",
    },
    {
        id: "il-calculator",
        name: "IL Calculator",
        description: "Calculate impermanent loss for LP positions",
        icon: Calculator,
        color: "red",
    },
];

const colorClasses: Record<string, { bg: string; border: string; text: string }> = {
    purple: { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400" },
    cyan: { bg: "bg-cyan-500/10", border: "border-cyan-500/30", text: "text-cyan-400" },
    green: { bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-400" },
    orange: { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400" },
    red: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400" },
};

interface ToolPickerProps {
    children: {
        "protocol-comparison": React.ReactNode;
        "lst-comparison": React.ReactNode;
        "yield-spreads": React.ReactNode;
        "alternative-yields": React.ReactNode;
        "il-calculator": React.ReactNode;
    };
}

export function ToolPicker({ children }: ToolPickerProps) {
    const [selectedTool, setSelectedTool] = useState<string | null>(null);

    if (selectedTool) {
        const tool = tools.find(t => t.id === selectedTool);
        const colors = colorClasses[tool?.color || "purple"];

        return (
            <div className="space-y-4">
                {/* Back button */}
                <button
                    onClick={() => setSelectedTool(null)}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to tools
                </button>

                {/* Tool header */}
                {tool && (
                    <div className={`flex items-center gap-3 p-4 rounded-lg border ${colors.bg} ${colors.border}`}>
                        <tool.icon className={`h-5 w-5 ${colors.text}`} />
                        <div>
                            <h3 className="font-semibold text-white">{tool.name}</h3>
                            <p className="text-sm text-slate-400">{tool.description}</p>
                        </div>
                    </div>
                )}

                {/* Tool content */}
                {children[selectedTool as keyof typeof children]}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="text-sm text-slate-400">
                Select a tool to analyze yield opportunities
            </div>

            {/* Tool grid */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {tools.map((tool) => {
                    const Icon = tool.icon;
                    const colors = colorClasses[tool.color];

                    return (
                        <button
                            key={tool.id}
                            onClick={() => setSelectedTool(tool.id)}
                            className={`text-left p-4 rounded-lg border transition-all hover:scale-[1.02] ${colors.bg} ${colors.border} hover:border-opacity-60`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${colors.bg} ${colors.border} border`}>
                                    <Icon className={`h-5 w-5 ${colors.text}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-white text-sm">{tool.name}</h3>
                                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{tool.description}</p>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
