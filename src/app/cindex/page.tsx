import Link from "next/link";
import { ArrowRight, Trophy, TrendingUp, Github, Star } from "lucide-react";
import { prisma } from "@/lib/db";
import { Company } from "@/lib/cindex/companies";
import { calculateMomentumIndex } from "@/lib/cindex/calculators/score-calculator";
import {
    SpotlightSection,
    CategoryLeaderCard,
} from "@/components/cindex/spotlight";

// Mark page as dynamic since it uses database
export const dynamic = "force-dynamic";

async function getAllCompaniesFromDB(): Promise<Company[]> {
    const companies = await prisma.company.findMany({
        where: { isActive: true },
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
            trend: true,
            isListed: true,
            indexData: true,
        },
        orderBy: {
            overallScore: "desc",
        },
    });

    // Transform to Company interface
    return companies.map((company): Company => {
        const indexData = company.indexData as any;
        const github = indexData?.github || {};
        const onchain = indexData?.onchain || {};

        return {
            slug: company.slug,
            name: company.name,
            category: company.category as Company["category"],
            description: company.description || "",
            logo: company.logo || "🏢",
            website: company.website || "",
            overallScore: company.overallScore,
            trend: company.trend as "up" | "down" | "stable",
            isListed: company.isListed,
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
                codeQuality: company.teamHealthScore,
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
        };
    });
}

function getTopCompanies(companies: Company[], limit: number = 10): Company[] {
    return [...companies]
        .sort((a, b) => b.overallScore - a.overallScore)
        .slice(0, limit);
}

function getFastestGrowing(
    companies: Company[],
    limit: number = 10
): Company[] {
    return [...companies]
        .sort((a, b) => b.growth.score - a.growth.score)
        .slice(0, limit);
}

function getMostActiveTeams(
    companies: Company[],
    limit: number = 10
): Company[] {
    return [...companies]
        .sort((a, b) => b.teamHealth.score - a.teamHealth.score)
        .slice(0, limit);
}

function getRisingStars(companies: Company[], limit: number = 10): Company[] {
    return [...companies]
        .sort((a, b) => {
            if (a.trend === "up" && b.trend !== "up") return -1;
            if (a.trend !== "up" && b.trend === "up") return 1;
            const aMomentum = calculateMomentumIndex(
                a.growth.score,
                a.teamHealth.score,
                a.trend
            );
            const bMomentum = calculateMomentumIndex(
                b.growth.score,
                b.teamHealth.score,
                b.trend
            );
            return bMomentum - aMomentum;
        })
        .slice(0, limit);
}

function getCategoryLeaders(
    companies: Company[]
): Record<Company["category"], Company | undefined> {
    const categories: Company["category"][] = [
        "defi",
        "infrastructure",
        "nft",
        "dao",
        "gaming",
    ];
    const leaders: Partial<Record<Company["category"], Company>> = {};

    categories.forEach((category) => {
        const categoryCompanies = companies.filter(
            (c) => c.category === category
        );
        const leader = categoryCompanies.sort(
            (a, b) => b.overallScore - a.overallScore
        )[0];
        if (leader) {
            leaders[category] = leader;
        }
    });

    return leaders as Record<Company["category"], Company | undefined>;
}

export default async function CindexPage() {
    const companiesList = await getAllCompaniesFromDB();
    const topCompanies = getTopCompanies(companiesList, 5);
    const fastestGrowing = getFastestGrowing(companiesList, 5);
    const mostActiveTeams = getMostActiveTeams(companiesList, 5);
    const risingStars = getRisingStars(companiesList, 5);
    const categoryLeaders = getCategoryLeaders(companiesList);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
                <div className="flex justify-center mb-4">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-800 text-sm font-semibold">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                        </span>
                        Preview
                    </span>
                </div>
                <h1 className="text-4xl font-bold text-foreground mb-4">
                    Web3 Company Index
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Automated index for {companiesList.length} web3 companies
                    with verified on-chain and off-chain data
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-card rounded-lg border border-border p-6 text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                        Companies Tracked
                    </p>
                    <p className="text-4xl font-bold text-foreground">
                        {companiesList.length}
                    </p>
                </div>
                <div className="bg-card rounded-lg border border-border p-6 text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                        Avg Index Score
                    </p>
                    <p className="text-4xl font-bold text-foreground">
                        {Math.round(
                            companiesList.reduce(
                                (sum, c) => sum + c.overallScore,
                                0
                            ) / companiesList.length
                        )}
                    </p>
                </div>
                <div className="bg-card rounded-lg border border-border p-6 text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                        Growing Fast
                    </p>
                    <p className="text-4xl font-bold text-green-600">
                        {companiesList.filter((c) => c.trend === "up").length}
                    </p>
                </div>
                <div className="bg-card rounded-lg border border-border p-6 text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                        Listed for Sale
                    </p>
                    <p className="text-4xl font-bold text-purple-600">
                        {companiesList.filter((c) => c.isListed).length}
                    </p>
                </div>
            </div>

            {/* Spotlight Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Overall */}
                <SpotlightSection
                    title="Top Performers"
                    description="Highest overall index scores"
                    icon={Trophy}
                    companies={topCompanies}
                    iconColor="text-yellow-600"
                    scoreType="overall"
                    scoreLabel="Overall Index"
                />

                {/* Fastest Growing */}
                <SpotlightSection
                    title="Fastest Growing"
                    description="Highest user growth rate (30 days)"
                    icon={TrendingUp}
                    companies={fastestGrowing}
                    iconColor="text-green-600"
                    scoreType="growth"
                    scoreLabel="Growth Score"
                />

                {/* Most Active Teams */}
                <SpotlightSection
                    title="Most Active Teams"
                    description="Highest GitHub commit velocity"
                    icon={Github}
                    companies={mostActiveTeams}
                    iconColor="text-blue-600"
                    scoreType="team"
                    scoreLabel="Team Score"
                />

                {/* Rising Stars */}
                <SpotlightSection
                    title="Rising Stars"
                    description="Biggest growth momentum"
                    icon={Star}
                    companies={risingStars}
                    iconColor="text-purple-600"
                    scoreType="momentum"
                    scoreLabel="Momentum Index"
                />
            </div>

            {/* Category Leaders */}
            <div className="bg-card rounded-lg border border-border p-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-foreground">
                        Category Leaders
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Top companies in each category
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <CategoryLeaderCard
                        category="DeFi"
                        company={categoryLeaders.defi}
                    />
                    <CategoryLeaderCard
                        category="Infrastructure"
                        company={categoryLeaders.infrastructure}
                    />
                    <CategoryLeaderCard
                        category="NFT"
                        company={categoryLeaders.nft}
                    />
                    <CategoryLeaderCard
                        category="DAO"
                        company={categoryLeaders.dao}
                    />
                    <CategoryLeaderCard
                        category="Gaming"
                        company={categoryLeaders.gaming}
                    />
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-8 text-center">
                <h3 className="text-2xl font-bold text-purple-900 mb-4">
                    Fully Automated Index
                </h3>
                <p className="text-purple-800 max-w-2xl mx-auto mb-6">
                    All company metrics are automatically verified through
                    on-chain data (contracts, wallets, DAOs) and off-chain
                    sources (GitHub, Discord, Twitter). No manual data entry
                    means trustworthy, objective index.
                </p>
                <Link
                    href="/cindex/companies"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors font-medium"
                >
                    Explore All Companies
                    <ArrowRight className="h-5 w-5" />
                </Link>
            </div>
        </div>
    );
}
