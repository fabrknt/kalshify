"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DependencyGraph, GraphNode, GraphLink } from "@/components/curate/dependency-graph";
import { Globe, ArrowLeft, Network, Link2, Loader2 } from "lucide-react";

interface EcosystemData {
    ecosystem: string;
    nodes: GraphNode[];
    links: GraphLink[];
    metadata: {
        totalProjects: number;
        totalEdges: number;
        mostConnected: string[];
        topSharedDeps: string[];
    };
}

const ECOSYSTEMS = [
    { id: "solana", name: "Solana", color: "bg-purple-500", description: "Native Solana projects" },
    { id: "ethereum", name: "Ethereum", color: "bg-blue-500", description: "Ethereum mainnet projects" },
    { id: "base", name: "Base", color: "bg-sky-500", description: "Coinbase L2 ecosystem" },
    { id: "arbitrum", name: "Arbitrum", color: "bg-cyan-500", description: "Arbitrum L2 projects" },
    { id: "optimism", name: "Optimism", color: "bg-red-500", description: "Optimism L2 ecosystem" },
    { id: "polygon", name: "Polygon", color: "bg-violet-500", description: "Polygon PoS & zkEVM" },
    { id: "infrastructure", name: "Infrastructure", color: "bg-slate-500", description: "Cross-chain infrastructure" },
];

export default function EcosystemPage() {
    const params = useParams();
    const router = useRouter();
    const cluster = params.cluster as string;

    const [data, setData] = useState<EcosystemData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const currentEcosystem = ECOSYSTEMS.find((e) => e.id === cluster);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/curate/ecosystem/${cluster}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Failed to fetch");
                }
                const result = await response.json();
                setData(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setLoading(false);
            }
        }

        if (cluster) {
            fetchData();
        }
    }, [cluster]);

    const handleNodeClick = (node: GraphNode) => {
        router.push(`/curate/project/${node.id}`);
    };

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Ecosystem selector */}
            <div className="mb-6 flex flex-wrap gap-2">
                {ECOSYSTEMS.map((eco) => (
                    <Link
                        key={eco.id}
                        href={`/curate/ecosystem/${eco.id}`}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                            cluster === eco.id
                                ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-400"
                                : "bg-card border-border text-slate-400 hover:text-white hover:border-slate-600"
                        }`}
                    >
                        <div className={`w-2 h-2 rounded-full ${eco.color}`} />
                        <span className="text-sm font-medium">{eco.name}</span>
                    </Link>
                ))}
            </div>

            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <Globe className="h-6 w-6 text-cyan-400" />
                    <h1 className="text-2xl font-bold text-white">
                        {currentEcosystem?.name || cluster} Ecosystem
                    </h1>
                </div>
                <p className="text-slate-400">
                    {currentEcosystem?.description || `Projects in the ${cluster} ecosystem`}
                </p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-[600px] bg-card border border-border rounded-lg">
                    <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center h-[400px] bg-card border border-border rounded-lg">
                    <p className="text-red-400 mb-2">{error}</p>
                    <Link
                        href="/curate"
                        className="text-cyan-400 hover:underline text-sm"
                    >
                        Back to main graph
                    </Link>
                </div>
            ) : data && data.nodes.length > 0 ? (
                <>
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-card border border-border rounded-lg p-4">
                            <div className="flex items-center gap-2 text-slate-400 mb-1">
                                <Network className="h-4 w-4" />
                                <span className="text-xs">Projects</span>
                            </div>
                            <div className="text-2xl font-bold text-white">
                                {data.metadata.totalProjects}
                            </div>
                        </div>
                        <div className="bg-card border border-border rounded-lg p-4">
                            <div className="flex items-center gap-2 text-slate-400 mb-1">
                                <Link2 className="h-4 w-4" />
                                <span className="text-xs">Connections</span>
                            </div>
                            <div className="text-2xl font-bold text-cyan-400">
                                {data.metadata.totalEdges}
                            </div>
                        </div>
                        <div className="bg-card border border-border rounded-lg p-4 col-span-2">
                            <div className="text-xs text-slate-400 mb-2">Most Connected</div>
                            <div className="flex flex-wrap gap-2">
                                {data.metadata.mostConnected.slice(0, 5).map((slug) => (
                                    <span
                                        key={slug}
                                        onClick={() => router.push(`/curate/project/${slug}`)}
                                        className="text-sm bg-slate-800 text-white px-2 py-1 rounded cursor-pointer hover:bg-slate-700 transition-colors"
                                    >
                                        {slug}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Graph */}
                    <DependencyGraph
                        data={data}
                        onNodeClick={handleNodeClick}
                        height={500}
                    />

                    {/* Project list */}
                    <div className="mt-6 bg-card border border-border rounded-lg p-4">
                        <h2 className="text-lg font-semibold text-white mb-4">
                            All Projects ({data.nodes.length})
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                            {data.nodes.map((node) => (
                                <button
                                    key={node.id}
                                    onClick={() => router.push(`/curate/project/${node.id}`)}
                                    className="flex items-center gap-2 p-2 bg-slate-800/50 rounded hover:bg-slate-800 transition-colors text-left"
                                >
                                    {node.logo && <span>{node.logo}</span>}
                                    <span className="text-sm text-white truncate">{node.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-[400px] bg-card border border-border rounded-lg">
                    <Globe className="h-12 w-12 text-slate-600 mb-4" />
                    <p className="text-slate-400 mb-2">No projects found in this ecosystem</p>
                    <p className="text-slate-600 text-sm">
                        Try selecting a different ecosystem
                    </p>
                </div>
            )}
        </div>
    );
}
