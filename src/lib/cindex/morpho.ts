/**
 * Morpho Index Data Fetcher
 * Combines all data sources to create comprehensive Morpho index
 */

import { getOrganizationMetrics } from "@/lib/api/github";
import { getEngagementMetrics } from "@/lib/api/twitter";
import { getOnChainMetrics } from "@/lib/api/ethereum";
import { calculateIndexScore } from "./calculators/score-calculator";
import { IndexData, IndexScore } from "@/lib/api/types";
import { Company } from "./companies";

const MORPHO_CONTRACT = "0x8888882f8f843896699869179fB6E4f7e3B58888"; // Morpho main contract

export async function fetchMorphoData(): Promise<IndexData> {
    try {
        console.log("Fetching Morpho index data...");

        const [github, twitter, onchain] = await Promise.all([
            getOrganizationMetrics("morpho-org").catch((err) => {
                console.error("GitHub fetch error:", err);
                return {
                    totalContributors: 0,
                    activeContributors30d: 0,
                    totalCommits30d: 0,
                    avgCommitsPerDay: 0,
                    topContributors: [],
                    commitActivity: [],
                };
            }),
            getEngagementMetrics("MorphoLabs").catch((err) => {
                console.error("Twitter fetch error (Morpho):", err);
                return {
                    followers: 0,
                    following: 0,
                    tweetCount: 0,
                    verified: false,
                    createdAt: new Date().toISOString(),
                };
            }),
            getOnChainMetrics(MORPHO_CONTRACT).catch((err) => {
                console.error("Ethereum RPC fetch error:", err);
                return {
                    contractAddress: MORPHO_CONTRACT,
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

        (onchain as any).monthlyActiveUsers = onchain.uniqueWallets30d || 0;
        (onchain as any).dailyActiveUsers = onchain.uniqueWallets24h || 0;
        (onchain as any).weeklyActiveUsers = onchain.uniqueWallets7d || 0;

        return {
            companyName: "Morpho",
            category: "defi",
            github,
            twitter,
            onchain: onchain as any,
            calculatedAt: new Date().toISOString(),
        };
    } catch (error) {
        console.error("Error fetching Morpho data:", error);
        throw error;
    }
}

export async function calculateMorphoScore(
    data?: IndexData
): Promise<IndexScore> {
    const indexData = data || (await fetchMorphoData());
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
        slug: "morpho",
        name: "Morpho",
        category: "defi",
        description:
            "Peer-to-peer lending protocol with optimized capital efficiency",
        logo: "🔷",
        website: "https://morpho.org",
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

export async function getMorphoCompanyData(
    data?: IndexData,
    score?: IndexScore
): Promise<Company> {
    const indexData = data || (await fetchMorphoData());
    const indexScore =
        score || (await calculateMorphoScore(indexData));
    return convertToCompany(indexData, indexScore);
}
