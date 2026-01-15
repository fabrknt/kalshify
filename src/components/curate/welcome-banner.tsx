"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, Eye, Shield, FileText } from "lucide-react";

const STORAGE_KEY = "fabrknt-welcome-dismissed";

export function WelcomeBanner() {
    const [dismissed, setDismissed] = useState(true); // Start hidden to avoid flash
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        const wasDismissed = localStorage.getItem(STORAGE_KEY);
        setDismissed(!!wasDismissed);
        setChecked(true);
    }, []);

    const handleDismiss = () => {
        localStorage.setItem(STORAGE_KEY, "true");
        setDismissed(true);
    };

    // Don't render until we've checked localStorage
    if (!checked || dismissed) return null;

    return (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-purple-500/10 border border-purple-500/20 p-6 mb-6">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/50 pointer-events-none" />

            <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 p-1 text-slate-500 hover:text-white transition-colors"
                aria-label="Dismiss"
            >
                <X className="h-4 w-4" />
            </button>

            <div className="relative flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-white mb-1">
                        Understand why curators allocate the way they do
                    </h2>
                    <p className="text-sm text-slate-400 leading-relaxed mb-3">
                        Got your allocation from <span className="text-cyan-400">Get Started</span>? See how it compares to professional curators like Gauntlet and Steakhouse. Understand the reasoning behind each position.
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
