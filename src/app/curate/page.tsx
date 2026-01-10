"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DependencyGraph, GraphNode, GraphLink } from "@/components/curate/dependency-graph";
import { Network, TrendingUp, Link2, Loader2 } from "lucide-react";

interface GraphData {
    nodes: GraphNode[];
    links: GraphLink[];
    metadata: {
        totalProjects: number;
        totalEdges: number;
        mostConnected: string[];
        topSharedDeps: string[];
    };
}

export default function CuratePage() {
    const router = useRouter();
    const [graphData, setGraphData] = useState<GraphData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchGraphData() {
            try {
                const response = await fetch("/api/curate/graph");
                if (!response.ok) {
                    throw new Error("Failed to fetch graph data");
                }
                const data = await response.json();
                setGraphData(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setLoading(false);
            }
        }

        fetchGraphData();
    }, []);

    const handleNodeClick = (node: GraphNode) => {
        router.push(`/curate/project/${node.id}`);
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col items-center justify-center h-[600px] bg-slate-900 rounded-lg border border-border">
                    <Loader2 className="h-8 w-8 text-cyan-400 animate-spin mb-4" />
                    <p className="text-slate-400">Loading dependency graph...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col items-center justify-center h-[600px] bg-slate-900 rounded-lg border border-border">
                    <p className="text-red-400 mb-2">Error loading graph</p>
                    <p className="text-slate-500 text-sm">{error}</p>
                    <p className="text-slate-600 text-xs mt-4">
                        Run <code className="bg-slate-800 px-2 py-1 rounded">npm run seed:dependencies --fetch</code> to populate data
                    </p>
                </div>
            </div>
        );
    }

    if (!graphData || graphData.nodes.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col items-center justify-center h-[600px] bg-slate-900 rounded-lg border border-border">
                    <Network className="h-12 w-12 text-slate-600 mb-4" />
                    <p className="text-slate-400 mb-2">No dependency data available</p>
                    <p className="text-slate-600 text-sm">
                        Run the seed script to populate the dependency graph:
                    </p>
                    <code className="bg-slate-800 px-3 py-2 rounded mt-2 text-cyan-400 text-sm">
                        npm run seed:dependencies -- --fetch
                    </code>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white mb-2">
                    Dependency Graph
                </h1>
                <p className="text-slate-400">
                    Explore how Web3 projects are connected through shared dependencies and SDK usage
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <Network className="h-4 w-4" />
                        <span className="text-xs">Projects</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {graphData.metadata.totalProjects}
                    </div>
                </div>
                <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <Link2 className="h-4 w-4" />
                        <span className="text-xs">Connections</span>
                    </div>
                    <div className="text-2xl font-bold text-cyan-400">
                        {graphData.metadata.totalEdges}
                    </div>
                </div>
                <div className="bg-card border border-border rounded-lg p-4 col-span-2">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-xs">Most Connected</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {graphData.metadata.mostConnected.slice(0, 5).map((slug) => (
                            <span
                                key={slug}
                                className="text-sm bg-slate-800 text-white px-2 py-1 rounded cursor-pointer hover:bg-slate-700 transition-colors"
                                onClick={() => router.push(`/curate/project/${slug}`)}
                            >
                                {slug}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Graph */}
            <DependencyGraph
                data={graphData}
                onNodeClick={handleNodeClick}
                height={600}
            />

            {/* Top Shared Dependencies */}
            {graphData.metadata.topSharedDeps.length > 0 && (
                <div className="mt-6 bg-card border border-border rounded-lg p-4">
                    <h2 className="text-lg font-semibold text-white mb-3">
                        Top Shared Dependencies
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {graphData.metadata.topSharedDeps.map((dep) => (
                            <span
                                key={dep}
                                className="text-sm font-mono bg-slate-800 text-cyan-400 px-3 py-1.5 rounded-full cursor-pointer hover:bg-slate-700 transition-colors"
                                onClick={() => router.push(`/curate/explorer?q=${encodeURIComponent(dep)}`)}
                            >
                                {dep}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
