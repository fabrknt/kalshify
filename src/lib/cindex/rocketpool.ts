/**
 * Rocket Pool Index Data Fetcher
 */

import { getOrganizationMetrics } from "@/lib/api/github";
import { getEngagementMetrics } from "@/lib/api/twitter";
import { getOnChainMetrics } from "@/lib/api/ethereum";
import { calculateIndexScore } from "./calculators/score-calculator";
import { IndexData, IndexScore } from "@/lib/api/types";
import { Company } from "./companies";

const ROCKETPOOL_CONTRACT = "0xae78736Cd615f374D3085123A210448E74Fc6393";

export async function fetchRocketpoolData(): Promise<IndexData> {
    try {
        console.log("Fetching Rocket Pool index data...");
        const [github, twitter, onchain] = await Promise.all([
            getOrganizationMetrics("rocket-pool").catch(() => ({
                totalContributors: 0,
                activeContributors30d: 0,
                totalCommits30d: 0,
                avgCommitsPerDay: 0,
                topContributors: [],
                commitActivity: [],
            })),
            getEngagementMetrics("Rocket_Pool").catch((err) => {
                throw err;
            }),
            getOnChainMetrics(ROCKETPOOL_CONTRACT).catch(() => ({
                contractAddress: ROCKETPOOL_CONTRACT,
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
            companyName: "Rocket Pool",
            category: "defi",
            github,
            twitter,
            onchain: onchain as any,
            calculatedAt: new Date().toISOString(),
        };
    } catch (error) {
        console.error("Error fetching Rocket Pool data:", error);
        throw error;
    }
}

export async function calculateRocketpoolScore(
    data?: IndexData
): Promise<IndexScore> {
    const indexData = data || (await fetchRocketpoolData());
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
        slug: "rocketpool",
        name: "Rocket Pool",
        category: "defi",
        description: "Decentralized Ethereum staking protocol",
        logo: "🚀",
        website: "https://rocketpool.net",
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
            walletGrowth: 15,
            userGrowthRate: 15,
            tvl: undefined,
            volume30d: 0,
        },
        overallScore: score.overall,
        trend: "up" as const,
        isListed: false,
    };
}

export async function getRocketpoolCompanyData(
    data?: IndexData,
    score?: IndexScore
): Promise<Company> {
    const indexData = data || (await fetchRocketpoolData());
    const indexScore =
        score || (await calculateRocketpoolScore(indexData));
    return convertToCompany(indexData, indexScore);
}
