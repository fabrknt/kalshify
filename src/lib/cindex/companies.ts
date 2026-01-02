import { calculateMomentumIndex } from "./calculators/score-calculator";
import { prisma } from "@/lib/db";

export type CompanyCategory =
    | "defi"
    | "infrastructure"
    | "nft"
    | "dao"
    | "gaming";
export type TrendDirection = "up" | "down" | "stable";

export interface Company {
    slug: string;
    name: string;
    category: CompanyCategory;
    description: string;
    logo: string;
    website: string;

    // Team metrics (from PULSE)
    teamHealth: {
        score: number; // 0-100
        githubCommits30d: number;
        activeContributors: number;
        contributorRetention: number; // percentage
        codeQuality: number; // 0-100
    };

    // Growth metrics (from TRACE)
    growth: {
        score: number; // 0-100
        onChainActivity30d: number;
        walletGrowth: number; // percentage
        userGrowthRate: number; // percentage
        tvl?: number; // Total Value Locked (for DeFi)
        volume30d?: number; // Trading volume (for NFT, DeFi)
    };

    // Overall index
    overallScore: number; // 0-100 (combined health score)
    trend: TrendDirection; // 30-day trend
    isListed: boolean; // Listed in MARKETPLACE
    listingId?: string; // Reference to marketplace listing
    news?: {
        title: string;
        url: string;
        date: string;
        summary?: string;
        source: string;
    }[];
}

/**
 * Transform database company record to Company interface
 */
function transformCompany(company: any): Company {
    const indexData = company.indexData as any;
    const github = indexData?.github || {};
    const onchain = indexData?.onchain || {};

    return {
        slug: company.slug,
        name: company.name,
        category: company.category as CompanyCategory,
        description: company.description || "",
        logo: company.logo || "🏢",
        website: company.website || "",
        overallScore: company.overallScore,
        trend: company.trend as TrendDirection,
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
        news: indexData?.news || [],
    };
}

/**
 * Get all companies from Supabase database
 */
export async function getCompanies(): Promise<Company[]> {
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

    return companies.map(transformCompany);
}

/**
 * Get all companies from Supabase database (alias for getCompanies)
 * @deprecated Use getCompanies() instead
 */
export async function getCompaniesFromDB(): Promise<Company[]> {
    return getCompanies();
}

// Helper functions
/**
 * Get company by slug from Supabase database
 */
export async function getCompanyBySlug(slug: string): Promise<Company | null> {
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
            trend: true,
            isListed: true,
            indexData: true,
        },
    });

    if (!company) return null;

    return transformCompany(company);
}

/**
 * Get company by slug from Supabase database (alias for getCompanyBySlug)
 * @deprecated Use getCompanyBySlug() instead
 */
export async function getCompanyBySlugFromDB(
    slug: string
): Promise<Company | null> {
    return getCompanyBySlug(slug);
}

export async function getCompaniesByCategory(
    category: CompanyCategory
): Promise<Company[]> {
    const allCompanies = await getCompanies();
    return allCompanies.filter((c) => c.category === category);
}

export async function getTopCompanies(limit: number = 10): Promise<Company[]> {
    const allCompanies = await getCompanies();
    return [...allCompanies]
        .sort((a, b) => b.overallScore - a.overallScore)
        .slice(0, limit);
}

export async function getFastestGrowing(
    limit: number = 10
): Promise<Company[]> {
    const allCompanies = await getCompanies();
    return [...allCompanies]
        .sort((a, b) => b.growth.score - a.growth.score)
        .slice(0, limit);
}

export async function getMostActiveTeams(
    limit: number = 10
): Promise<Company[]> {
    const allCompanies = await getCompanies();
    return [...allCompanies]
        .sort((a, b) => b.teamHealth.score - a.teamHealth.score)
        .slice(0, limit);
}

export async function getRisingStars(limit: number = 10): Promise<Company[]> {
    const allCompanies = await getCompanies();
    return [...allCompanies]
        .sort((a, b) => {
            // Priority 1: Trend
            if (a.trend === "up" && b.trend !== "up") return -1;
            if (a.trend !== "up" && b.trend === "up") return 1;

            // Priority 2: Momentum calculation
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

export async function getListedCompanies(): Promise<Company[]> {
    const allCompanies = await getCompanies();
    return allCompanies.filter((c) => c.isListed);
}

export async function getCategoryLeaders(): Promise<
    Record<CompanyCategory, Company | undefined>
> {
    const allCompanies = await getCompanies();
    const categories: CompanyCategory[] = [
        "defi",
        "infrastructure",
        "nft",
        "dao",
        "gaming",
    ];
    const leaders: Partial<Record<CompanyCategory, Company>> = {};

    categories.forEach((category) => {
        const categoryCompanies = allCompanies.filter(
            (c) => c.category === category
        );
        const leader = categoryCompanies.sort(
            (a, b) => b.overallScore - a.overallScore
        )[0];
        if (leader) {
            leaders[category] = leader;
        }
    });

    return leaders as Record<CompanyCategory, Company | undefined>;
}
