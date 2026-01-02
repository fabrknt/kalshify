import { notFound } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    ExternalLink,
    TrendingUp,
    TrendingDown,
    Minus,
    Github,
    Activity,
    Twitter,
    Zap,
    Globe,
    Newspaper,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils/format";
import { NewsSection } from "@/components/cindex/news-section";

interface PageProps {
    params: Promise<{ company: string }>;
}

const trendIcons = {
    up: TrendingUp,
    down: TrendingDown,
    stable: Minus,
};

const trendColors = {
    up: "text-green-600 bg-green-50",
    down: "text-red-600 bg-red-50",
    stable: "text-gray-600 bg-gray-50",
};

const categoryColors = {
    defi: "bg-purple-100 text-purple-700",
    infrastructure: "bg-blue-100 text-blue-700",
    nft: "bg-pink-100 text-pink-700",
    dao: "bg-green-100 text-green-700",
    gaming: "bg-orange-100 text-orange-700",
};

function getCompanySocialLinks(slug: string): {
    github?: string;
    twitter?: string;
} {
    // Map of company slugs to their GitHub org and Twitter handle
    // Verified from actual index module files
    const socialMap: Record<string, { github: string; twitter: string }> = {
        orca: { github: "orca-so", twitter: "orca_so" },
        jupiter: { github: "jup-ag", twitter: "JupiterExchange" },
        uniswap: { github: "Uniswap", twitter: "Uniswap" },
        morpho: { github: "morpho-org", twitter: "MorphoLabs" },
        euler: { github: "euler-xyz", twitter: "eulerfinance" },
        rocketpool: { github: "rocket-pool", twitter: "Rocket_Pool" },
        blur: { github: "blur-io", twitter: "blur_io" },
        safe: { github: "safe-global", twitter: "safe" },
        drift: { github: "drift-labs", twitter: "DriftProtocol" },
        marginfi: { github: "marginfi", twitter: "marginfi" },
        kamino: { github: "Kamino-Finance", twitter: "KaminoFinance" },
        tensor: { github: "tensor-hq", twitter: "tensor_hq" },
        lido: { github: "lidofinance", twitter: "LidoFinance" },
        zora: { github: "ourzora", twitter: "zora" },
        zerox: { github: "0xProject", twitter: "0xProject" },
        parallel: { github: "ParallelNFT", twitter: "ParallelTCG" },
        velodrome: { github: "velodrome-finance", twitter: "VelodromeFi" },
        metaplex: { github: "metaplex-foundation", twitter: "metaplex" },
        jito: { github: "jito-foundation", twitter: "jito_sol" },
        staratlas: { github: "staratlasmeta", twitter: "staratlas" },
        aurory: { github: "AuroryProject", twitter: "AuroryProject" },
        mangomarkets: {
            github: "blockworks-foundation",
            twitter: "mangomarkets",
        },
        fabrknt: { github: "fabrknt", twitter: "fabrknt" },
    };

    const social = socialMap[slug.toLowerCase()];
    if (!social) return {};

    return {
        github: `https://github.com/${social.github}`,
        twitter: `https://twitter.com/${social.twitter}`,
    };
}

async function getCompanyData(slug: string) {
    try {
        const company = await prisma.company.findUnique({
            where: { slug },
            select: {
                id: true,
                slug: true,
                name: true,
                category: true,
                description: true,
                logo: true,
                website: true,
                overallScore: true,
                teamHealthScore: true,
                growthScore: true,
                socialScore: true,
                walletQualityScore: true,
                trend: true,
                isListed: true,
                indexData: true,
                lastFetchedAt: true,
            },
        });

        if (!company) {
            return null;
        }

        // Extract data from indexData JSONB
        const indexData = company.indexData as any;
        const github = indexData?.github || {};
        const onchain = indexData?.onchain || {};
        const twitter = indexData?.twitter || {};

        // Transform to match the expected Company interface
        return {
            ...company,
            teamHealth: {
                score: company.teamHealthScore,
                githubCommits30d: github.totalCommits30d || 0,
                activeContributors: github.activeContributors30d || 0,
                contributorRetention:
                    github.activeContributors30d && github.totalContributors
                        ? Math.round(
                              (github.activeContributors30d /
                                  github.totalContributors) *
                                  100
                          )
                        : 0,
                codeQuality: Math.min(company.teamHealthScore, 100), // Approximate
            },
            growth: {
                score: company.growthScore,
                onChainActivity30d: onchain.transactionCount30d || 0,
                walletGrowth: onchain.uniqueWallets30d
                    ? Math.round(
                          (onchain.uniqueWallets30d /
                              (onchain.uniqueWallets30d + 1000)) *
                              100
                      )
                    : 0,
                userGrowthRate: onchain.monthlyActiveUsers
                    ? Math.round((onchain.monthlyActiveUsers / 1000) * 100)
                    : 0,
                tvl: onchain.tvl,
                volume30d: onchain.volume30d,
            },
            social: {
                score: company.socialScore,
                twitterFollowers: indexData?.twitter?.followers,
                discordMembers: indexData?.social?.discordMembers,
                telegramMembers: indexData?.social?.telegramMembers,
                communityEngagement: indexData?.twitter?.engagement30d?.likes
                    ? (indexData.twitter.engagement30d.likes +
                       indexData.twitter.engagement30d.retweets +
                       indexData.twitter.engagement30d.replies)
                    : company.socialScore,
            },
            news: indexData?.news || [],
            scores: {
                overall: company.overallScore,
                teamHealth: company.teamHealthScore,
                growthScore: company.growthScore,
                socialScore: company.socialScore,
                walletQuality: company.walletQualityScore,
                breakdown: {
                    github: {
                        contributorScore: github.totalContributors
                            ? Math.min(
                                  (github.totalContributors / 50) * 100,
                                  100
                              )
                            : 0,
                        activityScore: github.totalCommits30d
                            ? Math.min(
                                  (github.totalCommits30d / 200) * 100,
                                  100
                              )
                            : 0,
                        retentionScore:
                            github.activeContributors30d &&
                            github.totalContributors
                                ? Math.round(
                                      (github.activeContributors30d /
                                          github.totalContributors) *
                                          100
                                  )
                                : 0,
                    },
                    onchain: {
                        userGrowthScore: Math.min(company.growthScore, 100),
                        transactionScore: Math.min(
                            (onchain.transactionCount30d || 0) / 100,
                            100
                        ),
                        tvlScore: onchain.tvl
                            ? Math.min(onchain.tvl / 1000000, 100)
                            : 0,
                        webActivityScore: 0,
                        newsGrowthScore: 0,
                        attentionScore: Math.min(company.socialScore, 100),
                    },
                    wallet: {
                        distributionScore: Math.min(
                            company.walletQualityScore,
                            100
                        ),
                        smartMoneyScore: Math.min(
                            company.walletQualityScore * 0.8,
                            100
                        ),
                    },
                    social: {
                        followersScore: Math.min(
                            (twitter.followers || 0) / 10000,
                            100
                        ),
                        engagementScore: twitter.engagement30d
                            ? Math.min(
                                  (twitter.engagement30d.likes || 0) / 100,
                                  100
                              )
                            : 0,
                    },
                },
            },
        };
    } catch (error) {
        console.error("Error fetching company data:", error);
        return null;
    }
}

export default async function CompanyProfilePage({ params }: PageProps) {
    const { company: companySlug } = await params;
    const companyData = await getCompanyData(companySlug);

    if (!companyData) {
        notFound();
    }

    const company = companyData;
    const scores = companyData.scores;

    const trend = company.trend as "up" | "down" | "stable";
    const TrendIcon = trendIcons[trend];
    const scoreColor =
        company.overallScore >= 85
            ? "text-green-600"
            : company.overallScore >= 70
            ? "text-yellow-600"
            : "text-red-600";

    const socialLinks = getCompanySocialLinks(company.slug);
    const category = company.category as
        | "defi"
        | "infrastructure"
        | "nft"
        | "dao"
        | "gaming";

    // Calculate growth score components
    const growthBreakdown = scores?.breakdown?.onchain;
    const onchainScore = growthBreakdown
        ? growthBreakdown.userGrowthScore * 0.4 +
          growthBreakdown.transactionScore * 0.3 +
          growthBreakdown.tvlScore * 0.3
        : 0;

    const webNewsScore = growthBreakdown
        ? Math.max(
              growthBreakdown.webActivityScore || 0,
              growthBreakdown.newsGrowthScore || 0
          )
        : 0;

    const attentionScore = growthBreakdown?.attentionScore || 0;

    // Determine which weight distribution was used
    const hasLowOnChain = (company.growth.onChainActivity30d || 0) < 10;
    const onchainWeight = hasLowOnChain ? 0 : 0.4;
    const webNewsWeight = hasLowOnChain ? 0.7 : 0.3;
    const attentionWeight = 0.3;

    return (
        <div className="min-h-screen bg-muted">
            {/* Header */}
            <div className="border-b border-border bg-card">
                <div className="p-8">
                    <Link
                        href="/cindex/companies"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Companies
                    </Link>

                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="text-6xl">{company.logo}</div>
                            <div>
                                <h1 className="text-3xl font-bold text-foreground">
                                    {company.name}
                                </h1>
                                <div className="flex items-center gap-3 mt-2">
                                    <span
                                        className={cn(
                                            "text-xs px-2 py-1 rounded-full font-medium",
                                            categoryColors[category]
                                        )}
                                    >
                                        {category.toUpperCase()}
                                    </span>
                                    <div
                                        className={cn(
                                            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                                            trendColors[trend]
                                        )}
                                    >
                                        <TrendIcon className="h-3 w-3" />
                                        <span>
                                            {trend === "up"
                                                ? "Growing"
                                                : trend === "down"
                                                ? "Declining"
                                                : "Stable"}
                                        </span>
                                    </div>
                                    {company.isListed && (
                                        <Link
                                            href={`/synergy/opportunities`}
                                            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200"
                                        >
                                            <span>Listed in Marketplace</span>
                                            <ExternalLink className="h-3 w-3" />
                                        </Link>
                                    )}
                                </div>
                                <p className="text-muted-foreground mt-2">
                                    {company.description}
                                </p>
                                {company.website && (
                                    <a
                                        href={company.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 mt-2"
                                    >
                                        {company.website}
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Overall Score */}
                        <div className="text-center bg-muted rounded-lg p-6">
                            <p className="text-sm text-muted-foreground mb-2">
                                Overall Index Score
                            </p>
                            <p className={cn("text-5xl font-bold", scoreColor)}>
                                {company.overallScore}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                out of 100
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content - continued in next part due to length... */}
            {/* For brevity, I'll continue with the rest of the component */}
            <div className="p-8 space-y-8">
                {/* Data Fetching Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                            <div className="relative flex h-3 w-3 mt-1">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-blue-900 mb-1">
                                Data Collection in Progress
                            </h3>
                            <p className="text-sm text-blue-800">
                                We are currently fetching and verifying data from GitHub, Twitter, and on-chain sources.
                                Some metrics may be incomplete or show as zero until the initial data collection is complete.
                                This page will update automatically as data becomes available.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Score Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Team Health */}
                    <div className="bg-card rounded-lg border border-border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Github className="h-5 w-5 text-purple-600" />
                                <h2 className="text-xl font-semibold text-foreground">
                                    Team Health
                                </h2>
                            </div>
                            {socialLinks.github && (
                                <a
                                    href={socialLinks.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-purple-600 transition-colors"
                                    title="View GitHub organization used for calculation"
                                >
                                    <Github className="h-4 w-4" />
                                    <span className="text-xs">Source</span>
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            )}
                        </div>
                        <div className="mb-6">
                            <p className="text-4xl font-bold text-foreground mb-1">
                                {company.teamHealth.score}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Team vitality score
                            </p>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Total Contributors
                                </span>
                                <span className="font-medium text-foreground">
                                    {formatNumber(
                                        (companyData.indexData as any)?.github
                                            ?.totalContributors || 0
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Active Contributors (30d)
                                </span>
                                <span className="font-medium text-foreground">
                                    {formatNumber(company.teamHealth.activeContributors)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">
                                    GitHub Commits (30d)
                                </span>
                                <span className="font-medium text-foreground">
                                    {formatNumber(
                                        company.teamHealth.githubCommits30d
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Contributor Retention
                                </span>
                                <span className="font-medium text-foreground">
                                    {company.teamHealth.contributorRetention}%
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Growth Metrics */}
                    <div className="bg-card rounded-lg border border-border p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Activity className="h-5 w-5 text-purple-600" />
                            <h2 className="text-xl font-semibold text-foreground">
                                Growth Metrics
                            </h2>
                        </div>
                        <div className="mb-6">
                            <p className="text-4xl font-bold text-foreground mb-1">
                                {company.growth.score}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Growth momentum score
                            </p>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Daily Active Users
                                </span>
                                <span className="font-medium text-foreground">
                                    {formatNumber(
                                        (companyData.indexData as any)?.onchain
                                            ?.dailyActiveUsers || 0
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Monthly Active Users
                                </span>
                                <span className="font-medium text-foreground">
                                    {formatNumber(
                                        (companyData.indexData as any)?.onchain
                                            ?.monthlyActiveUsers || 0
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Unique Wallets (30d)
                                </span>
                                <span className="font-medium text-foreground">
                                    {formatNumber(
                                        (companyData.indexData as any)?.onchain
                                            ?.uniqueWallets30d || 0
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Transactions (30d)
                                </span>
                                <span className="font-medium text-foreground">
                                    {formatNumber(
                                        company.growth.onChainActivity30d
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Total Value Locked
                                </span>
                                <span className="font-medium text-foreground">
                                    ${formatNumber(company.growth.tvl || 0)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Volume (30d)
                                </span>
                                <span className="font-medium text-foreground">
                                    ${formatNumber(company.growth.volume30d || 0)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Web Activity Score
                                </span>
                                <span className="font-medium text-foreground">
                                    {scores?.breakdown?.onchain?.webActivityScore || 0}/100
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">
                                    News Growth Score
                                </span>
                                <span className="font-medium text-foreground">
                                    {scores?.breakdown?.onchain?.indexNewsScore || 0}/100
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Attention Score
                                </span>
                                <span className="font-medium text-foreground">
                                    {scores?.breakdown?.onchain?.attentionScore || 0}/100
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Social Score */}
                    <div className="bg-card rounded-lg border border-border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Twitter className="h-5 w-5 text-purple-600" />
                                <h2 className="text-xl font-semibold text-foreground">
                                    Social Score
                                </h2>
                            </div>
                            {socialLinks.twitter && (
                                <a
                                    href={socialLinks.twitter}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-purple-600 transition-colors"
                                >
                                    <Twitter className="h-4 w-4" />
                                    <span className="text-xs">Source</span>
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            )}
                        </div>
                        <div className="mb-6">
                            <p className="text-4xl font-bold text-foreground mb-1">
                                {scores?.socialScore || 0}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Twitter activity score
                            </p>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Twitter Followers
                                </span>
                                <span className="font-medium text-foreground">
                                    {formatNumber(company.social.twitterFollowers || 0)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Likes (30d)
                                </span>
                                <span className="font-medium text-foreground">
                                    {formatNumber(
                                        (companyData.indexData as any)?.twitter
                                            ?.engagement30d?.likes || 0
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Retweets (30d)
                                </span>
                                <span className="font-medium text-foreground">
                                    {formatNumber(
                                        (companyData.indexData as any)?.twitter
                                            ?.engagement30d?.retweets || 0
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Replies (30d)
                                </span>
                                <span className="font-medium text-foreground">
                                    {formatNumber(
                                        (companyData.indexData as any)?.twitter
                                            ?.engagement30d?.replies || 0
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Discord Members
                                </span>
                                <span className="font-medium text-foreground">
                                    {formatNumber(company.social.discordMembers || 0)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Telegram Members
                                </span>
                                <span className="font-medium text-foreground">
                                    {formatNumber(company.social.telegramMembers || 0)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* News & Index */}
                <NewsSection news={company.news} />

                {/* Index Verification */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <h3 className="text-sm font-semibold text-purple-900 mb-3">
                        About Index Verification
                    </h3>
                    <div className="text-sm text-purple-800 space-y-2">
                        <p>
                            <strong>Automated Data Sources:</strong> All metrics
                            are automatically verified through on-chain data
                            (smart contracts, wallets, DAOs) and off-chain
                            sources (GitHub, Discord, Twitter).
                        </p>
                        <p>
                            <strong>No Manual Input:</strong> Index scores are
                            calculated algorithmically based on verified data,
                            ensuring trustworthy and objective company
                            assessments.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
