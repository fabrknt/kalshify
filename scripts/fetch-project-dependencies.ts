/**
 * Fetch Project Dependencies Script
 *
 * Fetches package.json from each project's GitHub repos to identify:
 * 1. What packages each project uses
 * 2. Which projects depend on each other (directly or via shared deps)
 * 3. Common technology patterns across projects
 *
 * Usage:
 *   npm run fetch:dependencies           # Fresh fetch all projects
 *   npm run fetch:dependencies -- --resume  # Resume, skip already fetched
 */

import { COMPANY_CONFIGS, CompanyConfig } from "../src/lib/cindex/company-configs";
import * as fs from "fs";
import * as path from "path";
import "dotenv/config";

const GITHUB_API_BASE = "https://api.github.com";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OUTPUT_PATH = "./data/project-dependencies.json";

// Small delay between requests (politeness)
const MIN_DELAY = 100;

interface PackageJson {
    name?: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
}

interface RepoDependencies {
    repoName: string;
    packageName?: string;
    dependencies: string[];
    devDependencies: string[];
    peerDependencies: string[];
}

interface ProjectDependencies {
    slug: string;
    name: string;
    githubOrg: string;
    repos: RepoDependencies[];
    allDependencies: string[];
    error?: string;
}

interface DependencyEdge {
    source: string;
    target: string;
    type: "direct" | "shared_dependency" | "uses_sdk";
    weight: number;
}

interface DependencyGraph {
    projects: ProjectDependencies[];
    edges: DependencyEdge[];
    sharedDependencies: Record<string, string[]>;
    sdkUsage: Record<string, string[]>;
}

// Known Web3 SDKs and their associated projects
const KNOWN_SDK_MAPPINGS: Record<string, string> = {
    "@uniswap/sdk": "uniswap",
    "@uniswap/sdk-core": "uniswap",
    "@uniswap/v3-sdk": "uniswap",
    "@aave/protocol-js": "aave",
    "@compound-finance/compound-js": "compound",
    "@openzeppelin/contracts": "openzeppelin",
    "@chainlink/contracts": "chainlink",
    "ethers": "ethereum",
    "viem": "ethereum",
    "wagmi": "ethereum",
    "@rainbow-me/rainbowkit": "rainbow",
    "@solana/web3.js": "solana",
    "@solana/spl-token": "solana",
    "@project-serum/anchor": "anchor",
    "@coral-xyz/anchor": "anchor",
    "@metaplex-foundation/js": "metaplex",
    "@jup-ag/core": "jupiter",
    "@marinade.finance/marinade-ts-sdk": "marinade",
    "@layerzerolabs/lz-sdk": "layerzero",
    "@socket.tech/plugin": "socket",
    "@biconomy/account": "biconomy",
    "@pimlico/permissionless": "pimlico",
    "@safe-global/safe-core-sdk": "safe",
    "@thirdweb-dev/sdk": "thirdweb",
    "@alchemy/aa-core": "alchemy",
    "@privy-io/react-auth": "privy",
    "helius-sdk": "helius",
};

// Rate limit tracking
let rateLimitRemaining = -1;
let rateLimitReset = 0;
let rateLimitTotal = -1;

async function githubFetch(endpoint: string): Promise<any> {
    const headers: HeadersInit = {
        Accept: "application/vnd.github.v3+json",
    };

    if (GITHUB_TOKEN) {
        headers["Authorization"] = `Bearer ${GITHUB_TOKEN}`;
    }

    const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, { headers });

    // Track rate limit from response headers
    const remaining = response.headers.get("x-ratelimit-remaining");
    const reset = response.headers.get("x-ratelimit-reset");
    const limit = response.headers.get("x-ratelimit-limit");
    if (remaining) rateLimitRemaining = parseInt(remaining);
    if (reset) rateLimitReset = parseInt(reset);
    if (limit) rateLimitTotal = parseInt(limit);

    // If rate limited, wait until reset
    if (response.status === 403 || response.status === 429 || rateLimitRemaining === 0) {
        const now = Date.now();
        const resetTime = rateLimitReset * 1000;
        const waitTime = resetTime - now + 2000;

        if (waitTime > 0) {
            const resetDate = new Date(resetTime);
            const waitMinutes = Math.ceil(waitTime / 60000);
            const waitSeconds = Math.ceil(waitTime / 1000);

            console.log(`\n   ⏳ Rate limited! Waiting until ${resetDate.toLocaleTimeString()} (${waitMinutes > 1 ? `${waitMinutes} minutes` : `${waitSeconds} seconds`})...`);

            if (waitTime > 60000) {
                const interval = setInterval(() => {
                    const remaining = Math.ceil((resetTime - Date.now()) / 1000);
                    if (remaining > 0 && remaining % 60 === 0) {
                        console.log(`   ⏳ ${Math.ceil(remaining / 60)} minutes remaining...`);
                    }
                }, 10000);

                await new Promise((resolve) => setTimeout(resolve, waitTime));
                clearInterval(interval);
            } else {
                await new Promise((resolve) => setTimeout(resolve, waitTime));
            }

            console.log(`   ✅ Rate limit reset. Resuming...\n`);
            return githubFetch(endpoint);
        }
    }

    if (!response.ok) {
        if (response.status === 404) {
            return null;
        }
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

function logRateLimit(): void {
    if (rateLimitRemaining >= 0) {
        const resetDate = new Date(rateLimitReset * 1000);
        const percentage = rateLimitTotal > 0 ? Math.round((rateLimitRemaining / rateLimitTotal) * 100) : 0;
        console.log(`   📊 Rate limit: ${rateLimitRemaining}/${rateLimitTotal} (${percentage}%) - resets at ${resetDate.toLocaleTimeString()}`);
    }
}

async function fetchRepoPackageJson(org: string, repo: string): Promise<PackageJson | null> {
    try {
        const content = await githubFetch(`/repos/${org}/${repo}/contents/package.json`);
        if (!content || !content.content) {
            return null;
        }
        const decoded = Buffer.from(content.content, "base64").toString("utf-8");
        return JSON.parse(decoded);
    } catch (error) {
        return null;
    }
}

async function fetchProjectDependencies(config: CompanyConfig): Promise<ProjectDependencies> {
    const result: ProjectDependencies = {
        slug: config.slug,
        name: config.name,
        githubOrg: config.github.org,
        repos: [],
        allDependencies: [],
    };

    try {
        let repos = await githubFetch(`/orgs/${config.github.org}/repos?per_page=100&sort=updated`);

        if (!repos || repos.length === 0) {
            const userRepos = await githubFetch(`/users/${config.github.org}/repos?per_page=100&sort=updated`);
            if (!userRepos || userRepos.length === 0) {
                result.error = "No repositories found";
                return result;
            }
            repos = userRepos;
        }

        const topRepos = repos.slice(0, 10);
        const allDeps = new Set<string>();

        for (const repo of topRepos) {
            const packageJson = await fetchRepoPackageJson(config.github.org, repo.name);

            if (packageJson) {
                const repoDeps: RepoDependencies = {
                    repoName: repo.name,
                    packageName: packageJson.name,
                    dependencies: Object.keys(packageJson.dependencies || {}),
                    devDependencies: Object.keys(packageJson.devDependencies || {}),
                    peerDependencies: Object.keys(packageJson.peerDependencies || {}),
                };

                result.repos.push(repoDeps);

                repoDeps.dependencies.forEach((dep) => allDeps.add(dep));
                repoDeps.devDependencies.forEach((dep) => allDeps.add(dep));
                repoDeps.peerDependencies.forEach((dep) => allDeps.add(dep));
            }

            await new Promise((resolve) => setTimeout(resolve, MIN_DELAY));
        }

        result.allDependencies = Array.from(allDeps).sort();
    } catch (error: any) {
        result.error = error.message;
    }

    return result;
}

function isSignificantDependency(dep: string): boolean {
    const commonPackages = [
        "typescript", "eslint", "prettier", "jest", "vitest",
        "react", "react-dom", "next", "lodash", "axios", "dotenv",
        "@types/node", "@types/react",
    ];

    if (commonPackages.includes(dep)) return false;

    const web3Patterns = [
        /^@solana\//, /^@ethereum\//, /^@openzeppelin\//, /^@chainlink\//,
        /^@uniswap\//, /^@aave\//, /^ethers/, /^viem/, /^wagmi/, /^web3/,
        /^@coral-xyz\//, /^@project-serum\//, /^@metaplex/, /^@thirdweb/,
        /^@alchemy/, /^@biconomy/, /^@privy/, /^@safe-global/, /^@layerzero/,
    ];

    return web3Patterns.some((pattern) => pattern.test(dep));
}

function buildDependencyGraph(projects: ProjectDependencies[]): DependencyGraph {
    const graph: DependencyGraph = {
        projects,
        edges: [],
        sharedDependencies: {},
        sdkUsage: {},
    };

    const depToProjects: Record<string, string[]> = {};

    for (const project of projects) {
        for (const dep of project.allDependencies) {
            if (!depToProjects[dep]) {
                depToProjects[dep] = [];
            }
            depToProjects[dep].push(project.slug);
        }
    }

    for (const [dep, projectSlugs] of Object.entries(depToProjects)) {
        if (projectSlugs.length >= 2) {
            graph.sharedDependencies[dep] = projectSlugs;
        }
    }

    for (const project of projects) {
        for (const dep of project.allDependencies) {
            const sdkOwner = KNOWN_SDK_MAPPINGS[dep];
            if (sdkOwner) {
                if (!graph.sdkUsage[dep]) {
                    graph.sdkUsage[dep] = [];
                }
                graph.sdkUsage[dep].push(project.slug);

                const ownerProject = projects.find((p) => p.slug === sdkOwner);
                if (ownerProject && project.slug !== sdkOwner) {
                    graph.edges.push({
                        source: project.slug,
                        target: sdkOwner,
                        type: "uses_sdk",
                        weight: 10,
                    });
                }
            }
        }
    }

    for (const [dep, projectSlugs] of Object.entries(graph.sharedDependencies)) {
        if (isSignificantDependency(dep)) {
            for (let i = 0; i < projectSlugs.length; i++) {
                for (let j = i + 1; j < projectSlugs.length; j++) {
                    const existingEdge = graph.edges.find(
                        (e) =>
                            (e.source === projectSlugs[i] && e.target === projectSlugs[j]) ||
                            (e.source === projectSlugs[j] && e.target === projectSlugs[i])
                    );

                    if (existingEdge) {
                        existingEdge.weight += 1;
                    } else {
                        graph.edges.push({
                            source: projectSlugs[i],
                            target: projectSlugs[j],
                            type: "shared_dependency",
                            weight: 1,
                        });
                    }
                }
            }
        }
    }

    return graph;
}

function printDependencyReport(graph: DependencyGraph): void {
    console.log("\n" + "=".repeat(80));
    console.log("PROJECT DEPENDENCY ANALYSIS REPORT");
    console.log("=".repeat(80));

    const successfulProjects = graph.projects.filter((p) => !p.error && p.repos.length > 0);
    const failedProjects = graph.projects.filter((p) => p.error || p.repos.length === 0);

    console.log(`\n📊 SUMMARY`);
    console.log(`   Projects analyzed: ${successfulProjects.length}`);
    console.log(`   Projects with errors: ${failedProjects.length}`);
    console.log(`   Total dependency edges: ${graph.edges.length}`);
    console.log(`   Shared dependencies: ${Object.keys(graph.sharedDependencies).length}`);

    console.log(`\n🔗 SDK USAGE (Projects using other projects' SDKs)`);
    const sdkEntries = Object.entries(graph.sdkUsage)
        .filter(([_, users]) => users.length > 0)
        .sort((a, b) => b[1].length - a[1].length);

    if (sdkEntries.length === 0) {
        console.log("   No SDK dependencies detected between tracked projects");
    } else {
        for (const [sdk, users] of sdkEntries.slice(0, 20)) {
            console.log(`   ${sdk}: ${users.join(", ")}`);
        }
    }

    console.log(`\n📦 TOP SHARED DEPENDENCIES (Web3-related)`);
    const sharedEntries = Object.entries(graph.sharedDependencies)
        .filter(([dep]) => isSignificantDependency(dep))
        .sort((a, b) => b[1].length - a[1].length);

    for (const [dep, projects] of sharedEntries.slice(0, 20)) {
        console.log(`   ${dep} (${projects.length} projects): ${projects.slice(0, 5).join(", ")}${projects.length > 5 ? "..." : ""}`);
    }

    console.log(`\n🤝 STRONGEST PROJECT CONNECTIONS`);
    const sortedEdges = graph.edges.sort((a, b) => b.weight - a.weight);
    for (const edge of sortedEdges.slice(0, 20)) {
        console.log(`   ${edge.source} <-> ${edge.target} (weight: ${edge.weight}, type: ${edge.type})`);
    }

    console.log("\n" + "=".repeat(80));
}

function loadExistingData(): DependencyGraph | null {
    try {
        if (fs.existsSync(OUTPUT_PATH)) {
            const data = JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf-8"));
            return data;
        }
    } catch (error) {
        console.log("   Could not load existing data, starting fresh.");
    }
    return null;
}

function saveData(graph: DependencyGraph): void {
    const dataDir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(graph, null, 2));
}

async function main() {
    const args = process.argv.slice(2);
    const resumeMode = args.includes("--resume");

    if (!GITHUB_TOKEN) {
        console.warn("⚠️  GITHUB_TOKEN not set. Rate limit: 60 requests/hour.");
        console.warn("   Set GITHUB_TOKEN for 5000 requests/hour.\n");
    } else {
        console.log("✅ GITHUB_TOKEN detected. Rate limit: 5000 requests/hour.\n");
    }

    // Load existing data for resume mode
    let existingProjects = new Map<string, ProjectDependencies>();
    if (resumeMode) {
        console.log("🔄 Resume mode: checking for existing data...");
        const existingData = loadExistingData();
        if (existingData && existingData.projects) {
            for (const p of existingData.projects) {
                if (p.repos.length > 0 || p.error) {
                    existingProjects.set(p.slug, p);
                }
            }
            console.log(`   Found ${existingProjects.size} projects with existing data.\n`);
        } else {
            console.log("   No existing data found, starting fresh.\n");
        }
    }

    const projectsToFetch = resumeMode
        ? COMPANY_CONFIGS.filter((c) => !existingProjects.has(c.slug))
        : COMPANY_CONFIGS;

    if (projectsToFetch.length === 0) {
        console.log("✅ All projects already have data. Nothing to fetch.\n");
        const existingData = loadExistingData();
        if (existingData) {
            printDependencyReport(existingData);
        }
        return;
    }

    console.log(`🔍 Fetching dependencies for ${projectsToFetch.length} projects...`);
    if (resumeMode) {
        console.log(`   (Skipping ${existingProjects.size} projects with existing data)`);
    }
    console.log(`   Will auto-wait when rate limited and resume after reset.\n`);

    const projectDependencies: ProjectDependencies[] = Array.from(existingProjects.values());
    let processed = 0;
    let successful = existingProjects.size;

    for (const config of projectsToFetch) {
        processed++;
        console.log(`[${processed}/${projectsToFetch.length}] ${config.name} (${config.github.org})...`);

        if (processed % 10 === 0) {
            logRateLimit();
        }

        const deps = await fetchProjectDependencies(config);
        projectDependencies.push(deps);

        if (deps.error) {
            console.log(`   ❌ ${deps.error}`);
        } else if (deps.repos.length === 0) {
            console.log(`   ⚠️  No package.json found`);
        } else {
            console.log(`   ✅ ${deps.repos.length} repos, ${deps.allDependencies.length} deps`);
            successful++;
        }

        // Save progress after each project (crash-safe)
        if (resumeMode && processed % 5 === 0) {
            const tempGraph = buildDependencyGraph(projectDependencies);
            saveData(tempGraph);
            console.log(`   💾 Progress saved (${projectDependencies.length} projects)`);
        }

        await new Promise((resolve) => setTimeout(resolve, MIN_DELAY));
    }

    console.log(`\n📊 Fetched ${successful} projects with data\n`);

    // Build and save final graph
    const graph = buildDependencyGraph(projectDependencies);
    saveData(graph);
    console.log(`💾 Results saved to ${OUTPUT_PATH}`);

    printDependencyReport(graph);
}

main().catch(console.error);
