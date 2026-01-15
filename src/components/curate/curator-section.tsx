"use client";

import { useState, useEffect } from "react";
import { Users, Loader2, AlertCircle } from "lucide-react";
import { CuratorCard } from "./curator-card";
import { CuratorStrategyPanel } from "./curator-strategy-panel";
import { CuratorProfile } from "@/lib/curate/curators";

interface AllocationReasoning {
    whyThisAsset: string;
    whyThisPercent: string;
    riskMitigation: string;
    tradeoff: string;
}

interface StrategyAllocation {
    pool: string;
    asset: string;
    allocation: number;
    apy: number;
    riskLevel: "low" | "medium" | "high";
    reasoning?: AllocationReasoning;
    principleIds?: string[];
}

interface StrategyMetrics {
    avgApy: number;
    riskScore: number;
    riskTolerance: "conservative" | "moderate" | "aggressive";
    topAssets: string[];
    allocations?: StrategyAllocation[];
}

interface CuratorSummary {
    id: string;
    name: string;
    slug: string;
    description: string;
    website: string;
    twitter?: string;
    trustScore: number;
    aum: number;
    trackRecord: string;
    platformCount: number;
    platforms: {
        protocol: string;
        chain: string;
        role: string;
    }[];
    strategyMetrics?: StrategyMetrics;
}

interface CuratorWithMetrics {
    profile: CuratorProfile;
    strategyMetrics?: StrategyMetrics;
}

export function CuratorSection() {
    const [curators, setCurators] = useState<CuratorWithMetrics[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCurator, setSelectedCurator] = useState<string | null>(null);

    useEffect(() => {
        async function fetchCurators() {
            try {
                setLoading(true);
                const response = await fetch("/api/curate/curators");
                if (!response.ok) throw new Error("Failed to fetch curators");
                const data = await response.json();

                // Transform summary data to full profile format for the card
                const curatorsWithMetrics: CuratorWithMetrics[] = data.curators.map((c: CuratorSummary) => ({
                    profile: {
                        id: c.id,
                        name: c.name,
                        slug: c.slug,
                        description: c.description,
                        website: c.website,
                        twitter: c.twitter,
                        trustScore: c.trustScore,
                        aum: c.aum,
                        trackRecord: c.trackRecord,
                        platforms: c.platforms.map((p: { protocol: string; chain: string; role: string }) => ({
                            protocol: p.protocol,
                            chain: p.chain,
                            role: p.role as "vault_curator" | "risk_curator" | "strategy_advisor",
                            description: "",
                        })),
                        highlights: [],
                    },
                    strategyMetrics: c.strategyMetrics,
                }));

                setCurators(curatorsWithMetrics);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load curators");
            } finally {
                setLoading(false);
            }
        }

        fetchCurators();
    }, []);

    if (loading) {
        return (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-center gap-2 text-slate-400">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading curator strategies...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-center gap-2 text-red-400">
                    <AlertCircle className="h-5 w-5" />
                    <span>{error}</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-purple-400" />
                        <h3 className="text-lg font-semibold text-white">Curator Strategies</h3>
                    </div>
                </div>

                {/* Curator Cards */}
                <div className="p-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {curators.map(({ profile, strategyMetrics }) => (
                            <CuratorCard
                                key={profile.id}
                                curator={profile}
                                strategyMetrics={strategyMetrics}
                                onViewStrategy={() => setSelectedCurator(profile.slug)}
                            />
                        ))}
                    </div>

                    {curators.length === 0 && (
                        <div className="text-center py-8 text-slate-400">
                            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No curator strategies available</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Strategy Panel */}
            <CuratorStrategyPanel
                curatorSlug={selectedCurator || ""}
                isOpen={!!selectedCurator}
                onClose={() => setSelectedCurator(null)}
            />
        </>
    );
}
