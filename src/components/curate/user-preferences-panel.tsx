"use client";

import { useState, useEffect } from "react";
import { X, Sliders, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UserPreferences {
    riskTolerance: "conservative" | "moderate" | "aggressive";
    preferredChains: string[];
    minApy: number;
    maxApy: number;
    stablecoinOnly: boolean;
    maxAllocationUsd: number | null;
}

interface UserPreferencesPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (preferences: UserPreferences) => void;
    initialPreferences?: UserPreferences;
}

const CHAIN_OPTIONS = [
    "Ethereum",
    "Arbitrum",
    "Base",
    "Optimism",
    "Polygon",
    "Solana",
    "Avalanche",
    "BSC",
];

const DEFAULT_PREFERENCES: UserPreferences = {
    riskTolerance: "moderate",
    preferredChains: [],
    minApy: 0,
    maxApy: 50,
    stablecoinOnly: false,
    maxAllocationUsd: null,
};

export function UserPreferencesPanel({
    isOpen,
    onClose,
    onSave,
    initialPreferences,
}: UserPreferencesPanelProps) {
    const [preferences, setPreferences] = useState<UserPreferences>(
        initialPreferences || DEFAULT_PREFERENCES
    );
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (initialPreferences) {
            setPreferences(initialPreferences);
        }
    }, [initialPreferences]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave(preferences);
            onClose();
        } finally {
            setSaving(false);
        }
    };

    const toggleChain = (chain: string) => {
        setPreferences((prev) => ({
            ...prev,
            preferredChains: prev.preferredChains.includes(chain)
                ? prev.preferredChains.filter((c) => c !== chain)
                : [...prev.preferredChains, chain],
        }));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-40"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-700 z-50 overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sliders className="h-5 w-5 text-cyan-400" />
                                <h2 className="text-lg font-semibold text-white">Your Preferences</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-4 space-y-6">
                            {/* Risk Tolerance */}
                            <div>
                                <label className="block text-sm font-medium text-white mb-3">
                                    Risk Tolerance
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(["conservative", "moderate", "aggressive"] as const).map((level) => (
                                        <button
                                            key={level}
                                            onClick={() => setPreferences((p) => ({ ...p, riskTolerance: level }))}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                                                preferences.riskTolerance === level
                                                    ? level === "conservative"
                                                        ? "bg-green-500/20 text-green-400 border border-green-500/50"
                                                        : level === "moderate"
                                                        ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/50"
                                                        : "bg-red-500/20 text-red-400 border border-red-500/50"
                                                    : "bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600"
                                            }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    {preferences.riskTolerance === "conservative"
                                        ? "Prefer low-risk pools with established protocols"
                                        : preferences.riskTolerance === "moderate"
                                        ? "Balance between risk and reward"
                                        : "Accept higher risk for potentially higher returns"}
                                </p>
                            </div>

                            {/* Preferred Chains */}
                            <div>
                                <label className="block text-sm font-medium text-white mb-3">
                                    Preferred Chains
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {CHAIN_OPTIONS.map((chain) => (
                                        <button
                                            key={chain}
                                            onClick={() => toggleChain(chain)}
                                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                                preferences.preferredChains.includes(chain)
                                                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                                                    : "bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600"
                                            }`}
                                        >
                                            {chain}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    {preferences.preferredChains.length === 0
                                        ? "All chains included"
                                        : `${preferences.preferredChains.length} chain(s) selected`}
                                </p>
                            </div>

                            {/* APY Range */}
                            <div>
                                <label className="block text-sm font-medium text-white mb-3">
                                    APY Range
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-slate-500">Min APY</label>
                                        <input
                                            type="number"
                                            min={0}
                                            max={preferences.maxApy}
                                            value={preferences.minApy}
                                            onChange={(e) =>
                                                setPreferences((p) => ({ ...p, minApy: Number(e.target.value) }))
                                            }
                                            className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500">Max APY</label>
                                        <input
                                            type="number"
                                            min={preferences.minApy}
                                            max={100}
                                            value={preferences.maxApy}
                                            onChange={(e) =>
                                                setPreferences((p) => ({ ...p, maxApy: Number(e.target.value) }))
                                            }
                                            className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Stablecoin Only */}
                            <div>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={preferences.stablecoinOnly}
                                        onChange={(e) =>
                                            setPreferences((p) => ({ ...p, stablecoinOnly: e.target.checked }))
                                        }
                                        className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500"
                                    />
                                    <span className="text-sm text-white">Stablecoins only</span>
                                </label>
                                <p className="text-xs text-slate-500 mt-1 ml-7">
                                    Only show pools with stablecoin pairs
                                </p>
                            </div>

                            {/* Max Allocation */}
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">
                                    Max Allocation (optional)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                    <input
                                        type="number"
                                        min={0}
                                        placeholder="No limit"
                                        value={preferences.maxAllocationUsd || ""}
                                        onChange={(e) =>
                                            setPreferences((p) => ({
                                                ...p,
                                                maxAllocationUsd: e.target.value ? Number(e.target.value) : null,
                                            }))
                                        }
                                        className="w-full pl-7 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    Maximum amount you plan to allocate per pool
                                </p>
                            </div>

                            {/* Save Button */}
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-900 font-medium rounded-lg transition-colors"
                            >
                                <Save className="h-4 w-4" />
                                {saving ? "Saving..." : "Save Preferences"}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
