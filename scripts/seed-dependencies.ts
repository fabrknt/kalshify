/**
 * Seed Dependencies Script
 *
 * Populates ProjectDependency and ProjectRelationship tables from
 * either:
 * 1. Previously fetched JSON data (data/project-dependencies.json)
 * 2. Fresh fetch from GitHub (if --fetch flag is provided)
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { COMPANY_CONFIGS, CompanyConfig } from "../src/lib/cindex/company-configs";
import * as fs from "fs";
import * as path from "path";
import "dotenv/config";

// Initialize Prisma with pg adapter (same as app)
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const GITHUB_API_BASE = "https://api.github.com";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Small delay to avoid hammering the API (just for politeness)
const MIN_DELAY = 100; // 100ms between requests

// Known Web3 SDKs and their associated project slugs
const KNOWN_SDK_MAPPINGS: Record<string, string> = {
    // Ethereum/EVM
    "@uniswap/sdk": "uniswap",
    "@uniswap/sdk-core": "uniswap",
    "@uniswap/v3-sdk": "uniswap",
    "@aave/protocol-js": "aave",
    "@compound-finance/compound-js": "compound",
    "@openzeppelin/contracts": "openzeppelin",
    "@chainlink/contracts": "chainlink",
    "ethers": "ethereum-core",
    "viem": "ethereum-core",
    "wagmi": "ethereum-core",
    "@rainbow-me/rainbowkit": "rainbow",

    // Solana
    "@solana/web3.js": "solana-core",
    "@solana/spl-token": "solana-core",
    "@project-serum/anchor": "anchor",
    "@coral-xyz/anchor": "anchor",
    "@metaplex-foundation/js": "metaplex",
    "@jup-ag/core": "jupiter",
    "@marinade.finance/marinade-ts-sdk": "marinade-finance",

    // Cross-chain
    "@layerzerolabs/lz-sdk": "layerzero",
    "@socket.tech/plugin": "socket",

    // Account abstraction
    "@biconomy/account": "biconomy",
    "@pimlico/permissionless": "pimlico",
    "@safe-global/safe-core-sdk": "safe",

    // Infrastructure
    "@thirdweb-dev/sdk": "thirdweb",
    "@alchemy/aa-core": "alchemy",
    "@privy-io/react-auth": "privy",
    "helius-sdk": "helius",
};

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
    type: "uses_sdk" | "shared_dependency" | "direct_import";
    weight: number;
    evidence: { packages: string[] };
}

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

    // If rate limited (403) or about to be (remaining = 0), wait until reset
    if (response.status === 403 || (response.status === 429) || rateLimitRemaining === 0) {
        const now = Date.now();
        const resetTime = rateLimitReset * 1000;
        const waitTime = resetTime - now + 2000; // Add 2s buffer

        if (waitTime > 0) {
            const resetDate = new Date(resetTime);
            const waitMinutes = Math.ceil(waitTime / 60000);
            const waitSeconds = Math.ceil(waitTime / 1000);

            console.log(`\n   ⏳ Rate limited! Waiting until ${resetDate.toLocaleTimeString()} (${waitMinutes > 1 ? `${waitMinutes} minutes` : `${waitSeconds} seconds`})...`);

            // Show countdown for longer waits
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
            return githubFetch(endpoint); // Retry
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
        // Get all repos for the organization
        let repos = await githubFetch(`/orgs/${config.github.org}/repos?per_page=100&sort=updated`);

        if (!repos || repos.length === 0) {
            // Try as a user instead of org
            const userRepos = await githubFetch(`/users/${config.github.org}/repos?per_page=100&sort=updated`);
            if (!userRepos || userRepos.length === 0) {
                result.error = "No repositories found";
                return result;
            }
            repos = userRepos;
        }

        // Fetch package.json from top 10 most recently updated repos
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

            // Small delay to avoid rate limiting
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

    if (commonPackages.includes(dep)) {
        return false;
    }

    const web3Patterns = [
        /^@solana\//, /^@ethereum\//, /^@openzeppelin\//, /^@chainlink\//,
        /^@uniswap\//, /^@aave\//, /^ethers/, /^viem/, /^wagmi/, /^web3/,
        /^@coral-xyz\//, /^@project-serum\//, /^@metaplex/, /^@thirdweb/,
        /^@alchemy/, /^@biconomy/, /^@privy/, /^@safe-global/, /^@layerzero/,
    ];

    return web3Patterns.some((pattern) => pattern.test(dep));
}

function buildRelationships(projects: ProjectDependencies[]): DependencyEdge[] {
    const edges: DependencyEdge[] = [];
    const edgeMap = new Map<string, DependencyEdge>();

    // Map org names to slugs for lookup
    const orgToSlug: Record<string, string> = {};
    COMPANY_CONFIGS.forEach((config) => {
        orgToSlug[config.github.org.toLowerCase()] = config.slug;
    });

    // Build shared dependencies map
    const depToProjects: Record<string, string[]> = {};

    for (const project of projects) {
        for (const dep of project.allDependencies) {
            if (!depToProjects[dep]) {
                depToProjects[dep] = [];
            }
            depToProjects[dep].push(project.slug);
        }
    }

    // 1. Detect SDK usage (projects using other projects' SDKs)
    for (const project of projects) {
        for (const dep of project.allDependencies) {
            const sdkOwner = KNOWN_SDK_MAPPINGS[dep];
            if (sdkOwner) {
                // Find if the SDK owner is a tracked project
                const ownerProject = projects.find((p) => p.slug === sdkOwner);
                if (ownerProject && project.slug !== sdkOwner) {
                    const key = `${project.slug}:${sdkOwner}:uses_sdk`;
                    if (!edgeMap.has(key)) {
                        edgeMap.set(key, {
                            source: project.slug,
                            target: sdkOwner,
                            type: "uses_sdk",
                            weight: 10,
                            evidence: { packages: [dep] },
                        });
                    } else {
                        const existing = edgeMap.get(key)!;
                        existing.weight += 5;
                        existing.evidence.packages.push(dep);
                    }
                }
            }
        }
    }

    // 2. Create edges for significant shared dependencies
    for (const [dep, projectSlugs] of Object.entries(depToProjects)) {
        if (projectSlugs.length >= 2 && isSignificantDependency(dep)) {
            for (let i = 0; i < projectSlugs.length; i++) {
                for (let j = i + 1; j < projectSlugs.length; j++) {
                    const keyA = `${projectSlugs[i]}:${projectSlugs[j]}:shared_dependency`;
                    const keyB = `${projectSlugs[j]}:${projectSlugs[i]}:shared_dependency`;

                    // Use alphabetically sorted key to avoid duplicates
                    const sortedKey = projectSlugs[i] < projectSlugs[j] ? keyA : keyB;
                    const [source, target] = projectSlugs[i] < projectSlugs[j]
                        ? [projectSlugs[i], projectSlugs[j]]
                        : [projectSlugs[j], projectSlugs[i]];

                    if (!edgeMap.has(sortedKey)) {
                        edgeMap.set(sortedKey, {
                            source,
                            target,
                            type: "shared_dependency",
                            weight: 1,
                            evidence: { packages: [dep] },
                        });
                    } else {
                        const existing = edgeMap.get(sortedKey)!;
                        existing.weight += 1;
                        if (!existing.evidence.packages.includes(dep)) {
                            existing.evidence.packages.push(dep);
                        }
                    }
                }
            }
        }
    }

    return Array.from(edgeMap.values());
}

async function seedFromFetch(resumeMode: boolean = false): Promise<void> {
    if (!GITHUB_TOKEN) {
        console.warn("⚠️  GITHUB_TOKEN not set. Rate limit: 60 requests/hour.");
        console.warn("   Set GITHUB_TOKEN for 5000 requests/hour.\n");
    } else {
        console.log("✅ GITHUB_TOKEN detected. Rate limit: 5000 requests/hour.\n");
    }

    // In resume mode, check which projects already have data
    let existingSlugs = new Set<string>();
    if (resumeMode) {
        console.log("🔄 Resume mode: checking for existing data...");
        const existingDeps = await prisma.projectDependency.findMany({
            select: { companySlug: true },
        });
        existingSlugs = new Set(existingDeps.map((d) => d.companySlug));
        console.log(`   Found ${existingSlugs.size} projects with existing data.\n`);
    }

    const projectsToFetch = resumeMode
        ? COMPANY_CONFIGS.filter((c) => !existingSlugs.has(c.slug))
        : COMPANY_CONFIGS;

    if (projectsToFetch.length === 0) {
        console.log("✅ All projects already have data. Nothing to fetch.\n");
        return;
    }

    console.log(`🔍 Fetching dependencies for ${projectsToFetch.length} projects...`);
    if (resumeMode) {
        console.log(`   (Skipping ${existingSlugs.size} projects with existing data)`);
    }
    console.log(`   Will auto-wait when rate limited and resume after reset.\n`);

    const projectDependencies: ProjectDependencies[] = [];
    let processed = 0;
    let successful = 0;

    for (const config of projectsToFetch) {
        processed++;
        console.log(`[${processed}/${projectsToFetch.length}] ${config.name} (${config.github.org})...`);

        // Log rate limit every 10 projects
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

            // In resume mode, save each project immediately to database
            if (resumeMode) {
                await prisma.projectDependency.upsert({
                    where: { companySlug: deps.slug },
                    update: {
                        githubOrg: deps.githubOrg,
                        repos: deps.repos,
                        allDependencies: deps.allDependencies,
                        lastFetchedAt: new Date(),
                    },
                    create: {
                        companySlug: deps.slug,
                        githubOrg: deps.githubOrg,
                        repos: deps.repos,
                        allDependencies: deps.allDependencies,
                    },
                });
            }
        }

        // Minimal delay between projects
        await new Promise((resolve) => setTimeout(resolve, MIN_DELAY));
    }

    console.log(`\n📊 Fetched ${successful}/${projectsToFetch.length} projects successfully\n`);

    // Save to JSON for reference
    const outputPath = "./data/project-dependencies.json";
    const dataDir = path.dirname(outputPath);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    const edges = buildRelationships(projectDependencies);
    fs.writeFileSync(outputPath, JSON.stringify({ projects: projectDependencies, edges }, null, 2));
    console.log(`💾 Saved to ${outputPath}\n`);

    // Seed database
    await seedDatabase(projectDependencies, edges);
}

async function seedFromJSON(): Promise<void> {
    const jsonPath = "./data/project-dependencies.json";

    if (!fs.existsSync(jsonPath)) {
        console.error(`❌ ${jsonPath} not found. Run with --fetch flag first.`);
        process.exit(1);
    }

    console.log(`📂 Loading from ${jsonPath}...\n`);

    const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    const projects: ProjectDependencies[] = data.projects || [];
    const edges: DependencyEdge[] = data.edges || buildRelationships(projects);

    await seedDatabase(projects, edges);
}

async function seedDatabase(projects: ProjectDependencies[], edges: DependencyEdge[]): Promise<void> {
    console.log("🗄️  Seeding database...\n");

    // Clear existing data
    await prisma.projectRelationship.deleteMany({});
    await prisma.projectDependency.deleteMany({});
    console.log("   Cleared existing data");

    // Insert ProjectDependency records
    let depCount = 0;
    for (const project of projects) {
        if (project.repos.length > 0) {
            await prisma.projectDependency.upsert({
                where: { companySlug: project.slug },
                update: {
                    githubOrg: project.githubOrg,
                    repos: project.repos,
                    allDependencies: project.allDependencies,
                    lastFetchedAt: new Date(),
                },
                create: {
                    companySlug: project.slug,
                    githubOrg: project.githubOrg,
                    repos: project.repos,
                    allDependencies: project.allDependencies,
                },
            });
            depCount++;
        }
    }
    console.log(`   ✅ Inserted ${depCount} ProjectDependency records`);

    // Insert ProjectRelationship records
    let relCount = 0;
    for (const edge of edges) {
        try {
            await prisma.projectRelationship.upsert({
                where: {
                    sourceSlug_targetSlug_relationshipType: {
                        sourceSlug: edge.source,
                        targetSlug: edge.target,
                        relationshipType: edge.type,
                    },
                },
                update: {
                    weight: edge.weight,
                    evidence: edge.evidence,
                },
                create: {
                    sourceSlug: edge.source,
                    targetSlug: edge.target,
                    relationshipType: edge.type,
                    weight: edge.weight,
                    evidence: edge.evidence,
                },
            });
            relCount++;
        } catch (error) {
            // Skip if there's an issue (e.g., company doesn't exist)
        }
    }
    console.log(`   ✅ Inserted ${relCount} ProjectRelationship records`);

    // Print summary
    const sdkEdges = edges.filter((e) => e.type === "uses_sdk");
    const sharedEdges = edges.filter((e) => e.type === "shared_dependency");

    console.log("\n📈 Summary:");
    console.log(`   Projects with dependencies: ${depCount}`);
    console.log(`   SDK usage relationships: ${sdkEdges.length}`);
    console.log(`   Shared dependency relationships: ${sharedEdges.length}`);
    console.log(`   Total relationships: ${relCount}`);

    // Top connected projects
    const connectionCount: Record<string, number> = {};
    for (const edge of edges) {
        connectionCount[edge.source] = (connectionCount[edge.source] || 0) + edge.weight;
        connectionCount[edge.target] = (connectionCount[edge.target] || 0) + edge.weight;
    }

    const topProjects = Object.entries(connectionCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    console.log("\n🌟 Most Connected Projects:");
    for (const [slug, score] of topProjects) {
        console.log(`   ${slug}: ${score} points`);
    }
}

async function main(): Promise<void> {
    const args = process.argv.slice(2);
    const shouldFetch = args.includes("--fetch");
    const resumeMode = args.includes("--resume");

    try {
        if (shouldFetch || resumeMode) {
            await seedFromFetch(resumeMode);
        } else {
            await seedFromJSON();
        }

        console.log("\n✅ Done!");
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
