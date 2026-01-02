/**
 * Uniswap Index Data Fetcher
 * Combines all data sources to create comprehensive Uniswap index
 */

import { getUniswapMetrics as getGitHubMetrics } from "@/lib/api/github";
import { getUniswapMetrics as getTwitterMetrics } from "@/lib/api/twitter";
import { getUniswapMetrics as getEthereumMetrics } from "@/lib/api/ethereum";
import { calculateIndexScore } from "./calculators/score-calculator";
import { IndexData, IndexScore } from "@/lib/api/types";
import { Company } from "./companies";

/**
 * Fetch all Uniswap data from various sources
 */
export async function fetchUniswapData(): Promise<IndexData> {
    try {
        console.log("Fetching Uniswap index data...");

        // Fetch from all sources in parallel
        const [github, twitter, onchain] = await Promise.all([
            getGitHubMetrics().catch((err) => {
                console.error("GitHub fetch error:", err);
                // Return default values if GitHub fails (non-fatal)
                return {
                    totalContributors: 0,
                    activeContributors30d: 0,
                    totalCommits30d: 0,
                    avgCommitsPerDay: 0,
                    topContributors: [],
                    commitActivity: [],
                };
            }),
            getTwitterMetrics().catch((err) => {
                console.error("Twitter fetch error (Uniswap):", err);
                return {
                    followers: 0,
                    following: 0,
                    tweetCount: 0,
                    verified: false,
                    createdAt: new Date().toISOString(),
                };
            }),
            getEthereumMetrics().catch((err) => {
                console.error("Ethereum RPC fetch error:", err);
                // Return partial data if Ethereum RPC fails
                return {
                    contractAddress:
                        "0x1F98431c8aD98523631AE4a59f267346ea31F984",
                    chain: "ethereum",
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
            companyName: "Uniswap",
            category: "defi",
            github,
            twitter,
            onchain: onchain as any,
            calculatedAt: new Date().toISOString(),
        };

        console.log("Uniswap data fetched successfully");
        return indexData;
    } catch (error) {
        console.error("Error fetching Uniswap data:", error);
        throw error;
    }
}

/**
 * Calculate Uniswap Index Score
 * @param data - Optional pre-fetched data to avoid redundant API calls
 */
export async function calculateUniswapScore(
    data?: IndexData
): Promise<IndexScore> {
    const indexData = data || (await fetchUniswapData());

    return calculateIndexScore(
        indexData.github,
        indexData.twitter,
        indexData.onchain,
        indexData.category,
        indexData.news
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
        slug: "uniswap",
        name: "Uniswap",
        category: "defi",
        description:
            "Leading decentralized exchange protocol enabling permissionless token swaps on Ethereum and Layer 2s",
        logo: "🦄",
        website: "https://uniswap.org",

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
            codeQuality: 90, // Would need code analysis
        },

        // Growth Metrics (from Ethereum RPC)
        growth: {
            score: score.growthScore,
            onChainActivity30d: data.onchain.transactionCount30d || 0,
            walletGrowth: 15, // Calculate from historical data
            userGrowthRate: 15, // Calculate from historical data
            tvl: 5000000000, // $5B - from DeFi Llama or similar
            volume30d: 0, // Volume not available from RPC alone
        },

        // Overall index
        overallScore: score.overall,
        trend: "up" as const,
        isListed: false,
    };
}

/**
 * Get complete Uniswap company data with real index
 * @param data - Optional pre-fetched data to avoid redundant API calls
 * @param score - Optional pre-calculated score to avoid redundant API calls
 */
export async function getUniswapCompanyData(
    data?: IndexData,
    score?: IndexScore
): Promise<Company> {
    // Fetch data if not provided
    const indexData = data || (await fetchUniswapData());

    // Calculate score if not provided (reuse data to avoid redundant fetch)
    const indexScore =
        score || (await calculateUniswapScore(indexData));

    return convertToCompany(indexData, indexScore);
}
