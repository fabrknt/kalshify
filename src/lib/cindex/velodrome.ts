/**
 * Velodrome Index Data Fetcher
 */

import { getOrganizationMetrics } from "@/lib/api/github";
import { getEngagementMetrics } from "@/lib/api/twitter";
import { getOnChainMetrics } from "@/lib/api/ethereum";
import { calculateIndexScore } from "./calculators/score-calculator";
import { IndexData, IndexScore } from "@/lib/api/types";
import { Company } from "./companies";

const VELODROME_CONTRACT = "0x9c12939390052919aF3155f41Bf4160Fd3666A6f";

export async function fetchVelodromeData(): Promise<IndexData> {
    try {
        console.log("Fetching Velodrome index data...");
        const [github, twitter, onchain] = await Promise.all([
            getOrganizationMetrics("velodrome-finance").catch(() => ({
                totalContributors: 0,
                activeContributors30d: 0,
                totalCommits30d: 0,
                avgCommitsPerDay: 0,
                topContributors: [],
                commitActivity: [],
            })),
            getEngagementMetrics("VelodromeFi").catch((err) => {
                throw err;
            }),
            getOnChainMetrics(VELODROME_CONTRACT).catch(() => ({
                contractAddress: VELODROME_CONTRACT,
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
            companyName: "Velodrome",
            category: "defi",
            github,
            twitter,
            onchain: onchain as any,
            calculatedAt: new Date().toISOString(),
        };
    } catch (error) {
        console.error("Error fetching Velodrome data:", error);
        throw error;
    }
}

export async function calculateVelodromeScore(
    data?: IndexData
): Promise<IndexScore> {
    const indexData = data || (await fetchVelodromeData());
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
        slug: "velodrome",
        name: "Velodrome",
        category: "defi",
        description: "AMM and ve(3,3) model on Optimism",
        logo: "🏁",
        website: "https://velodrome.finance",
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

export async function getVelodromeCompanyData(
    data?: IndexData,
    score?: IndexScore
): Promise<Company> {
    const indexData = data || (await fetchVelodromeData());
    const indexScore =
        score || (await calculateVelodromeScore(indexData));
    return convertToCompany(indexData, indexScore);
}
