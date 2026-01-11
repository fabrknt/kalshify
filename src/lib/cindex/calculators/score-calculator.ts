/**
 * Index Score Calculator
 * Combines GitHub, Twitter, and On-chain metrics into a single score
 * Fully automated - no manual setup required
 */

import {
    IndexData,
    IndexScore,
    GitHubTeamMetrics,
    TwitterMetrics,
    OnChainMetrics,
} from "@/lib/api/types";

/**
 * Normalize a value to 0-100 scale
 * @param value - The value to normalize
 * @param min - Minimum value (returns 0 if value < min)
 * @param max - Maximum value (returns 100 if value > max)
 * @returns Normalized value between 0-100
 */
function normalize(value: number, min: number, max: number): number {
    // Handle invalid inputs
    if (isNaN(value) || !isFinite(value)) return 0;
    if (isNaN(min) || isNaN(max) || !isFinite(min) || !isFinite(max)) return 0;

    // Handle edge case where min === max
    if (min === max) {
        return value === min ? 50 : value < min ? 0 : 100;
    }

    // Pure linear interpolation: min -> 0, max -> 100
    // This naturally handles cases where min > max (e.g., normalize(daysAgo, 14, 0))
    const normalized = ((value - min) / (max - min)) * 100;

    // Clamp between 0-100
    return Math.min(100, Math.max(0, normalized));
}

/**
 * Calculate GitHub Team Health Score (0-100)
 */
export function calculateGitHubScore(metrics: GitHubTeamMetrics): {
    score: number;
    breakdown: {
        contributorScore: number;
        activityScore: number;
        retentionScore: number;
    };
} {
    // Contributor score: log scale for total and active contributors
    // Adjusted for early-stage startups: 30 total and 10 active is excellent
    const logTotal = Math.log10(
        1 + Math.max(0, metrics.totalContributors || 0)
    );
    const logActive = Math.log10(
        1 + Math.max(0, metrics.activeContributors30d || 0)
    );

    const contributorScore =
        normalize(logTotal, 0, 1.48) * 0.6 + // 1.48 = ~30 contributors (startup-friendly)
        normalize(logActive, 0, 1.0) * 0.4; // 1.0 = ~10 contributors (realistic for startups)

    // Activity score: based on commits
    // Adjusted for startups: 150+ commits/30d (5/day) is excellent
    const activityScore = normalize(
        Math.max(0, metrics.totalCommits30d || 0),
        0,
        150
    );

    // Retention score: % of contributors active in last 30d
    // Softened for large projects: 20% retention is excellent, 10% is good
    // Cap retention at 100% to handle edge cases where active >= total
    let retentionRate = 0;
    if (metrics.totalContributors > 0) {
        const rate =
            (metrics.activeContributors30d / metrics.totalContributors) * 100;
        retentionRate = Math.min(100, Math.max(0, rate)); // Cap at 100%
    }
    const retentionScore = normalize(retentionRate, 0, 20);

    const overall =
        contributorScore * 0.4 + activityScore * 0.4 + retentionScore * 0.2;

    return {
        score: Math.round(overall),
        breakdown: {
            contributorScore: Math.round(contributorScore),
            activityScore: Math.round(activityScore),
            retentionScore: Math.round(retentionScore),
        },
    };
}

/**
 * Calculate Twitter Social Score (0-100)
 */
export function calculateTwitterScore(metrics: TwitterMetrics): {
    score: number;
    breakdown: {
        followersScore: number;
        engagementScore: number;
    };
} {
    // Followers score: log scale for followers
    // Adjusted for early-stage startups: 5K = decent, 100K = excellent, 500K+ = exceptional
    // Handle zero followers case
    let followersScore = 0;
    if (metrics.followers > 0) {
        const logFollowers = Math.log10(metrics.followers);
        followersScore = normalize(
            logFollowers,
            Math.log10(500), // 500 followers minimum (startup-friendly)
            Math.log10(500000) // 500K followers for max (more realistic than 1M+)
        );
    }

    // Engagement score: if we have engagement data
    let engagementScore = 0; // Default to 0 for missing data

    if (metrics.engagement30d) {
        const totalEngagement =
            (metrics.engagement30d.likes || 0) +
            (metrics.engagement30d.retweets || 0) +
            (metrics.engagement30d.replies || 0);

        // Normalize based on followers (engagement rate)
        // Realistic benchmark: 1.5% engagement is excellent for institutional accounts
        if (metrics.followers > 0 && totalEngagement > 0) {
            const engagementRate = (totalEngagement / metrics.followers) * 100;
            // Cap engagement rate at 100% to handle viral posts
            engagementScore = normalize(Math.min(100, engagementRate), 0, 1.5);
        }
    }

    const overall = followersScore * 0.7 + engagementScore * 0.3;

    return {
        score: Math.round(overall),
        breakdown: {
            followersScore: Math.round(followersScore),
            engagementScore: Math.round(engagementScore),
        },
    };
}

/**
 * Calculate On-chain Growth Score (0-100)
 * Uses RPC-derived metrics (fully automated)
 */
export function calculateOnChainScore(onchain: Partial<OnChainMetrics>): {
    score: number;
    breakdown: {
        userGrowthScore: number;
        transactionScore: number;
        tvlScore: number;
    };
} {
    // Only use TVL since it's the only metric we can fetch publicly
    let tvlScore = 0;
    if (onchain.tvl && onchain.tvl > 0) {
        // Handle log10(0) edge case
        const logTvl = Math.log10(onchain.tvl);
        if (isFinite(logTvl)) {
            tvlScore = normalize(
                logTvl,
                Math.log10(1000000),      // $1M = 0
                Math.log10(10000000000)   // $10B = 100
            );
        }
    }

    // On-chain score is just TVL score (since we can't fetch user/tx data publicly)
    const overall = tvlScore;

    return {
        score: Math.round(overall),
        breakdown: {
            userGrowthScore: 0, // Not available publicly
            transactionScore: 0, // Not available publicly
            tvlScore: Math.round(tvlScore),
        },
    };
}

/**
 * Calculate Partnership Score (Ecosystem Word-of-Mouth) - AI-Enhanced
 * Uses LLM to detect and rate partnership quality with context understanding
 */
export async function calculatePartnershipScore(
    news?: IndexData["news"],
    aiAnalyses?: Array<{
        isPartnership: boolean;
        quality: "tier1" | "tier2" | "tier3" | "none";
        partnerNames: string[];
        relationshipType: string;
        confidence: number;
        reasoning: string;
    }>
): Promise<number> {
    if (!news || news.length === 0) return 0;

    // If AI analyses provided, use them (preferred)
    if (aiAnalyses && aiAnalyses.length === news.length) {
        return calculateAIPartnershipScore(news, aiAnalyses);
    }

    // Otherwise fall back to regex-based detection
    return calculateRegexPartnershipScore(news);
}

/**
 * AI-powered partnership scoring with quality tiers
 */
function calculateAIPartnershipScore(
    news: IndexData["news"],
    analyses: Array<{
        isPartnership: boolean;
        quality: "tier1" | "tier2" | "tier3" | "none";
        partnerNames: string[];
        relationshipType: string;
        confidence: number;
        reasoning: string;
    }>
): number {
    if (!news || !Array.isArray(news) || news.length === 0) return 0;

    let score = 0;
    const now = new Date();

    // Quality tier weights
    const qualityWeights = {
        tier1: 50, // Major companies (Coinbase, a16z, etc.)
        tier2: 30, // Established protocols (Uniswap, Aave, etc.)
        tier3: 15, // Smaller partners
        none: 0,
    };

    news.forEach((item, index) => {
        // Ensure we have a corresponding analysis for this news item
        if (index >= analyses.length) return;

        const analysis = analyses[index];
        if (!analysis || !analysis.isPartnership) return;

        const date = new Date(item.date);
        if (isNaN(date.getTime())) return;

        const daysAgo = Math.max(
            0,
            (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Recent partnerships more valuable (30 day window)
        const freshness = normalize(daysAgo, 30, 0);

        // Quality-weighted score with confidence adjustment
        const baseScore = qualityWeights[analysis.quality];
        const confidenceMultiplier = analysis.confidence / 100;
        const freshnessMultiplier = freshness / 100 + 0.2; // Min 0.2 for older news

        score += baseScore * confidenceMultiplier * freshnessMultiplier;
    });

    return Math.min(100, Math.round(score));
}

/**
 * Fallback regex-based partnership scoring (when AI unavailable)
 */
function calculateRegexPartnershipScore(news: IndexData["news"]): number {
    if (!news || !Array.isArray(news) || news.length === 0) return 0;

    const partnershipKeywords = [
        /\bpartnership\b/i,
        /\bintegration\b/i,
        /\bintegrated\b/i,
        /\bcollaboration\b/i,
        /\bcollaborates?\b/i,
        /\bteam up\b/i,
        /\bjoins? forces\b/i,
        /\bannounces.*with\b/i,
        /\bpartners? with\b/i,
    ];

    let score = 0;
    const now = new Date();

    news.forEach((item) => {
        const title = item.title || "";
        const content = item.content || "";
        const combined = `${title} ${content}`;

        const date = new Date(item.date);
        if (isNaN(date.getTime())) return;

        const matchCount = partnershipKeywords.filter((k) =>
            k.test(combined)
        ).length;

        if (matchCount > 0) {
            const daysAgo = Math.max(
                0,
                (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
            );

            // Recent partnerships more valuable (30 day window)
            const freshness = normalize(daysAgo, 30, 0);
            // Base points + bonus for multiple partnership keywords
            score += (20 + matchCount * 10) * (freshness / 100 + 0.2);
        }
    });

    return Math.min(100, Math.round(score));
}

/**
 * Calculate News-based Growth Signals
 * Rewards shipping pace and high-impact announcements
 */
export function calculateIndexNewsScore(news?: IndexData["news"]): number {
    if (!news || !Array.isArray(news) || news.length === 0) return 0;

    // Use word boundaries for better keyword synergy (avoids false positives like "disintegrated")
    const keywords = [
        /\blaunch\b/i,
        /\bmainnet\b/i,
        /\bfunding\b/i,
        /\braised\b/i,
        /\bpartner\b/i,
        /\bintegrated\b/i,
        /\blisting\b/i,
        /\brelease\b/i,
        /\bscale\b/i,
        /\blive\b/i,
    ];
    let signalStrength = 0;
    const now = new Date();

    news.forEach((item) => {
        const title = item.title || "";
        const date = new Date(item.date);

        // Validate date
        if (isNaN(date.getTime())) return;

        const daysAgo = Math.max(
            0,
            (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Keyword Synergy with word boundaries
        const matchCount = keywords.filter((k) => k.test(title)).length;
        if (matchCount > 0) {
            // Freshness Multiplier: News within 14 days is high signal
            // Fresh (0 days ago) = 100 points, Old (14 days ago) = 0 points
            const freshness = normalize(daysAgo, 14, 0);
            signalStrength += (10 + matchCount * 5) * (freshness / 100 + 0.5);
        }
    });

    return Math.min(100, Math.round(signalStrength));
}

/**
 * Calculate Virality Score (Word-of-Mouth Indicator)
 * Measures how much content is being shared vs just liked
 */
export function calculateViralityScore(engagement30d: {
    likes: number;
    retweets: number;
    replies: number;
}): number {
    const { likes, retweets, replies } = engagement30d;

    if (likes === 0 && retweets === 0 && replies === 0) return 0;

    // Retweet ratio: measures sharing behavior (word-of-mouth)
    // Benchmark: 20% retweet rate is excellent for institutional accounts
    const retweetRatio = likes > 0 ? (retweets / likes) * 100 : 0;
    const retweetScore = normalize(retweetRatio, 0, 20);

    // Reply ratio: measures conversation depth and community engagement
    // Benchmark: 10% reply rate indicates strong engagement
    const replyRatio = likes > 0 ? (replies / likes) * 100 : 0;
    const replyScore = normalize(replyRatio, 0, 10);

    // Sharing (retweets) weighted higher as it indicates word-of-mouth spread
    return Math.round(retweetScore * 0.6 + replyScore * 0.4);
}

/**
 * Calculate Attention Velocity
 * Proxies for web impressions via social engagement rate
 * Falls back to follower count when engagement data is unavailable
 */
export function calculateAttentionScore(twitter: TwitterMetrics): number {
    // Calculate total engagement if data exists
    const totalEngagement = twitter.engagement30d
        ? (twitter.engagement30d.likes || 0) +
          (twitter.engagement30d.retweets || 0) +
          (twitter.engagement30d.replies || 0)
        : 0;

    // Primary: Use engagement velocity if we have engagement data
    if (totalEngagement > 0) {
        // If no followers but has engagement, use a small denominator to avoid division by zero
        const effectiveFollowers = Math.max(twitter.followers || 1, 1);

        // Engagement Velocity: High engagement relative to size indicates a "Visibility Spike"
        const velocity = (totalEngagement / effectiveFollowers) * 100;

        // Benchmark: 2% velocity is viral/high-attention for Web3
        // Cap at 100% to handle viral posts
        return normalize(Math.min(100, velocity), 0, 2);
    }

    // Fallback: If no engagement data but have followers, use followers as attention proxy
    // Large follower base = accumulated attention over time
    // Adjusted for Web3 companies: 1K to 200K followers
    // (50K+ is already significant for B2B infrastructure)
    if (twitter.followers && twitter.followers > 0) {
        return normalize(twitter.followers, 1000, 200000);
    }

    return 0;
}

/**
 * Calculate NPM Developer Adoption Score (0-100)
 * Measures real-world developer usage through package downloads
 */
export function calculateNpmScore(npmDownloads30d?: number): number {
    if (!npmDownloads30d || npmDownloads30d <= 0) return 0;

    // Logarithmic scale for downloads - infrastructure SDKs vary widely
    // Benchmarks (monthly downloads):
    // 1K = small but real usage (score ~25)
    // 10K = solid adoption (score ~50)
    // 50K = excellent adoption (score ~75)
    // 200K+ = market leader (score ~100)
    const logDownloads = Math.log10(npmDownloads30d);

    // normalize from log10(1000) to log10(200000)
    // 1K downloads = 3.0, 200K downloads = 5.3
    return normalize(logDownloads, Math.log10(1000), Math.log10(200000));
}

/**
 * Calculate Web Activity / Shipping Pace Score (0-100)
 */
export function calculateWebScore(news?: IndexData["news"]): number {
    if (!news || !Array.isArray(news) || news.length === 0) return 0;

    const now = new Date();
    const updateDates = news
        .map((item) => new Date(item.date))
        .filter((date) => !isNaN(date.getTime()))
        .sort((a, b) => b.getTime() - a.getTime());

    if (updateDates.length === 0) return 0;

    const latestUpdate = updateDates[0];
    const daysSinceLastUpdate = Math.max(
        0,
        (now.getTime() - latestUpdate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Recent (0 days ago) = 100 points, Old (30 days ago) = 0 points
    const recencyScore = normalize(daysSinceLastUpdate, 30, 0);

    // Frequency score: based on number of updates and average days between updates
    // More updates = higher score, more frequent updates = higher score
    const newsCountScore = normalize(news.length, 0, 5);

    // Calculate average days between updates
    let avgDaysBetween = 30; // Default to 30 if only one update
    if (updateDates.length > 1) {
        const oldestUpdate = updateDates[updateDates.length - 1];
        const totalDays = Math.max(
            1,
            (latestUpdate.getTime() - oldestUpdate.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        avgDaysBetween = totalDays / (updateDates.length - 1);
    }

    // Lower average days between updates = higher frequency score
    // Normalize with reversed order: 30 days = 0, 1 day = 100
    const frequencyScore = normalize(avgDaysBetween, 30, 1);

    const combinedFrequencyScore = newsCountScore * 0.5 + frequencyScore * 0.5;

    return Math.round(recencyScore * 0.6 + combinedFrequencyScore * 0.4);
}

/**
 * Calculate Overall Index Score
 * Fully automated - uses RPC-derived metrics and dynamic weight shifting
 * Now supports AI-enhanced partnership detection
 */
export async function calculateIndexScore(
    github: GitHubTeamMetrics,
    twitter: TwitterMetrics,
    onchain: Partial<OnChainMetrics>,
    category: "defi" | "defi-infra" = "defi-infra",
    news?: IndexData["news"],
    partnershipAnalyses?: Array<{
        isPartnership: boolean;
        quality: "tier1" | "tier2" | "tier3" | "none";
        partnerNames: string[];
        relationshipType: string;
        confidence: number;
        reasoning: string;
    }>,
    npmDownloads30d?: number
): Promise<IndexScore> {
    const githubScore = calculateGitHubScore(github);
    const twitterScore = calculateTwitterScore(twitter);
    const onchainScore = calculateOnChainScore(onchain);
    const webScore = calculateWebScore(news);
    const indexNewsScore = calculateIndexNewsScore(news);
    const partnershipScore = await calculatePartnershipScore(
        news,
        partnershipAnalyses
    );
    const npmScore = calculateNpmScore(npmDownloads30d);
    const attentionScore = calculateAttentionScore(twitter);
    const viralityScore = twitter.engagement30d
        ? calculateViralityScore(twitter.engagement30d)
        : 0;

    // Simplified Weights: Growth + Social only
    // GitHub is now part of Growth, not separate
    let weights = {
        growth: 0.90,
        social: 0.10,
    };

    const tvl = onchain.tvl || 0;

    if (category === "defi") {
        // DeFi projects: Growth (on-chain metrics) is dominant
        weights = { growth: 0.95, social: 0.05 };
    } else if (category === "defi-infra") {
        // DeFi Infrastructure: Growth (GitHub + npm) is dominant
        weights = { growth: 0.90, social: 0.10 };
    }

    // --- Signal Presence Detection & Weight Redistribution ---
    const hasTwitter = twitter.followers > 0 || (twitter.tweetCount || 0) > 0;

    // If a project has NO social signal, redistribute Social weight to Growth
    if (!hasTwitter) {
        weights.growth += weights.social;
        weights.social = 0;
    }

    // --- Signal Fusion: Revamped Growth Score with Word-of-Mouth ---
    // Adaptive weighting based on on-chain strength:
    // - Exceptional (>75 + TVL >$1B): Dominant on-chain weight (80%)
    // - Strong on-chain (>70): Prioritize real usage metrics (60%)
    // - Weak on-chain (<30): Prioritize web/social/partnership signals
    // - Medium: Balanced approach
    let combinedGrowthScore = 0;

    // Use tvl already defined above
    const isExceptional = onchainScore.score >= 75 && tvl >= 1_000_000_000;

    if (isExceptional) {
        // Exceptional protocols: Top-tier with $1B+ TVL and strong on-chain
        // These protocols have proven product-market fit through real usage
        // Massively prioritize actual usage metrics
        combinedGrowthScore =
            onchainScore.score * 0.90 +
            githubScore.score * 0.10;
    } else if (onchainScore.score >= 70) {
        // Strong on-chain: Established protocols with proven usage
        // Give much more weight to actual usage metrics
        combinedGrowthScore =
            onchainScore.score * 0.75 +
            githubScore.score * 0.25;
    } else if (tvl && tvl >= 1_000_000_000) {
        // $1B+ TVL but on-chain score <75 (missing some data)
        // For high-TVL DeFi, TVL is PRIMARY signal even with missing data
        // Reduce GitHub weight since most DeFi is private
        combinedGrowthScore =
            onchainScore.score * 0.85 +
            githubScore.score * 0.15;
    } else if (tvl && tvl >= 10_000_000) {
        // Significant TVL ($10M-$1B) but on-chain score <70
        // Balance on-chain with GitHub
        combinedGrowthScore =
            onchainScore.score * 0.60 +
            githubScore.score * 0.40;
    } else if ((onchain.transactionCount30d || 0) < 10 && !tvl) {
        // Extremely low on-chain: Infrastructure/SaaS/Stealth/Pre-launch
        // ONLY if no TVL data (prevents misclassifying DeFi with missing TX data)
        // For infrastructure companies, differentiate between base layer and SaaS

        if (npmScore > 0 && npmScore >= 30) {
            // SaaS/Service Infrastructure (Helius, Pimlico, Gelato)
            // High npm downloads = strong developer adoption
            // Lower GitHub weight - service quality matters more than commits
            combinedGrowthScore =
                npmScore * 0.80 +                       // Primary: Developer adoption (service usage)
                githubScore.score * 0.20;               // Secondary: Code development
        } else if (npmScore > 0) {
            // Infrastructure with modest npm adoption
            // Balanced approach
            combinedGrowthScore =
                npmScore * 0.55 +
                githubScore.score * 0.45;
        } else {
            // Base Layer Infrastructure (Anza, Espresso, Blockscout)
            // No npm packages or very low adoption
            // GitHub is the ONLY signal - core protocol development
            combinedGrowthScore = githubScore.score;
        }
    } else {
        // Medium on-chain: Balanced scoring
        // Growth = On-Chain + GitHub (NO Twitter, News, Partnerships)
        combinedGrowthScore =
            onchainScore.score * 0.50 +
            githubScore.score * 0.50;
    }

    // Ensure weights sum to 1.0 (normalize if needed due to floating point precision)
    const totalWeight = weights.growth + weights.social;
    if (totalWeight > 0 && Math.abs(totalWeight - 1.0) > 0.001) {
        weights.growth /= totalWeight;
        weights.social /= totalWeight;
    }

    let overall =
        combinedGrowthScore * weights.growth +
        twitterScore.score * weights.social;

    return {
        overall: Math.round(overall),
        teamHealth: Math.round(combinedGrowthScore), // For backwards compatibility with DB field
        growthScore: Math.round(combinedGrowthScore),
        walletQuality: 0,
        socialScore: twitterScore.score,
        breakdown: {
            github: githubScore.breakdown,
            onchain: {
                ...onchainScore.breakdown,
                webActivityScore: webScore,
                newsGrowthScore: indexNewsScore,
                partnershipScore,
                attentionScore,
                viralityScore,
            } as any,
            wallet: {
                distributionScore: 0,
                smartMoneyScore: 0,
            },
            social: twitterScore.breakdown,
        },
    };
}
/**
 * Calculate Momentum Index (0-100)
 * Momentum = (70% Growth + 30% Team) + Trend Bonus
 */
export function calculateMomentumIndex(
    growthScore: number,
    teamScore: number,
    trend: "up" | "stable" | "down"
): number {
    const trendWeight = trend === "up" ? 20 : trend === "stable" ? 10 : 0;
    const growthBalance = growthScore * 0.7 + teamScore * 0.3;
    return Math.min(100, Math.round(growthBalance + trendWeight));
}
