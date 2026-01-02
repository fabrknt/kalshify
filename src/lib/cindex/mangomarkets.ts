/**
 * Mango Markets Index Data Fetcher
 */

import { getOrganizationMetrics } from "@/lib/api/github";
import { getEngagementMetrics } from "@/lib/api/twitter";
import { getOnChainMetrics } from "@/lib/api/solana";
import { calculateIndexScore } from "./calculators/score-calculator";
import { IndexData, IndexScore } from "@/lib/api/types";
import { Company } from "./companies";

const MANGO_PROGRAM_ID = "4MangoMjqJ2firMokCjjGgoK8d4MXcrgL7XJaL3w6fVg"; // Mango Markets v4 program

export async function fetchMangomarketsData(): Promise<IndexData> {
    try {
        console.log("Fetching Mango Markets index data...");
        const [github, twitter, onchain] = await Promise.all([
            getOrganizationMetrics("blockworks-foundation").catch(() => ({
                totalContributors: 0,
                activeContributors30d: 0,
                totalCommits30d: 0,
                avgCommitsPerDay: 0,
                topContributors: [],
                commitActivity: [],
            })),
            getEngagementMetrics("mangomarkets").catch((err) => {
                throw err;
            }),
            getOnChainMetrics(MANGO_PROGRAM_ID).catch(() => ({
                contractAddress: MANGO_PROGRAM_ID,
                chain: "solana",
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
            companyName: "Mango Markets",
            category: "defi",
            github,
            twitter,
            onchain: onchain as any,
            calculatedAt: new Date().toISOString(),
        };
    } catch (error) {
        console.error("Error fetching Mango Markets data:", error);
        throw error;
    }
}

export async function calculateMangomarketsScore(
    data?: IndexData
): Promise<IndexScore> {
    const indexData = data || (await fetchMangomarketsData());
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
        slug: "mangomarkets",
        name: "Mango Markets",
        category: "defi",
        description: "Decentralized trading platform on Solana",
        logo: "🥭",
        website: "https://mango.markets",
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

export async function getMangomarketsCompanyData(
    data?: IndexData,
    score?: IndexScore
): Promise<Company> {
    const indexData = data || (await fetchMangomarketsData());
    const indexScore =
        score || (await calculateMangomarketsScore(indexData));
    return convertToCompany(indexData, indexScore);
}
