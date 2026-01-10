"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Package,
    Users,
    GitBranch,
    ExternalLink,
    Loader2,
    ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProjectDependencyInfo {
    project: {
        slug: string;
        name: string;
        category: string;
        githubOrg: string;
        logo?: string;
        score?: number;
    };
    dependencies: {
        package: string;
        type: "dependency" | "devDependency" | "peerDependency";
        isWeb3: boolean;
        linkedProject?: string;
    }[];
    dependents: {
        slug: string;
        name: string;
        relationship: string;
        weight: number;
    }[];
    repos: {
        name: string;
        packageName?: string;
        dependencyCount: number;
    }[];
}

const CATEGORY_COLORS: Record<string, string> = {
    defi: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    infrastructure: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    nft: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    dao: "bg-green-500/20 text-green-400 border-green-500/30",
    gaming: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

export default function ProjectDependencyPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [data, setData] = useState<ProjectDependencyInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAllDeps, setShowAllDeps] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch(`/api/curate/project/${slug}`);
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error("Project not found");
                    }
                    throw new Error("Failed to fetch project data");
                }
                const result = await response.json();
                setData(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setLoading(false);
            }
        }

        if (slug) {
            fetchData();
        }
    }, [slug]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col items-center justify-center h-64 bg-card border border-border rounded-lg">
                    <p className="text-red-400 mb-2">{error || "Project not found"}</p>
                    <Link
                        href="/curate"
                        className="text-cyan-400 hover:underline text-sm"
                    >
                        Back to Graph
                    </Link>
                </div>
            </div>
        );
    }

    const web3Deps = data.dependencies.filter((d) => d.isWeb3);
    const otherDeps = data.dependencies.filter((d) => !d.isWeb3);
    const displayedDeps = showAllDeps ? data.dependencies : web3Deps.slice(0, 20);

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-foreground">
                        CURATE
                    </h1>
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-400/10 text-cyan-400 border border-cyan-400/30 text-xs font-semibold font-mono">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                        </span>
                        PREVIEW
                    </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                    Project Dependencies
                </p>
                <p className="text-muted-foreground">
                    View dependency analysis for this Web3 project.
                </p>
            </div>

            {/* Data Fetching Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                        <div className="relative flex h-3 w-3 mt-1">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                        </div>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-blue-900 mb-1">
                            Data Collection in Progress
                        </h3>
                        <p className="text-sm text-blue-800">
                            We are currently fetching dependency data from GitHub repositories.
                            Some dependency information may not be available yet.
                        </p>
                    </div>
                </div>
            </div>

            {/* Back button */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-slate-400 hover:text-foreground transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
            </button>

            {/* Project Header */}
            <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        {data.project.logo && (
                            <span className="text-4xl">{data.project.logo}</span>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-1">
                                {data.project.name}
                            </h1>
                            <div className="flex items-center gap-3">
                                <Badge
                                    variant="outline"
                                    className={CATEGORY_COLORS[data.project.category] || ""}
                                >
                                    {data.project.category}
                                </Badge>
                                {data.project.githubOrg && (
                                    <a
                                        href={`https://github.com/${data.project.githubOrg}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors"
                                    >
                                        <GitBranch className="h-4 w-4" />
                                        <span>{data.project.githubOrg}</span>
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                    {data.project.score !== undefined && (
                        <div className="text-right">
                            <div className="text-3xl font-bold text-cyan-400">
                                {data.project.score}
                            </div>
                            <div className="text-xs text-slate-500">Index Score</div>
                        </div>
                    )}
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-700">
                    <div>
                        <div className="text-2xl font-bold text-white">
                            {data.dependencies.length}
                        </div>
                        <div className="text-xs text-slate-500">Dependencies</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">
                            {web3Deps.length}
                        </div>
                        <div className="text-xs text-slate-500">Web3 Packages</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-cyan-400">
                            {data.dependents.length}
                        </div>
                        <div className="text-xs text-slate-500">Dependents</div>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Dependencies */}
                <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Package className="h-5 w-5 text-cyan-400" />
                            Dependencies
                        </h2>
                        {data.dependencies.length > 20 && (
                            <button
                                onClick={() => setShowAllDeps(!showAllDeps)}
                                className="text-sm text-cyan-400 hover:underline"
                            >
                                {showAllDeps ? "Show Web3 only" : `Show all (${data.dependencies.length})`}
                            </button>
                        )}
                    </div>

                    {displayedDeps.length === 0 ? (
                        <p className="text-slate-500 text-sm">No dependency data available</p>
                    ) : (
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {displayedDeps.map((dep) => (
                                <div
                                    key={dep.package}
                                    className="flex items-center justify-between py-2 px-3 bg-slate-800/50 rounded hover:bg-slate-800 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-sm text-white">
                                            {dep.package}
                                        </span>
                                        {dep.isWeb3 && (
                                            <Badge variant="outline" className="text-[10px] bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
                                                Web3
                                            </Badge>
                                        )}
                                    </div>
                                    {dep.linkedProject && (
                                        <button
                                            onClick={() => router.push(`/curate/project/${dep.linkedProject}`)}
                                            className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1"
                                        >
                                            <span>{dep.linkedProject}</span>
                                            <ChevronRight className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Dependents (who uses this project) */}
                <div className="bg-card border border-border rounded-lg p-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                        <Users className="h-5 w-5 text-cyan-400" />
                        Used By
                    </h2>

                    {data.dependents.length === 0 ? (
                        <p className="text-slate-500 text-sm">
                            No other tracked projects depend on this one
                        </p>
                    ) : (
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {data.dependents.map((dep) => (
                                <button
                                    key={dep.slug}
                                    onClick={() => router.push(`/curate/project/${dep.slug}`)}
                                    className="w-full flex items-center justify-between py-2 px-3 bg-slate-800/50 rounded hover:bg-slate-800 transition-colors text-left"
                                >
                                    <div>
                                        <div className="font-medium text-white">
                                            {dep.name}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {dep.relationship === "uses_sdk" ? "Uses SDK" : "Shared dependencies"}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs">
                                            {dep.weight} pts
                                        </Badge>
                                        <ChevronRight className="h-4 w-4 text-slate-500" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Analyzed Repos */}
            {data.repos.length > 0 && (
                <div className="mt-6 bg-card border border-border rounded-lg p-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                        <GitBranch className="h-5 w-5 text-cyan-400" />
                        Analyzed Repositories
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {data.repos.map((repo) => (
                            <a
                                key={repo.name}
                                href={`https://github.com/${data.project.githubOrg}/${repo.name}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-3 bg-slate-800/50 rounded hover:bg-slate-800 transition-colors"
                            >
                                <div>
                                    <div className="font-medium text-white text-sm">
                                        {repo.name}
                                    </div>
                                    {repo.packageName && (
                                        <div className="text-xs text-slate-500 font-mono">
                                            {repo.packageName}
                                        </div>
                                    )}
                                </div>
                                <div className="text-xs text-slate-400">
                                    {repo.dependencyCount} deps
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* Link to cindex */}
            <div className="mt-6 text-center">
                <Link
                    href={`/cindex/${slug}`}
                    className="inline-flex items-center gap-2 text-cyan-400 hover:underline"
                >
                    View full Index profile
                    <ExternalLink className="h-4 w-4" />
                </Link>
            </div>
        </div>
    );
}
