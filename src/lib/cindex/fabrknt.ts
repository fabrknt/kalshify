/**
 * Fabrknt Index Data Fetcher
 * Combines all data sources to create comprehensive Fabrknt index
 */

import { getFabrkntMetrics as getGitHubMetrics } from "@/lib/api/github";
import { getFabrkntMetrics as getTwitterMetrics } from "@/lib/api/twitter";
import { calculateIndexScore } from "./calculators/score-calculator";
import { IndexData, IndexScore } from "@/lib/api/types";
import { Company } from "./companies";
import { CrawlerService } from "./crawler";

/**
 * Fetch all Fabrknt data from various sources
 */
export async function fetchFabrkntData(): Promise<IndexData> {
    const crawler = new CrawlerService();
    const FABRKNT_URL = "https://www.fabrknt.com";

    try {
        console.log("Fetching Fabrknt index data...");

        // Fetch from all sources in parallel
        const [github, twitter, news] = await Promise.all([
            getGitHubMetrics().catch((err) => {
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
            getTwitterMetrics().catch((err) => {
                console.error("Twitter fetch error (Fabrknt):", err);
                return {
                    followers: 0,
                    following: 0,
                    tweetCount: 0,
                    verified: false,
                    createdAt: new Date().toISOString(),
                };
            }),
            crawler.crawlCompanyNews(FABRKNT_URL, "Fabrknt Web")
                .catch(err => {
                    console.error("Web crawl error:", err);
                    return [];
                })
        ]);

        // On-chain placeholder (no specific address provided yet)
        const onchain = {
            contractAddress: "0x0000000000000000000000000000000000000000",
            chain: "ethereum" as const,
            transactionCount24h: 0,
            transactionCount7d: 0,
            transactionCount30d: 0,
            uniqueWallets24h: 0,
            uniqueWallets7d: 0,
            uniqueWallets30d: 0,
            dailyActiveUsers: 0,
            monthlyActiveUsers: 0,
        };

        const indexData: IndexData = {
            companyName: "Fabrknt",
            category: "infrastructure",
            github,
            twitter,
            onchain: onchain as any,
            news,
            calculatedAt: new Date().toISOString(),
        };

        console.log("Fabrknt data fetched successfully");
        return indexData;
    } catch (error) {
        console.error("Error fetching Fabrknt data:", error);
        throw error;
    }
}

/**
 * Calculate Fabrknt Index Score
 */
export async function calculateFabrkntScore(
    data?: IndexData
): Promise<IndexScore> {
    const indexData = data || (await fetchFabrkntData());

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
    // If GitHub commits are very low (private), and we have a web score, shift the trend
    const isPrivateDev = data.github.totalCommits30d < 5;
    const hasWebActivity = (score.breakdown.onchain as any).webActivityScore > 40;

    return {
        slug: "fabrknt",
        name: "Fabrknt",
        category: "infrastructure",
        description: "The Foundational Foundry for Agentic Code & Future Economies",
        logo: "🏭",
        website: "https://www.fabrknt.com",

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
            codeQuality: isPrivateDev ? 90 : 85, // Stealth/Early stage gets a benefit of doubt on quality if they are shipping
        },

        // Growth Metrics
        growth: {
            score: score.growthScore,
            onChainActivity30d: data.onchain.transactionCount30d || 0,
            walletGrowth: 0,
            userGrowthRate: 0,
        },

        // Overall index
        overallScore: score.overall,
        trend: (isPrivateDev && hasWebActivity) ? "up" : "stable",
        isListed: false,
    };
}

/**
 * Get complete Fabrknt company data with real index
 */
export async function getFabrkntCompanyData(
    data?: IndexData,
    score?: IndexScore
): Promise<Company> {
    const indexData = data || (await fetchFabrkntData());
    const indexScore =
        score || (await calculateFabrkntScore(indexData));

    return convertToCompany(indexData, indexScore);
}
