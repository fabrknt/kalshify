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
import { NewsSection } from "@/components/intelligence/news-section";

interface PageProps {
    params: { company: string };
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
    // Verified from actual intelligence module files
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
                intelligenceData: true,
                lastFetchedAt: true,
            },
        });

        if (!company) {
            return null;
        }

        // Extract data from intelligenceData JSONB
        const intelligenceData = company.intelligenceData as any;
        const github = intelligenceData?.github || {};
        const onchain = intelligenceData?.onchain || {};
        const twitter = intelligenceData?.twitter || {};

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
            news: intelligenceData?.news || [],
            scores: {
                overall: company.overallScore,
                teamHealth: company.teamHealthScore,
                growthScore: company.growthScore,
                socialScore: company.socialScore,
                walletQuality: company.walletQualityScore,
                breakdown: {
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
    const companyData = await getCompanyData(params.company);

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
                        href="/intelligence/companies"
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
                                            href={`/match/opportunities`}
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
                                Overall Intelligence Score
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

            {/* Content */}
            <div className="p-8 space-y-8">
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
                                    Active Contributors
                                </span>
                                <span className="font-medium text-foreground">
                                    {company.teamHealth.activeContributors}
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
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Code Quality Score
                                </span>
                                <span className="font-medium text-foreground">
                                    {company.teamHealth.codeQuality}/100
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Growth Metrics */}
                    <div className="bg-card rounded-lg border border-border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-purple-600" />
                                <h2 className="text-xl font-semibold text-foreground">
                                    Growth Metrics
                                </h2>
                            </div>
                        </div>
                        <div className="mb-6">
                            <p className="text-4xl font-bold text-foreground mb-1">
                                {company.growth.score}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Growth momentum score
                            </p>
                        </div>

                        {/* Growth Score Breakdown */}
                        {scores && growthBreakdown && (
                            <div className="mb-6 p-4 bg-muted rounded-lg border border-border">
                                <h3 className="text-sm font-semibold text-foreground mb-3">
                                    Score Components
                                </h3>
                                <div className="space-y-4">
                                    {/* On-Chain Activity (40% or 0% if low) */}
                                    {onchainWeight > 0 && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Zap className="h-4 w-4 text-blue-500" />
                                                    <span className="text-sm font-medium text-foreground">
                                                        On-Chain Activity
                                                    </span>
                                                </div>
                                                <span className="text-sm font-semibold text-foreground">
                                                    {Math.round(onchainScore)}
                                                </span>
                                            </div>
                                            <div className="pl-6 space-y-1.5 text-xs">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">
                                                        User Growth
                                                    </span>
                                                    <span className="text-foreground font-medium">
                                                        {
                                                            growthBreakdown.userGrowthScore
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">
                                                        Transactions
                                                    </span>
                                                    <span className="text-foreground font-medium">
                                                        {
                                                            growthBreakdown.transactionScore
                                                        }
                                                    </span>
                                                </div>
                                                {growthBreakdown.tvlScore >
                                                    0 && (
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">
                                                            TVL
                                                        </span>
                                                        <span className="text-foreground font-medium">
                                                            {
                                                                growthBreakdown.tvlScore
                                                            }
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="text-xs text-muted-foreground mt-1 pt-1 border-t border-border">
                                                    Weight:{" "}
                                                    {Math.round(
                                                        onchainWeight * 100
                                                    )}
                                                    %
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Web/News Activity (30% or 70% if low on-chain) */}
                                    {(growthBreakdown.webActivityScore > 0 ||
                                        growthBreakdown.newsGrowthScore >
                                            0) && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Globe className="h-4 w-4 text-green-500" />
                                                    <span className="text-sm font-medium text-foreground">
                                                        Web & News Activity
                                                    </span>
                                                </div>
                                                <span className="text-sm font-semibold text-foreground">
                                                    {Math.round(webNewsScore)}
                                                </span>
                                            </div>
                                            <div className="pl-6 space-y-1.5 text-xs">
                                                {growthBreakdown.webActivityScore >
                                                    0 && (
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">
                                                            Web Activity
                                                        </span>
                                                        <span className="text-foreground font-medium">
                                                            {
                                                                growthBreakdown.webActivityScore
                                                            }
                                                        </span>
                                                    </div>
                                                )}
                                                {growthBreakdown.newsGrowthScore >
                                                    0 && (
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">
                                                            News Growth
                                                        </span>
                                                        <span className="text-foreground font-medium">
                                                            {
                                                                growthBreakdown.newsGrowthScore
                                                            }
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="text-xs text-muted-foreground mt-1 pt-1 border-t border-border">
                                                    Weight:{" "}
                                                    {Math.round(
                                                        webNewsWeight * 100
                                                    )}
                                                    % (using{" "}
                                                    {growthBreakdown.webActivityScore >
                                                    growthBreakdown.newsGrowthScore
                                                        ? "Web Activity"
                                                        : "News Growth"}
                                                    )
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Attention/Virality (30%) */}
                                    {attentionScore > 0 && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <TrendingUp className="h-4 w-4 text-orange-500" />
                                                    <span className="text-sm font-medium text-foreground">
                                                        Attention & Virality
                                                    </span>
                                                </div>
                                                <span className="text-sm font-semibold text-foreground">
                                                    {Math.round(attentionScore)}
                                                </span>
                                            </div>
                                            <div className="pl-6 text-xs text-muted-foreground">
                                                Social engagement velocity
                                                <div className="text-xs text-muted-foreground mt-1 pt-1 border-t border-border">
                                                    Weight:{" "}
                                                    {Math.round(
                                                        attentionWeight * 100
                                                    )}
                                                    %
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Existing Growth Metrics */}
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">
                                    On-Chain Activity (30d)
                                </span>
                                <span className="font-medium text-foreground">
                                    {formatNumber(
                                        company.growth.onChainActivity30d
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Wallet Growth
                                </span>
                                <span className="font-medium text-green-600">
                                    +{company.growth.walletGrowth}%
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">
                                    User Growth Rate
                                </span>
                                <span className="font-medium text-green-600">
                                    +{company.growth.userGrowthRate}%
                                </span>
                            </div>
                            {company.growth.tvl && (
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Total Value Locked
                                    </span>
                                    <span className="font-medium text-foreground">
                                        ${formatNumber(company.growth.tvl)}
                                    </span>
                                </div>
                            )}
                            {company.growth.volume30d && (
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Volume (30d)
                                    </span>
                                    <span className="font-medium text-foreground">
                                        $
                                        {formatNumber(company.growth.volume30d)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Social Score (Twitter Activities) */}
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
                                    title="View Twitter account used for calculation"
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

                        {/* Social Score Breakdown */}
                        {scores && scores.breakdown?.social && (
                            <div className="mb-6 p-4 bg-muted rounded-lg border border-border">
                                <h3 className="text-sm font-semibold text-foreground mb-3">
                                    Score Components
                                </h3>
                                <div className="space-y-3">
                                    {/* Followers Score (70% weight) */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Twitter className="h-4 w-4 text-blue-500" />
                                                <span className="text-sm font-medium text-foreground">
                                                    Followers
                                                </span>
                                            </div>
                                            <span className="text-sm font-semibold text-foreground">
                                                {
                                                    scores.breakdown.social
                                                        .followersScore
                                                }
                                            </span>
                                        </div>
                                        <div className="pl-6 text-xs text-muted-foreground">
                                            Based on follower count (log scale)
                                            <div className="text-xs text-muted-foreground mt-1 pt-1 border-t border-border">
                                                Weight: 70%
                                            </div>
                                        </div>
                                    </div>

                                    {/* Engagement Score (30% weight) */}
                                    {scores.breakdown.social.engagementScore >
                                        0 && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Activity className="h-4 w-4 text-green-500" />
                                                    <span className="text-sm font-medium text-foreground">
                                                        Engagement Rate
                                                    </span>
                                                </div>
                                                <span className="text-sm font-semibold text-foreground">
                                                    {
                                                        scores.breakdown.social
                                                            .engagementScore
                                                    }
                                                </span>
                                            </div>
                                            <div className="pl-6 text-xs text-muted-foreground">
                                                Likes, retweets, replies (30d)
                                                <div className="text-xs text-muted-foreground mt-1 pt-1 border-t border-border">
                                                    Weight: 30%
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Additional Twitter Info */}
                        <div className="space-y-3 text-sm">
                            <div className="text-xs text-muted-foreground">
                                Twitter activities also contribute to Growth
                                Score via Attention & Virality (engagement
                                velocity)
                            </div>
                        </div>
                    </div>
                </div>

                {/* News & Intelligence */}
                <NewsSection news={company.news} />

                {/* Intelligence Verification */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <h3 className="text-sm font-semibold text-purple-900 mb-3">
                        About Intelligence Verification
                    </h3>
                    <div className="text-sm text-purple-800 space-y-2">
                        <p>
                            <strong>Automated Data Sources:</strong> All metrics
                            are automatically verified through on-chain data
                            (smart contracts, wallets, DAOs) and off-chain
                            sources (GitHub, Discord, Twitter).
                        </p>
                        {(socialLinks.github || socialLinks.twitter) && (
                            <div className="mt-4 pt-4 border-t border-purple-200">
                                <p className="font-medium mb-2">
                                    Data Sources Used:
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    {socialLinks.github && (
                                        <a
                                            href={socialLinks.github}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-md hover:bg-purple-100 transition-colors text-purple-900"
                                        >
                                            <Github className="h-4 w-4" />
                                            <span className="text-xs font-medium">
                                                GitHub Organization
                                            </span>
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    )}
                                    {socialLinks.twitter && (
                                        <a
                                            href={socialLinks.twitter}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-md hover:bg-purple-100 transition-colors text-purple-900"
                                        >
                                            <Twitter className="h-4 w-4" />
                                            <span className="text-xs font-medium">
                                                Twitter Account
                                            </span>
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                        <p>
                            <strong>No Manual Input:</strong> Intelligence
                            scores are calculated algorithmically based on
                            verified data, ensuring trustworthy and objective
                            company assessments.
                        </p>
                        <p>
                            <strong>Updated Daily:</strong> Metrics refresh
                            daily to provide the most current intelligence on
                            company health and growth trajectory.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
