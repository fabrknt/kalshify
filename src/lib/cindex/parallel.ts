/**
 * Parallel Index Data Fetcher
 */

import { getOrganizationMetrics } from "@/lib/api/github";
import { getEngagementMetrics } from "@/lib/api/twitter";
import { getOnChainMetrics } from "@/lib/api/ethereum";
import { calculateIndexScore } from "./calculators/score-calculator";
import { IndexData, IndexScore } from "@/lib/api/types";
import { Company } from "./companies";

const PARALLEL_CONTRACT = "0x76BE3b62873462d2142405439777e971754E8E77"; // Parallel NFT contract

export async function fetchParallelData(): Promise<IndexData> {
    try {
        console.log("Fetching Parallel index data...");
        const [github, twitter, onchain] = await Promise.all([
            getOrganizationMetrics("ParallelNFT").catch(() => ({
                totalContributors: 0,
                activeContributors30d: 0,
                totalCommits30d: 0,
                avgCommitsPerDay: 0,
                topContributors: [],
                commitActivity: [],
            })),
            getEngagementMetrics("ParallelTCG").catch((err) => {
                throw err;
            }),
            getOnChainMetrics(PARALLEL_CONTRACT).catch(() => ({
                contractAddress: PARALLEL_CONTRACT,
                chain: "ethereum",
                transactionCount24h: 0,
                transactionCount7d: 0,
                transactionCount30d: 0,
                uniqueWallets24h: 0,
                uniqueWallets7d: 0,
                uniqueWallets30d: 0,
            })),
        ]);
        (onchain as any).monthlyActiveUsers = onchain.uniqueWallets30d || 0;
        (onchain as any).dailyActiveUsers = onchain.uniqueWallets24h || 0;
        (onchain as any).weeklyActiveUsers = onchain.uniqueWallets7d || 0;
        return {
            companyName: "Parallel",
            category: "gaming",
            github,
            twitter,
            onchain: onchain as any,
            calculatedAt: new Date().toISOString(),
        };
    } catch (error) {
        console.error("Error fetching Parallel data:", error);
        throw error;
    }
}

export async function calculateParallelScore(
    data?: IndexData
): Promise<IndexScore> {
    const indexData = data || (await fetchParallelData());
    return calculateIndexScore(
        indexData.github,
        indexData.twitter,
        indexData.onchain, indexData.category
    );
}

export function convertToCompany(
    data: IndexData,
    score: IndexScore
): Company {
    return {
        slug: "parallel",
        name: "Parallel",
        category: "gaming",
        description: "Sci-fi card game on Ethereum",
        logo: "🎮",
        website: "https://parallel.life",
        teamHealth: {
            score: score.teamHealth,
            githubCommits30d: data.github.totalCommits30d,
            activeContributors: data.github.activeContributors30d,
            contributorRetention: Math.round(
                (data.github.activeContributors30d /
                    Math.max(data.github.totalContributors, 1)) *
                    100
            ),
            codeQuality: 90,
        },
        growth: {
            score: score.growthScore,
            onChainActivity30d: data.onchain.transactionCount30d || 0,
            walletGrowth: 20,
            userGrowthRate: 20,
            tvl: undefined,
            volume30d: 0,
        },
        overallScore: score.overall,
        trend: "up" as const,
        isListed: false,
    };
}

export async function getParallelCompanyData(
    data?: IndexData,
    score?: IndexScore
): Promise<Company> {
    const indexData = data || (await fetchParallelData());
    const indexScore =
        score || (await calculateParallelScore(indexData));
    return convertToCompany(indexData, indexScore);
}
