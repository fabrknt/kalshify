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
        company.overallScore >= 85
            ? "text-green-600"
            : company.overallScore >= 70
            ? "text-yellow-600"
            : "text-red-600";

    return (
        <Link href={`/cindex/${company.slug}`}>
            <div className="group bg-card rounded-lg border border-border p-6 transition-all hover:border-purple-300 hover:shadow-lg">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="text-4xl">{company.logo}</div>
                        <div>
                            <h3 className="font-semibold text-foreground group-hover:text-purple-600 transition-colors">
                                {company.name}
                            </h3>
                            <span
                                className={cn(
                                    "text-xs px-2 py-0.5 rounded-full",
                                    categoryColors[company.category]
                                )}
                            >
                                {company.category.toUpperCase()}
                            </span>
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
                            Team
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                            {company.teamHealth.score}
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
                </div>

                {/* Key Metrics */}
                <div className="space-y-2 text-xs text-muted-foreground border-t border-border pt-4">
                    <div className="flex justify-between">
                        <span>Active Contributors</span>
                        <span className="font-medium text-foreground">
                            {company.teamHealth.activeContributors}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>User Growth (30d)</span>
                        <span className="font-medium text-foreground">
                            +{company.growth.userGrowthRate}%
                        </span>
                    </div>
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
