"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Package, Users, Filter, ExternalLink, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DependencyInfo {
    package: string;
    projectCount: number;
    projects: string[];
    category: "ethereum" | "solana" | "cross-chain" | "infrastructure" | "general";
}

const CATEGORY_OPTIONS = [
    { value: "", label: "All" },
    { value: "ethereum", label: "Ethereum" },
    { value: "solana", label: "Solana" },
    { value: "cross-chain", label: "Cross-chain" },
    { value: "infrastructure", label: "Infrastructure" },
    { value: "general", label: "General" },
];

const CATEGORY_COLORS: Record<string, string> = {
    ethereum: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    solana: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    "cross-chain": "bg-green-500/20 text-green-400 border-green-500/30",
    infrastructure: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    general: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

export default function ExplorerPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get("q") || "";

    const [dependencies, setDependencies] = useState<DependencyInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [category, setCategory] = useState("");
    const [minProjects, setMinProjects] = useState(2);

    const fetchDependencies = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.set("q", searchQuery);
            if (category) params.set("category", category);
            params.set("minProjects", minProjects.toString());
            params.set("limit", "100");

            const response = await fetch(`/api/curate/dependencies?${params}`);
            if (!response.ok) throw new Error("Failed to fetch");

            const data = await response.json();
            setDependencies(data.dependencies);
        } catch (error) {
            console.error("Error fetching dependencies:", error);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, category, minProjects]);

    useEffect(() => {
        fetchDependencies();
    }, [fetchDependencies]);

    // Update URL when search changes
    useEffect(() => {
        const params = new URLSearchParams();
        if (searchQuery) params.set("q", searchQuery);
        const newUrl = params.toString() ? `?${params}` : "/curate/explorer";
        router.replace(newUrl, { scroll: false });
    }, [searchQuery, router]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchDependencies();
    };

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white mb-2">
                    Tech Stack Explorer
                </h1>
                <p className="text-slate-400">
                    Search and filter shared dependencies across Web3 projects
                </p>
            </div>

            {/* Search and Filters */}
            <div className="bg-card border border-border rounded-lg p-4 mb-6">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                    {/* Search input */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search packages (e.g., @solana/web3.js, ethers)"
                            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                        />
                    </div>

                    {/* Category filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-slate-500" />
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                        >
                            {CATEGORY_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Min projects filter */}
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-slate-500" />
                        <select
                            value={minProjects}
                            onChange={(e) => setMinProjects(parseInt(e.target.value))}
                            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                        >
                            <option value="2">2+ projects</option>
                            <option value="3">3+ projects</option>
                            <option value="5">5+ projects</option>
                            <option value="10">10+ projects</option>
                        </select>
                    </div>
                </form>
            </div>

            {/* Results */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
                </div>
            ) : dependencies.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 bg-card border border-border rounded-lg">
                    <Package className="h-12 w-12 text-slate-600 mb-4" />
                    <p className="text-slate-400">No dependencies found</p>
                    <p className="text-slate-600 text-sm mt-1">
                        Try adjusting your search or filters
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="text-sm text-slate-400 mb-4">
                        Found {dependencies.length} shared dependencies
                    </div>

                    {dependencies.map((dep) => (
                        <div
                            key={dep.package}
                            className="bg-card border border-border rounded-lg p-4 hover:border-slate-600 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <Package className="h-5 w-5 text-cyan-400" />
                                    <div>
                                        <div className="font-mono text-white font-medium">
                                            {dep.package}
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={`mt-1 text-xs ${CATEGORY_COLORS[dep.category]}`}
                                        >
                                            {dep.category}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-cyan-400">
                                            {dep.projectCount}
                                        </div>
                                        <div className="text-xs text-slate-500">projects</div>
                                    </div>
                                    <a
                                        href={`https://www.npmjs.com/package/${dep.package}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-slate-500 hover:text-white transition-colors"
                                        title="View on npm"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                </div>
                            </div>

                            {/* Projects using this dependency */}
                            <div className="flex flex-wrap gap-2">
                                {dep.projects.slice(0, 10).map((slug) => (
                                    <button
                                        key={slug}
                                        onClick={() => router.push(`/curate/project/${slug}`)}
                                        className="text-sm bg-slate-800 text-slate-300 px-2 py-1 rounded hover:bg-slate-700 hover:text-white transition-colors"
                                    >
                                        {slug}
                                    </button>
                                ))}
                                {dep.projects.length > 10 && (
                                    <span className="text-sm text-slate-500 px-2 py-1">
                                        +{dep.projects.length - 10} more
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
