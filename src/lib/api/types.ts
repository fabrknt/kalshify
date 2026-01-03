/**
 * API Response Types for Real Data Integration
 */

// GitHub API Types
export interface GitHubRepoStats {
    name: string;
    stars: number;
    forks: number;
    openIssues: number;
    watchers: number;
    language: string;
    createdAt: string;
    updatedAt: string;
    pushedAt: string;
}

export interface GitHubContributor {
    login: string;
    contributions: number;
    avatarUrl: string;
}

export interface GitHubCommitActivity {
    week: number; // Unix timestamp
    total: number;
    days: number[];
}

export interface GitHubTeamMetrics {
    totalContributors: number;
    activeContributors30d: number;
    totalCommits30d: number;
    avgCommitsPerDay: number;
    topContributors: GitHubContributor[];
    commitActivity: GitHubCommitActivity[];
}

// Twitter API Types
export interface TwitterMetrics {
    followers: number;
    following: number;
    tweetCount: number;
    verified: boolean;
    createdAt: string;
    engagement30d?: {
        likes: number;
        retweets: number;
        replies: number;
    };
}

// Alchemy/On-chain Types
export interface OnChainMetrics {
    tvl: number; // Total Value Locked in USD
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    transactionCount24h: number;
    transactionCount7d: number;
    transactionCount30d: number;
    uniqueWallets24h: number;
    uniqueWallets7d: number;
    uniqueWallets30d: number;
    contractAddress: string;
    chain: string;
}

// Dune Analytics Types
export interface DuneQueryResult {
    executionId: string;
    queryId: number;
    state:
    | "QUERY_STATE_COMPLETED"
    | "QUERY_STATE_FAILED"
    | "QUERY_STATE_PENDING";
    rows: any[];
    metadata: {
        columnNames: string[];
        columnTypes: string[];
    };
}

export interface DuneMetrics {
    volume24h: number;
    volume7d: number;
    volume30d: number;
    fees24h: number;
    fees7d: number;
    fees30d: number;
    users24h: number;
    users7d: number;
    users30d: number;
}

// Nansen Types
export interface NansenWalletMetrics {
    smartMoneyHoldings: number; // % held by smart money
    whaleHoldings: number; // % held by whales
    retailHoldings: number; // % held by retail
    holderDistribution: {
        top10: number;
        top50: number;
        top100: number;
    };
    smartMoneyInflow30d: number; // USD
    smartMoneyOutflow30d: number; // USD
}

// Combined Index Data
export interface IndexData {
    companyName: string;
    category: "defi" | "nft" | "gaming" | "infrastructure" | "dao";
    github: GitHubTeamMetrics;
    twitter: TwitterMetrics;
    onchain: OnChainMetrics;
    nansen?: NansenWalletMetrics; // Optional: wallet quality metrics
    news?: {
        title: string;
        url: string;
        date: string;
        summary: string;
        source: string;
        content?: string;
    }[];
    calculatedAt: string;
}

// Index Score Breakdown
export interface IndexScore {
    overall: number; // 0-100
    teamHealth: number; // 0-100
    growthScore: number; // 0-100
    walletQuality: number; // 0-100
    socialScore: number; // 0-100
    breakdown: {
        github: {
            contributorScore: number;
            activityScore: number;
            retentionScore: number;
        };
        onchain: {
            userGrowthScore: number;
            transactionScore: number;
            tvlScore: number;
            webActivityScore: number;
            newsGrowthScore: number;
            partnershipScore: number;
            attentionScore: number;
            viralityScore: number;
        };
        wallet: {
            distributionScore: number;
            smartMoneyScore: number;
        };
        social: {
            followersScore: number;
            engagementScore: number;
        };
    };
}
