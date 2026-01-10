/**
 * Curate Query Functions
 * Database queries for dependency visualization and ecosystem mapping
 */

import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

// Types for graph visualization
export interface GraphNode {
    id: string;
    name: string;
    type: "project" | "sdk" | "cluster";
    category?: string;
    chain?: string;
    score?: number;
    logo?: string;
}

export interface GraphLink {
    source: string;
    target: string;
    type: "uses_sdk" | "shared_dependency" | "direct_import";
    weight: number;
}

export interface GraphData {
    nodes: GraphNode[];
    links: GraphLink[];
    metadata: {
        totalProjects: number;
        totalEdges: number;
        mostConnected: string[];
        topSharedDeps: string[];
    };
}

export interface DependencyInfo {
    package: string;
    projectCount: number;
    projects: string[];
    category: "ethereum" | "solana" | "cross-chain" | "infrastructure" | "general";
}

export interface ProjectDependencyInfo {
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

// Known SDK mappings for categorization
const SDK_CATEGORIES: Record<string, "ethereum" | "solana" | "cross-chain" | "infrastructure"> = {
    "@solana/web3.js": "solana",
    "@solana/spl-token": "solana",
    "@coral-xyz/anchor": "solana",
    "@project-serum/anchor": "solana",
    "@metaplex-foundation/js": "solana",
    "ethers": "ethereum",
    "viem": "ethereum",
    "wagmi": "ethereum",
    "@openzeppelin/contracts": "ethereum",
    "@uniswap/sdk": "ethereum",
    "@uniswap/v3-sdk": "ethereum",
    "@chainlink/contracts": "ethereum",
    "@layerzerolabs/lz-sdk": "cross-chain",
    "@socket.tech/plugin": "cross-chain",
    "@thirdweb-dev/sdk": "infrastructure",
    "@alchemy/aa-core": "infrastructure",
    "@biconomy/account": "infrastructure",
    "@privy-io/react-auth": "infrastructure",
};

/**
 * Get full graph data for visualization
 */
export async function getGraphData(options?: {
    minWeight?: number;
    category?: string;
    chain?: string;
}): Promise<GraphData> {
    const { minWeight = 1, category, chain } = options || {};

    // Build company filter
    const companyWhere: any = { isActive: true };
    if (category) companyWhere.category = category;
    if (chain) companyWhere.chains = { has: chain };

    // Get all relationships
    const relationships = await prisma.projectRelationship.findMany({
        where: { weight: { gte: minWeight } },
        orderBy: { weight: "desc" },
    });

    // Get company info for nodes
    const companies = await prisma.company.findMany({
        where: companyWhere,
        select: {
            slug: true,
            name: true,
            category: true,
            chains: true,
            overallScore: true,
            logo: true,
        },
    });

    const companySlugs = new Set(companies.map((c) => c.slug));

    // Build nodes from companies
    const nodes: GraphNode[] = companies.map((c) => ({
        id: c.slug,
        name: c.name,
        type: "project" as const,
        category: c.category,
        chain: c.chains?.[0],
        score: c.overallScore,
        logo: c.logo || undefined,
    }));

    // Filter links to only include edges between existing companies
    const links: GraphLink[] = relationships
        .filter((r) => companySlugs.has(r.sourceSlug) && companySlugs.has(r.targetSlug))
        .map((r) => ({
            source: r.sourceSlug,
            target: r.targetSlug,
            type: r.relationshipType as GraphLink["type"],
            weight: r.weight,
        }));

    // Calculate connection counts for metadata
    const connectionCounts: Record<string, number> = {};
    links.forEach((link) => {
        connectionCounts[link.source] = (connectionCounts[link.source] || 0) + link.weight;
        connectionCounts[link.target] = (connectionCounts[link.target] || 0) + link.weight;
    });

    const mostConnected = Object.entries(connectionCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([slug]) => slug);

    // Get top shared dependencies
    const deps = await prisma.projectDependency.findMany({
        select: { allDependencies: true },
    });

    const depCounts: Record<string, number> = {};
    deps.forEach((d) => {
        d.allDependencies.forEach((dep) => {
            if (isWeb3Dependency(dep)) {
                depCounts[dep] = (depCounts[dep] || 0) + 1;
            }
        });
    });

    const topSharedDeps = Object.entries(depCounts)
        .filter(([, count]) => count >= 2)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([dep]) => dep);

    return {
        nodes,
        links,
        metadata: {
            totalProjects: nodes.length,
            totalEdges: links.length,
            mostConnected,
            topSharedDeps,
        },
    };
}

/**
 * Search/filter shared dependencies
 */
export async function getSharedDependencies(options?: {
    search?: string;
    category?: "ethereum" | "solana" | "cross-chain" | "infrastructure" | "general";
    minProjects?: number;
    limit?: number;
}): Promise<DependencyInfo[]> {
    const { search, category, minProjects = 2, limit = 100 } = options || {};

    const deps = await prisma.projectDependency.findMany({
        select: {
            companySlug: true,
            allDependencies: true,
        },
    });

    // Build dependency -> projects map
    const depToProjects: Record<string, string[]> = {};

    deps.forEach((d) => {
        d.allDependencies.forEach((dep) => {
            if (!depToProjects[dep]) {
                depToProjects[dep] = [];
            }
            depToProjects[dep].push(d.companySlug);
        });
    });

    // Filter and transform
    let results: DependencyInfo[] = Object.entries(depToProjects)
        .filter(([dep, projects]) => {
            if (projects.length < minProjects) return false;
            if (search && !dep.toLowerCase().includes(search.toLowerCase())) return false;
            if (category) {
                const depCategory = getDependencyCategory(dep);
                if (depCategory !== category) return false;
            }
            return true;
        })
        .map(([dep, projects]) => ({
            package: dep,
            projectCount: projects.length,
            projects,
            category: getDependencyCategory(dep),
        }))
        .sort((a, b) => b.projectCount - a.projectCount);

    return results.slice(0, limit);
}

/**
 * Get project dependency details
 */
export async function getProjectDependencies(slug: string): Promise<ProjectDependencyInfo | null> {
    // Get company info
    const company = await prisma.company.findUnique({
        where: { slug },
        select: {
            slug: true,
            name: true,
            category: true,
            logo: true,
            overallScore: true,
        },
    });

    if (!company) return null;

    // Get dependency data
    const depData = await prisma.projectDependency.findUnique({
        where: { companySlug: slug },
    });

    // Get relationships where this project is the target (who uses this project)
    const incomingRels = await prisma.projectRelationship.findMany({
        where: { targetSlug: slug },
        orderBy: { weight: "desc" },
    });

    // Get company names for dependents
    const dependentSlugs = incomingRels.map((r) => r.sourceSlug);
    const dependentCompanies = await prisma.company.findMany({
        where: { slug: { in: dependentSlugs } },
        select: { slug: true, name: true },
    });

    const slugToName: Record<string, string> = {};
    dependentCompanies.forEach((c) => {
        slugToName[c.slug] = c.name;
    });

    // Build response
    const repos = depData?.repos as any[] || [];

    return {
        project: {
            slug: company.slug,
            name: company.name,
            category: company.category,
            githubOrg: depData?.githubOrg || "",
            logo: company.logo || undefined,
            score: company.overallScore,
        },
        dependencies: (depData?.allDependencies || []).map((dep) => ({
            package: dep,
            type: "dependency" as const,
            isWeb3: isWeb3Dependency(dep),
            linkedProject: getLinkedProject(dep),
        })),
        dependents: incomingRels.map((r) => ({
            slug: r.sourceSlug,
            name: slugToName[r.sourceSlug] || r.sourceSlug,
            relationship: r.relationshipType,
            weight: r.weight,
        })),
        repos: repos.map((repo: any) => ({
            name: repo.repoName,
            packageName: repo.packageName,
            dependencyCount:
                (repo.dependencies?.length || 0) +
                (repo.devDependencies?.length || 0) +
                (repo.peerDependencies?.length || 0),
        })),
    };
}

/**
 * Get projects by ecosystem cluster
 */
export async function getEcosystemProjects(ecosystem: string): Promise<GraphData> {
    const chainMap: Record<string, string[]> = {
        solana: ["solana"],
        ethereum: ["ethereum"],
        evm: ["ethereum", "base", "arbitrum", "optimism", "polygon"],
        base: ["base"],
        arbitrum: ["arbitrum"],
        optimism: ["optimism"],
        polygon: ["polygon"],
        "cross-chain": [], // Special case - projects on multiple chains
        infrastructure: [], // Special case - infrastructure category
    };

    let companyWhere: any = { isActive: true };

    if (ecosystem === "infrastructure") {
        companyWhere.category = "infrastructure";
    } else if (ecosystem === "cross-chain") {
        // Projects on 2+ chains
        companyWhere.chains = { isEmpty: false };
    } else if (chainMap[ecosystem]) {
        companyWhere.chains = { hasSome: chainMap[ecosystem] };
    }

    // Get companies in this ecosystem
    const companies = await prisma.company.findMany({
        where: companyWhere,
        select: {
            slug: true,
            name: true,
            category: true,
            chains: true,
            overallScore: true,
            logo: true,
        },
    });

    const companySlugs = new Set(companies.map((c) => c.slug));

    // Get relationships between these companies
    const relationships = await prisma.projectRelationship.findMany({
        where: {
            OR: [
                { sourceSlug: { in: Array.from(companySlugs) } },
                { targetSlug: { in: Array.from(companySlugs) } },
            ],
        },
    });

    // Build graph
    const nodes: GraphNode[] = companies.map((c) => ({
        id: c.slug,
        name: c.name,
        type: "project" as const,
        category: c.category,
        chain: c.chains?.[0],
        score: c.overallScore,
        logo: c.logo || undefined,
    }));

    const links: GraphLink[] = relationships
        .filter((r) => companySlugs.has(r.sourceSlug) && companySlugs.has(r.targetSlug))
        .map((r) => ({
            source: r.sourceSlug,
            target: r.targetSlug,
            type: r.relationshipType as GraphLink["type"],
            weight: r.weight,
        }));

    // Calculate metadata
    const connectionCounts: Record<string, number> = {};
    links.forEach((link) => {
        connectionCounts[link.source] = (connectionCounts[link.source] || 0) + link.weight;
        connectionCounts[link.target] = (connectionCounts[link.target] || 0) + link.weight;
    });

    const mostConnected = Object.entries(connectionCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([slug]) => slug);

    return {
        nodes,
        links,
        metadata: {
            totalProjects: nodes.length,
            totalEdges: links.length,
            mostConnected,
            topSharedDeps: [],
        },
    };
}

// Helper functions

function isWeb3Dependency(dep: string): boolean {
    const web3Patterns = [
        /^@solana\//, /^@ethereum\//, /^@openzeppelin\//, /^@chainlink\//,
        /^@uniswap\//, /^@aave\//, /^ethers/, /^viem/, /^wagmi/, /^web3/,
        /^@coral-xyz\//, /^@project-serum\//, /^@metaplex/, /^@thirdweb/,
        /^@alchemy/, /^@biconomy/, /^@privy/, /^@safe-global/, /^@layerzero/,
        /^@rainbow-me\//, /^@coinbase\//, /^@walletconnect\//,
    ];

    return web3Patterns.some((pattern) => pattern.test(dep));
}

function getDependencyCategory(dep: string): DependencyInfo["category"] {
    if (SDK_CATEGORIES[dep]) {
        return SDK_CATEGORIES[dep];
    }

    if (dep.includes("solana") || dep.includes("anchor") || dep.includes("metaplex")) {
        return "solana";
    }

    if (
        dep.includes("ethereum") ||
        dep.includes("ethers") ||
        dep.includes("viem") ||
        dep.includes("wagmi") ||
        dep.includes("openzeppelin")
    ) {
        return "ethereum";
    }

    if (dep.includes("layerzero") || dep.includes("socket") || dep.includes("bridge")) {
        return "cross-chain";
    }

    if (
        dep.includes("thirdweb") ||
        dep.includes("alchemy") ||
        dep.includes("privy") ||
        dep.includes("biconomy")
    ) {
        return "infrastructure";
    }

    return "general";
}

function getLinkedProject(dep: string): string | undefined {
    const SDK_TO_PROJECT: Record<string, string> = {
        "@solana/web3.js": "solana",
        "@uniswap/sdk": "uniswap",
        "@uniswap/v3-sdk": "uniswap",
        "@chainlink/contracts": "chainlink",
        "@thirdweb-dev/sdk": "thirdweb",
        "@alchemy/aa-core": "alchemy",
        "@biconomy/account": "biconomy",
        "@privy-io/react-auth": "privy",
        "@pimlico/permissionless": "pimlico",
        "helius-sdk": "helius",
        "@layerzerolabs/lz-sdk": "layerzero",
    };

    return SDK_TO_PROJECT[dep];
}
