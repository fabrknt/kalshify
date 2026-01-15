"use client";

import { useState } from "react";
import { BookOpen, Hammer, Wrench } from "lucide-react";

type LearnSubTab = "principles" | "practice" | "compare";

interface LearnTabsProps {
    children: {
        principles: React.ReactNode;
        practice: React.ReactNode;
        compare: React.ReactNode;
    };
}

const tabs: { id: LearnSubTab; label: string; icon: React.ElementType; description: string }[] = [
    { id: "principles", label: "Principles", icon: BookOpen, description: "Core mental models" },
    { id: "practice", label: "Practice", icon: Hammer, description: "Build strategies" },
    { id: "compare", label: "Compare", icon: Wrench, description: "Analyze options" },
];

export function LearnTabs({ children }: LearnTabsProps) {
    const [activeTab, setActiveTab] = useState<LearnSubTab>("principles");

    return (
        <div className="space-y-6">
            {/* Sub-tab navigation */}
            <div className="flex gap-2 p-1 bg-slate-900/50 border border-slate-800 rounded-lg">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                                isActive
                                    ? "bg-slate-800 text-white shadow-sm"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                            }`}
                        >
                            <Icon className={`h-4 w-4 ${isActive ? "text-cyan-400" : ""}`} />
                            <span>{tab.label}</span>
                            <span className="hidden sm:inline text-xs text-slate-500">
                                {tab.description}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Tab content */}
            <div>
                {activeTab === "principles" && children.principles}
                {activeTab === "practice" && children.practice}
                {activeTab === "compare" && children.compare}
            </div>
        </div>
    );
}
