/**
 * Jupiter Index Data Fetcher
 * Combines all data sources to create comprehensive Jupiter index
 */

import { getOrganizationMetrics } from "@/lib/api/github";
import { getEngagementMetrics } from "@/lib/api/twitter";
import { getJupiterMetrics } from "@/lib/api/solana";
import { calculateIndexScore } from "./calculators/score-calculator";
import { IndexData, IndexScore } from "@/lib/api/types";
import { Company } from "./companies";

/**
 * Fetch all Jupiter data from various sources
 */
export async function fetchJupiterData(): Promise<IndexData> {
    try {
        console.log("Fetching Jupiter index data...");

        // Fetch from all sources in parallel
        const [github, twitter, onchain] = await Promise.all([
            getOrganizationMetrics("jup-ag").catch((err) => {
                console.error("GitHub fetch error:", err);
                // Return partial data if GitHub fails
                return {
                    totalContributors: 0,
                    activeContributors30d: 0,
                    totalCommits30d: 0,
                    avgCommitsPerDay: 0,
                    topContributors: [],
                    commitActivity: [],
                };
            }),
            getEngagementMetrics("JupiterExchange").catch((err) => {
                console.error("Twitter fetch error (Jupiter):", err);
                return {
                    followers: 0,
                    following: 0,
                    tweetCount: 0,
                    verified: false,
                    createdAt: new Date().toISOString(),
                };
            }),
            getJupiterMetrics().catch((err) => {
                console.error("Solana RPC fetch error:", err);
                // Return partial data if Solana RPC fails
                return {
                    contractAddress:
                        "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
                    chain: "solana",
                    transactionCount24h: 0,
                    transactionCount7d: 0,
                    transactionCount30d: 0,
                    uniqueWallets24h: 0,
                    uniqueWallets7d: 0,
                    uniqueWallets30d: 0,
                };
            }),
        ]);

        // Use RPC-derived metrics (fully automated)
        // Set monthly active users from unique wallets
        (onchain as any).monthlyActiveUsers = onchain.uniqueWallets30d || 0;
        (onchain as any).dailyActiveUsers = onchain.uniqueWallets24h || 0;
        (onchain as any).weeklyActiveUsers = onchain.uniqueWallets7d || 0;

        const indexData: IndexData = {
            companyName: "Jupiter",
            category: "defi",
            github,
            twitter,
            onchain: onchain as any,
            calculatedAt: new Date().toISOString(),
        };

        console.log("Jupiter data fetched successfully");
        return indexData;
    } catch (error) {
        console.error("Error fetching Jupiter data:", error);
        throw error;
    }
}

/**
 * Calculate Jupiter Index Score
 * @param data - Optional pre-fetched data to avoid redundant API calls
 */
export async function calculateJupiterScore(
    data?: IndexData
): Promise<IndexScore> {
    const indexData = data || (await fetchJupiterData());

    return calculateIndexScore(
        indexData.github,
        indexData.twitter,
        indexData.onchain, indexData.category
    );
}

/**
 * Convert IndexData to Company format
 */
export function convertToCompany(
    data: IndexData,
    score: IndexScore
): Company {
    return {
        slug: "jupiter",
        name: "Jupiter",
        category: "defi",
        description:
            "Leading DEX aggregator on Solana providing best swap rates across all DEXs",
        logo: "🪐",
        website: "https://jup.ag",
        // Team Health (from GitHub)
        teamHealth: {
            score: score.teamHealth,
            githubCommits30d: data.github.totalCommits30d,
            activeContributors: data.github.activeContributors30d,
            contributorRetention: Math.round(
                (data.github.activeContributors30d /
                    Math.max(data.github.totalContributors, 1)) *
                100
            ),
            codeQuality: 90, // Placeholder
        },

        // Growth Metrics (from Solana RPC)
        growth: {
            score: score.growthScore,
            onChainActivity30d: data.onchain.transactionCount30d || 0,
            walletGrowth: 20, // Placeholder
            userGrowthRate: 20, // Placeholder
            tvl: 0, // Jupiter is an aggregator, doesn't have TVL
            volume30d: 0, // Volume not available from RPC alone
        },

        // Overall index
        overallScore: score.overall,
        trend: "up" as const,
        isListed: false,
    };
}

/**
 * Get complete Jupiter company data with real index
 * @param data - Optional pre-fetched data to avoid redundant API calls
 * @param score - Optional pre-calculated score to avoid redundant API calls
 */
export async function getJupiterCompanyData(
    data?: IndexData,
    score?: IndexScore
): Promise<Company> {
    // Fetch data if not provided
    const indexData = data || (await fetchJupiterData());

    // Calculate score if not provided (reuse data to avoid redundant fetch)
    const indexScore =
        score || (await calculateJupiterScore(indexData));

    return convertToCompany(indexData, indexScore);
}
