"use client";

import { useState, useEffect } from "react";
import { Loader2, GitCompare } from "lucide-react";
import { SolanaProtocolCard } from "./solana-protocol-card";

interface ProtocolSummary {
    slug: string;
    name: string;
    category: string;
    categoryLabel: string;
    poolCount: number;
    totalTvl: number;
    avgApy: number;
    avgRiskScore: number;
    minRiskScore: number;
    maxApy: number;
    topPool: {
        id: string;
        symbol: string;
        tvl: number;
        apy: number;
    } | null;
    trustScore: number;
    trustLevel: "high" | "medium" | "low";
}

interface ProtocolComparisonData {
    protocols: ProtocolSummary[];
    comparison: {
        highestTvl: string;
        highestApy: string;
        lowestRisk: string;
        bestRiskAdjusted: string;
        mostPools: string;
    };
    metadata: {
        totalPools: number;
        totalTvl: number;
        generatedAt: string;
    };
}

function formatTvl(tvl: number): string {
    if (tvl >= 1_000_000_000) return `$${(tvl / 1_000_000_000).toFixed(2)}B`;
    if (tvl >= 1_000_000) return `$${(tvl / 1_000_000).toFixed(1)}M`;
    return `$${(tvl / 1_000).toFixed(0)}K`;
}

interface ProtocolComparisonProps {
    onProtocolClick?: (slug: string) => void;
}

export function ProtocolComparison({ onProtocolClick }: ProtocolComparisonProps) {
    const [data, setData] = useState<ProtocolComparisonData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProtocols() {
            try {
                setLoading(true);
                const response = await fetch("/api/curate/protocols");
                if (!response.ok) throw new Error("Failed to fetch protocols");
                const result = await response.json();
                setData(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setLoading(false);
            }
        }
        fetchProtocols();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-48 bg-slate-900/50 rounded-lg border border-slate-800">
                <Loader2 className="h-6 w-6 text-cyan-400 animate-spin" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex items-center justify-center h-48 bg-slate-900/50 rounded-lg border border-slate-800">
                <p className="text-red-400">{error || "Failed to load protocols"}</p>
            </div>
        );
    }

    const { protocols, comparison, metadata } = data;

    // Get highlight info for each protocol
    const getHighlight = (slug: string) => {
        if (slug === comparison.highestTvl) return { type: "tvl" as const, label: "Highest TVL" };
        if (slug === comparison.highestApy) return { type: "apy" as const, label: "Highest APY" };
        if (slug === comparison.lowestRisk) return { type: "risk" as const, label: "Lowest Risk" };
        if (slug === comparison.bestRiskAdjusted)
            return { type: "risk-adjusted" as const, label: "Best Value" };
        return undefined;
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <GitCompare className="h-5 w-5 text-purple-400" />
                    <h2 className="text-lg font-semibold text-white">Top Protocols</h2>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span>{protocols.length} protocols</span>
                    <span>{metadata.totalPools} pools</span>
                    <span>{formatTvl(metadata.totalTvl)} TVL</span>
                </div>
            </div>

            {/* Protocol Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {protocols.slice(0, 8).map((protocol) => (
                    <SolanaProtocolCard
                        key={protocol.slug}
                        slug={protocol.slug}
                        name={protocol.name}
                        category={protocol.category}
                        categoryLabel={protocol.categoryLabel}
                        poolCount={protocol.poolCount}
                        totalTvl={protocol.totalTvl}
                        avgApy={protocol.avgApy}
                        avgRiskScore={protocol.avgRiskScore}
                        maxApy={protocol.maxApy}
                        trustScore={protocol.trustScore}
                        trustLevel={protocol.trustLevel}
                        topPool={protocol.topPool}
                        isHighlighted={getHighlight(protocol.slug)}
                        onClick={() => onProtocolClick?.(protocol.slug)}
                    />
                ))}
            </div>

            {/* Show more if there are more protocols */}
            {protocols.length > 8 && (
                <div className="text-center">
                    <button className="text-sm text-slate-400 hover:text-white transition-colors">
                        Show all {protocols.length} protocols
                    </button>
                </div>
            )}
        </div>
    );
}
