/**
 * Drift Protocol Index Data Fetcher
 */

import { getOrganizationMetrics } from "@/lib/api/github";
import { getEngagementMetrics } from "@/lib/api/twitter";
import { getOnChainMetrics } from "@/lib/api/solana";
import { calculateIndexScore } from "./calculators/score-calculator";
import { IndexData, IndexScore } from "@/lib/api/types";
import { Company } from "./companies";

const DRIFT_PROGRAM_ID = "dRiftyHA39bWEY4nXUvNnprgNa8gvhcteAdT";

export async function fetchDriftData(): Promise<IndexData> {
    try {
        console.log("Fetching Drift index data...");
        const [github, twitter, onchain] = await Promise.all([
            getOrganizationMetrics("drift-labs").catch(() => ({
                totalContributors: 0,
                activeContributors30d: 0,
                totalCommits30d: 0,
                avgCommitsPerDay: 0,
                topContributors: [],
                commitActivity: [],
            })),
            getEngagementMetrics("DriftProtocol").catch((err) => {
                console.error("Twitter fetch error (Drift):", err);
                return {
                    followers: 0,
                    following: 0,
                    tweetCount: 0,
                    verified: false,
                    createdAt: new Date().toISOString(),
                };
            }),
            getOnChainMetrics(DRIFT_PROGRAM_ID).catch(() => ({
                contractAddress: DRIFT_PROGRAM_ID,
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
            companyName: "Drift",
            category: "defi",
            github,
            twitter,
            onchain: onchain as any,
            calculatedAt: new Date().toISOString(),
        };
    } catch (error) {
        console.error("Error fetching Drift data:", error);
        throw error;
    }
}

export async function calculateDriftScore(
    data?: IndexData
): Promise<IndexScore> {
    const indexData = data || (await fetchDriftData());
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
        slug: "drift",
        name: "Drift Protocol",
        category: "defi",
        description: "Decentralized perpetuals and spot trading on Solana",
        logo: "🌊",
        website: "https://www.drift.trade",
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

export async function getDriftCompanyData(
    data?: IndexData,
    score?: IndexScore
): Promise<Company> {
    const indexData = data || (await fetchDriftData());
    const indexScore =
        score || (await calculateDriftScore(indexData));
    return convertToCompany(indexData, indexScore);
}
