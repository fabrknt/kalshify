/**
 * Generic Company Data Fetcher
 * Unified functions that work for any company based on configuration
 */

import {
    getOrganizationMetrics,
    getUniswapMetrics as getUniswapGitHubMetrics,
    getFabrkntMetrics,
} from "@/lib/api/github";
import { getEngagementMetrics } from "@/lib/api/twitter";
import {
    getOnChainMetrics as getEthereumMetrics,
    getUniswapMetrics as getUniswapOnChainMetrics,
} from "@/lib/api/ethereum";
import {
    getOnChainMetrics as getSolanaMetrics,
    getJupiterMetrics,
} from "@/lib/api/solana";
import { calculateIndexScore } from "./calculators/score-calculator";
import { IndexData, IndexScore } from "@/lib/api/types";
import { Company } from "./companies";
import { CompanyConfig } from "./company-configs";
import { CrawlerService } from "./crawler";
import { fetchWithTimeoutAndRetry } from "./utils/fetch-with-retry";
import { TimeoutError } from "./utils/timeout";

// Configuration for fetch timeouts and retries
// Very long timeouts to handle slow APIs - script runs manually so we can afford to wait
// Better to wait longer and get real data than to fail fast with zeros
const FETCH_CONFIG = {
    github: { timeoutMs: 600000, maxRetries: 3 }, // 10min timeout, 3 retries
    twitter: { timeoutMs: 1200000, maxRetries: 3 }, // 20min timeout, 3 retries (rate limits and slow responses)
    onchain: { timeoutMs: 1200000, maxRetries: 3 }, // 20min timeout, 3 retries (RPC calls can be very slow)
};

/**
 * Generic fetch function that works for any company
 */
export async function fetchCompanyData(
    config: CompanyConfig
): Promise<IndexData> {
    try {
        console.log(`Fetching ${config.name} index data...`);

        // Create fetch functions with timeout and retry
        const fetchGitHub = () => {
            if (config.github.customMetricsFunction === "getUniswapMetrics") {
                return getUniswapGitHubMetrics();
            } else if (
                config.github.customMetricsFunction === "getFabrkntMetrics"
            ) {
                return getFabrkntMetrics();
            } else {
                return getOrganizationMetrics(config.github.org);
            }
        };

        const fetchTwitter = () => getEngagementMetrics(config.twitter.handle);

        const fetchOnchain = () => {
            if (config.features?.useCrawler) {
                // Fabrknt special case: no real on-chain metrics
                return Promise.resolve({
                    contractAddress: config.onchain.address,
                    chain: config.onchain.chain,
                    transactionCount24h: 0,
                    transactionCount7d: 0,
                    transactionCount30d: 0,
                    uniqueWallets24h: 0,
                    uniqueWallets7d: 0,
                    uniqueWallets30d: 0,
                });
            } else if (
                config.onchain.customMetricsFunction === "getUniswapMetrics"
            ) {
                return getUniswapOnChainMetrics();
            } else if (
                config.onchain.customMetricsFunction === "getJupiterMetrics"
            ) {
                return getJupiterMetrics();
            } else if (config.onchain.chain === "solana") {
                return getSolanaMetrics(config.onchain.address);
            } else {
                // Ethereum and other EVM chains
                return getEthereumMetrics(config.onchain.address);
            }
        };

        // Execute all fetches in parallel with timeout and retry, using Promise.allSettled
        // to handle partial failures gracefully
        console.log("Starting parallel fetch for all data sources...");
        console.log(
            `⏱️  Timeouts: GitHub ${FETCH_CONFIG.github.timeoutMs / 1000}s, Twitter ${FETCH_CONFIG.twitter.timeoutMs / 1000}s, On-chain ${FETCH_CONFIG.onchain.timeoutMs / 1000}s`
        );

        const [githubResult, twitterResult, onchainResult] =
            await Promise.allSettled([
                fetchWithTimeoutAndRetry(fetchGitHub, {
                    ...FETCH_CONFIG.github,
                    sourceName: `GitHub (${config.name})`,
                }).catch((err) => {
                    // Return default values only after all retries exhausted
                    console.error(
                        `\n❌ GitHub fetch failed for ${config.name} after ${FETCH_CONFIG.github.maxRetries} retries:`
                    );
                    console.error(
                        `   ${
                            err instanceof TimeoutError
                                ? `Timeout after ${FETCH_CONFIG.github.timeoutMs / 1000}s`
                                : err.message
                        }`
                    );
                    console.error(
                        `   Using default values (zeros) for GitHub metrics`
                    );
                    return {
                        totalContributors: 0,
                        activeContributors30d: 0,
                        totalCommits30d: 0,
                        avgCommitsPerDay: 0,
                        topContributors: [],
                        commitActivity: [],
                    };
                }),
                fetchWithTimeoutAndRetry(fetchTwitter, {
                    ...FETCH_CONFIG.twitter,
                    sourceName: `Twitter (${config.name})`,
                }).catch((err) => {
                    console.error(
                        `\n❌ Twitter fetch failed for ${config.name} after ${FETCH_CONFIG.twitter.maxRetries} retries:`
                    );
                    console.error(
                        `   ${
                            err instanceof TimeoutError
                                ? `Timeout after ${FETCH_CONFIG.twitter.timeoutMs / 1000}s`
                                : err.message
                        }`
                    );
                    console.error(
                        `   Using default values (zeros) for Twitter metrics`
                    );
                    return {
                        followers: 0,
                        following: 0,
                        tweetCount: 0,
                        verified: false,
                        createdAt: new Date().toISOString(),
                    };
                }),
                fetchWithTimeoutAndRetry(fetchOnchain, {
                    ...FETCH_CONFIG.onchain,
                    sourceName: `${config.onchain.chain} On-chain (${config.name})`,
                }).catch((err) => {
                    console.error(
                        `\n❌ ${config.onchain.chain} on-chain fetch failed for ${config.name} after ${FETCH_CONFIG.onchain.maxRetries} retries:`
                    );
                    console.error(
                        `   ${
                            err instanceof TimeoutError
                                ? `Timeout after ${FETCH_CONFIG.onchain.timeoutMs / 1000}s`
                                : err.message
                        }`
                    );
                    console.error(
                        `   Using default values (zeros) for on-chain metrics`
                    );
                    return {
                        contractAddress: config.onchain.address,
                        chain: config.onchain.chain,
                        transactionCount24h: 0,
                        transactionCount7d: 0,
                        transactionCount30d: 0,
                        uniqueWallets24h: 0,
                        uniqueWallets7d: 0,
                        uniqueWallets30d: 0,
                    };
                }),
            ]);

        // Extract values from settled promises
        const github =
            githubResult.status === "fulfilled"
                ? githubResult.value
                : {
                      totalContributors: 0,
                      activeContributors30d: 0,
                      totalCommits30d: 0,
                      avgCommitsPerDay: 0,
                      topContributors: [],
                      commitActivity: [],
                  };

        const twitter =
            twitterResult.status === "fulfilled"
                ? twitterResult.value
                : {
                      followers: 0,
                      following: 0,
                      tweetCount: 0,
                      verified: false,
                      createdAt: new Date().toISOString(),
                  };

        const onchain =
            onchainResult.status === "fulfilled"
                ? onchainResult.value
                : {
                      contractAddress: config.onchain.address,
                      chain: config.onchain.chain,
                      transactionCount24h: 0,
                      transactionCount7d: 0,
                      transactionCount30d: 0,
                      uniqueWallets24h: 0,
                      uniqueWallets7d: 0,
                      uniqueWallets30d: 0,
                  };

        // Log detailed success/failure status
        console.log("\n📊 Fetch Results Summary:");
        if (githubResult.status === "fulfilled") {
            console.log(
                `   ✅ GitHub: ${github.totalContributors} contributors, ${github.totalCommits30d} commits (30d)`
            );
        } else {
            console.log(
                `   ❌ GitHub: Failed - ${githubResult.reason instanceof TimeoutError ? "Timeout" : githubResult.reason?.message || "Unknown error"}`
            );
        }

        if (twitterResult.status === "fulfilled") {
            const engagement = (twitter as any).engagement30d;
            console.log(
                `   ✅ Twitter: ${twitter.followers.toLocaleString()} followers${engagement ? `, ${engagement.likes} likes (30d)` : ""}`
            );
        } else {
            console.log(
                `   ❌ Twitter: Failed - ${twitterResult.reason instanceof TimeoutError ? "Timeout" : twitterResult.reason?.message || "Unknown error"}`
            );
        }

        if (onchainResult.status === "fulfilled") {
            console.log(
                `   ✅ On-chain (${config.onchain.chain}): ${onchain.transactionCount30d?.toLocaleString() || 0} txs, ${onchain.uniqueWallets30d?.toLocaleString() || 0} wallets (30d)`
            );
        } else {
            console.log(
                `   ❌ On-chain (${config.onchain.chain}): Failed - ${onchainResult.reason instanceof TimeoutError ? "Timeout" : onchainResult.reason?.message || "Unknown error"}`
            );
        }

        // Warn if any data source returned zeros
        const hasZeroGithub =
            github.totalContributors === 0 && github.totalCommits30d === 0;
        const hasZeroTwitter = twitter.followers === 0;
        const hasZeroOnchain =
            onchain.transactionCount30d === 0 && onchain.uniqueWallets30d === 0;

        if (hasZeroGithub || hasZeroTwitter || hasZeroOnchain) {
            console.log("\n⚠️  Warning: Some data sources returned zero values:");
            if (hasZeroGithub) console.log("   - GitHub metrics are zero");
            if (hasZeroTwitter) console.log("   - Twitter metrics are zero");
            if (hasZeroOnchain) console.log("   - On-chain metrics are zero");
            console.log(
                "   This may indicate API failures, rate limits, or missing data."
            );
        }

        // Add derived fields to onchain data
        (onchain as any).monthlyActiveUsers = onchain.uniqueWallets30d || 0;
        (onchain as any).dailyActiveUsers = onchain.uniqueWallets24h || 0;
        (onchain as any).weeklyActiveUsers = onchain.uniqueWallets7d || 0;

        // Handle special crawler case (Fabrknt)
        let news: any[] = [];
        if (config.features?.useCrawler && config.blogUrl) {
            const crawler = new CrawlerService();
            news = await crawler
                .crawlCompanyNews(config.blogUrl, `${config.name} Web`)
                .catch(() => []);
        }

        return {
            companyName: config.name,
            category: config.category,
            github,
            twitter,
            onchain: onchain as any,
            news: news.length > 0 ? news : undefined,
            calculatedAt: new Date().toISOString(),
        };
    } catch (error) {
        console.error(`Error fetching ${config.name} data:`, error);
        throw error;
    }
}

/**
 * Generic score calculation
 */
export async function calculateCompanyScore(
    config: CompanyConfig,
    data?: IndexData
): Promise<IndexScore> {
    const indexData = data || (await fetchCompanyData(config));
    return calculateIndexScore(
        indexData.github,
        indexData.twitter,
        indexData.onchain,
        indexData.category
    );
}

/**
 * Generic conversion to Company interface
 */
export function convertToCompany(
    config: CompanyConfig,
    data: IndexData,
    score: IndexScore
): Company {
    // Special logic for Fabrknt
    const isPrivateDev =
        config.features?.useCrawler && data.github.totalCommits30d < 5;
    const hasWebActivity =
        (score.breakdown.onchain as any).webActivityScore > 40;

    return {
        slug: config.slug,
        name: config.name,
        category: config.category,
        description: config.description,
        logo: config.logo,
        website: config.website,

        teamHealth: {
            score: score.teamHealth,
            githubCommits30d: data.github.totalCommits30d,
            activeContributors: data.github.activeContributors30d,
            contributorRetention: Math.round(
                (data.github.activeContributors30d /
                    Math.max(data.github.totalContributors, 1)) *
                    100
            ),
            codeQuality: config.defaults?.codeQuality ?? 85,
        },

        growth: {
            score: score.growthScore,
            onChainActivity30d: data.onchain.transactionCount30d || 0,
            walletGrowth: config.defaults?.walletGrowth ?? 0,
            userGrowthRate: config.defaults?.userGrowthRate ?? 0,
            tvl: config.features?.hasTVL
                ? (data.onchain as any).tvl ?? config.defaults?.tvl
                : undefined,
            volume30d: config.features?.hasVolume
                ? (data.onchain as any).volume30d
                : undefined,
        },

        social: {
            score: score.socialScore,
            twitterFollowers: data.twitter?.followers,
            discordMembers: undefined,
            telegramMembers: undefined,
            communityEngagement: data.twitter?.engagement30d
                ? data.twitter.engagement30d.likes +
                  data.twitter.engagement30d.retweets +
                  data.twitter.engagement30d.replies
                : score.socialScore,
        },

        overallScore: score.overall,
        trend:
            isPrivateDev && hasWebActivity
                ? "up"
                : config.defaults?.trend ?? "stable",
        isListed: false,
        news: data.news,
    };
}

/**
 * Generic get company data function
 */
export async function getCompanyData(
    config: CompanyConfig,
    data?: IndexData,
    score?: IndexScore
): Promise<Company> {
    const indexData = data || (await fetchCompanyData(config));
    const indexScore =
        score || (await calculateCompanyScore(config, indexData));
    return convertToCompany(config, indexData, indexScore);
}
