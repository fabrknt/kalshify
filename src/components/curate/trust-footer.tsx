"use client";

import { Eye, Shield, FileText } from "lucide-react";
import Link from "next/link";

const TRUST_BADGES = [
    {
        icon: Eye,
        label: "Read-Only",
        description: "No wallet permissions",
    },
    {
        icon: Shield,
        label: "Non-Custodial",
        description: "Your keys, your funds",
    },
    {
        icon: FileText,
        label: "Transparent",
        description: "Open methodology",
    },
];

export function TrustFooter() {
    return (
        <footer className="border-t border-slate-800 bg-slate-900/50 mt-auto">
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Trust badges */}
                    <div className="flex items-center gap-6">
                        {TRUST_BADGES.map((badge) => (
                            <div
                                key={badge.label}
                                className="flex items-center gap-2 text-slate-400"
                            >
                                <badge.icon className="h-4 w-4 text-green-500" />
                                <div className="hidden sm:block">
                                    <span className="text-sm text-slate-300">{badge.label}</span>
                                    <span className="text-xs text-slate-500 ml-1">· {badge.description}</span>
                                </div>
                                <span className="sm:hidden text-xs">{badge.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Link to learn more */}
                    <Link
                        href="/about#trust"
                        className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                    >
                        Learn more about our security
                    </Link>
                </div>
            </div>
        </footer>
    );
}
