import Link from "next/link";
import { TrendingUp, TrendingDown, Minus, ExternalLink } from "lucide-react";
import { Company } from "@/lib/cindex/companies";
import { cn } from "@/lib/utils";

interface CompanyCardProps {
    company: Company;
}

const categoryColors = {
    defi: "bg-purple-100 text-purple-700",
    infrastructure: "bg-blue-100 text-blue-700",
    nft: "bg-pink-100 text-pink-700",
    dao: "bg-green-100 text-green-700",
    gaming: "bg-orange-100 text-orange-700",
};

const chainColors = {
    ethereum: "bg-slate-100 text-slate-700",
    base: "bg-blue-50 text-blue-600",
    arbitrum: "bg-sky-50 text-sky-600",
    solana: "bg-violet-50 text-violet-600",
};

const trendIcons = {
    up: TrendingUp,
    down: TrendingDown,
    stable: Minus,
};

const trendColors = {
    up: "text-green-600",
    down: "text-red-600",
    stable: "text-gray-600",
};

export function CompanyCard({ company }: CompanyCardProps) {
    const TrendIcon = trendIcons[company.trend];
    const scoreColor =
        company.overallScore >= 40
            ? "text-green-600"
            : company.overallScore >= 10
            ? "text-yellow-600"
            : "text-red-600";

    return (
        <Link href={`/cindex/${company.slug}`}>
            <div className="group bg-card rounded-lg border border-border p-6 transition-all hover:border-purple-300 hover:shadow-lg">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                            {company.logo ? (
                                <img
                                    src={company.logo}
                                    alt={`${company.name} logo`}
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <div className="text-2xl font-bold text-muted-foreground">
                                    {company.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground group-hover:text-purple-600 transition-colors">
                                {company.name}
                            </h3>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                                <span
                                    className={cn(
                                        "text-xs px-2 py-0.5 rounded-full",
                                        categoryColors[company.category]
                                    )}
                                >
                                    {company.category.toUpperCase()}
                                </span>
                                {company.subcategory && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
                                        {company.subcategory.replace(/-/g, ' ').toUpperCase()}
                                    </span>
                                )}
                                {company.chains && company.chains.length > 0 && (
                                    <>
                                        <span
                                            className={cn(
                                                "text-xs px-2 py-0.5 rounded-full",
                                                chainColors[company.chains[0] as keyof typeof chainColors] || chainColors.ethereum
                                            )}
                                        >
                                            {company.chains[0].charAt(0).toUpperCase() + company.chains[0].slice(1)}
                                        </span>
                                        {company.chains.length > 1 && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                                +{company.chains.length - 1}
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <TrendIcon
                            className={cn(
                                "h-4 w-4",
                                trendColors[company.trend]
                            )}
                        />
                    </div>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {company.description}
                </p>

                {/* Scores */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">
                            Overall
                        </p>
                        <p className={cn("text-2xl font-bold", scoreColor)}>
                            {company.overallScore}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">
                            Growth
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                            {company.growth.score}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">
                            Social
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                            {company.social.score}
                        </p>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="space-y-2 text-xs text-muted-foreground border-t border-border pt-4">
                    <div className="flex justify-between">
                        <span>Active Contributors</span>
                        <span className="font-medium text-foreground">
                            {company.teamHealth.activeContributors}
                        </span>
                    </div>
                    {company.growth.tvl && company.growth.tvl > 0 && (
                        <div className="flex justify-between">
                            <span>Total Value Locked</span>
                            <span className="font-medium text-foreground">
                                ${(company.growth.tvl / 1_000_000_000).toFixed(2)}B
                            </span>
                        </div>
                    )}
                    {company.growth.npmDownloads30d && company.growth.npmDownloads30d > 0 && (
                        <div className="flex justify-between">
                            <span>npm Downloads (30d)</span>
                            <span className="font-medium text-foreground">
                                {company.growth.npmDownloads30d.toLocaleString()}
                            </span>
                        </div>
                    )}
                    {company.isListed && (
                        <div className="flex justify-between">
                            <span className="text-purple-600 font-medium">
                                Listed in Marketplace
                            </span>
                            <ExternalLink className="h-3 w-3 text-purple-600" />
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
