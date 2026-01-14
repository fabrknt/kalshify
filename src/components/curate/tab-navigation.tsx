"use client";

import { ReactNode } from "react";
import { LayoutDashboard, Compass } from "lucide-react";

export type TabId = "dashboard" | "explore";

interface Tab {
    id: TabId;
    label: string;
    icon: ReactNode;
}

const TABS: Tab[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { id: "explore", label: "Explore", icon: <Compass className="h-5 w-5" /> },
];

interface TabNavigationProps {
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
    return (
        <>
            {/* Desktop: Top tabs */}
            <div className="hidden md:flex items-center gap-2 mb-6">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            activeTab === tab.id
                                ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border border-cyan-500/30 shadow-lg shadow-cyan-500/10"
                                : "text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent"
                        }`}
                    >
                        <span className={activeTab === tab.id ? "text-cyan-400" : ""}>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Mobile: Bottom tab bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
                {/* Gradient blur background */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/98 to-slate-900/90 backdrop-blur-xl" />

                <div className="relative flex items-center justify-around px-6 py-3 pb-safe">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`flex flex-col items-center gap-1.5 px-8 py-2 rounded-xl transition-all ${
                                activeTab === tab.id
                                    ? "text-cyan-400 bg-cyan-500/10"
                                    : "text-slate-500 hover:text-slate-300"
                            }`}
                        >
                            <span className={`transition-transform ${activeTab === tab.id ? "scale-110" : ""}`}>
                                {tab.icon}
                            </span>
                            <span className="text-xs font-medium">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}

// Spacer component to add at the END of page content (prevents content from being hidden by bottom tabs)
export function MobileTabSpacer() {
    return <div className="md:hidden h-24" />;
}

interface TabContentProps {
    activeTab: TabId;
    children: Record<TabId, ReactNode>;
}

export function TabContent({ activeTab, children }: TabContentProps) {
    return (
        <div className="animate-in fade-in duration-200">
            {children[activeTab]}
        </div>
    );
}
