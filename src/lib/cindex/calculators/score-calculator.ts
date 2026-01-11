/**
 * Index Score Calculator
 * Combines GitHub, On-chain, and NPM metrics into a single score
 * Fully automated - no manual setup required
 */

import {
    IndexScore,
    GitHubTeamMetrics,
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
 * Calculate Overall Index Score
 * Fully automated - uses GitHub, On-chain, and NPM metrics
 */
export function calculateIndexScore(
    github: GitHubTeamMetrics,
    onchain: Partial<OnChainMetrics>,
    category: "defi" | "defi-infra" = "defi-infra",
    npmDownloads30d?: number
): IndexScore {
    const githubScore = calculateGitHubScore(github);
    const onchainScore = calculateOnChainScore(onchain);
    const npmScore = calculateNpmScore(npmDownloads30d);

    const tvl = onchain.tvl || 0;

    // --- Signal Fusion: Growth Score with adaptive weighting ---
    // Adaptive weighting based on on-chain strength:
    // - Exceptional (>75 + TVL >$1B): Dominant on-chain weight (80%)
    // - Strong on-chain (>70): Prioritize real usage metrics (60%)
    // - Weak on-chain (<30): Prioritize GitHub/NPM signals
    // - Medium: Balanced approach
    let combinedGrowthScore = 0;

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
        // Growth = On-Chain + GitHub
        combinedGrowthScore =
            onchainScore.score * 0.50 +
            githubScore.score * 0.50;
    }

    return {
        overall: Math.round(combinedGrowthScore),
        teamHealth: Math.round(combinedGrowthScore), // For backwards compatibility with DB field
        growthScore: Math.round(combinedGrowthScore),
        walletQuality: 0,
        socialScore: 0, // No longer tracking social
        breakdown: {
            github: githubScore.breakdown,
            onchain: onchainScore.breakdown,
            wallet: {
                distributionScore: 0,
                smartMoneyScore: 0,
            },
            social: {
                followersScore: 0,
                engagementScore: 0,
            },
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
