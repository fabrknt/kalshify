import Link from "next/link";
import { ArrowRight, Info } from "lucide-react";
import { Company } from "@/lib/cindex/companies";
import { calculateMomentumIndex } from "@/lib/cindex/calculators/score-calculator";
import { cn } from "@/lib/utils";
import { formatCategory, formatSubcategory } from "@/lib/utils/format";

interface SpotlightSectionProps {
    title: string;
    description: string;
    icon: React.ElementType;
    companies: Company[];
    iconColor?: string;
    scoreType?: "overall" | "team" | "growth" | "momentum";
    scoreLabel?: string;
}

const categoryColors: Record<string, string> = {
    defi: "bg-purple-100 text-purple-700",
    "defi-infra": "bg-blue-100 text-blue-700",
};

const chainColors = {
    ethereum: "bg-slate-100 text-slate-700",
    base: "bg-blue-50 text-blue-600",
    arbitrum: "bg-sky-50 text-sky-600",
    solana: "bg-violet-50 text-violet-600",
};

export function SpotlightSection({
    title,
    description,
    icon: Icon,
    companies,
    iconColor = "text-purple-600",
    scoreType = "overall",
    scoreLabel = "Score",
}: SpotlightSectionProps) {
    const getScore = (company: Company) => {
        switch (scoreType) {
            case "growth":
                return company.growth.score;
            case "momentum":
                return calculateMomentumIndex(
                    company.growth.score,
                    company.growth.score,
                    company.trend
                );
            default:
                return company.overallScore;
        }
    };

    return (
        <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className={cn("p-2 rounded-lg bg-purple-50", iconColor)}>
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-foreground">
                        {title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                    {scoreType === "momentum" && (
                        <div className="flex items-center gap-1.5 mt-1 text-[10px] text-muted-foreground/60 uppercase tracking-wider font-medium">
                            <Info className="h-3 w-3" />
                            Formula: (70% Growth + 30% Team) + Trend Bonus
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-3">
                {companies.length > 0 ? (
                    companies.map((company, index) => (
                        <Link
                            key={company.slug}
                            href={`/cindex/${company.slug}`}
                            className="block p-3 rounded-lg border border-border hover:border-purple-300 hover:shadow-md transition-all"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="text-lg font-bold text-muted-foreground/40 w-6">
                                        #{index + 1}
                                    </div>
                                    <div className="w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                                        {company.logo ? (
                                            <img
                                                src={company.logo}
                                                alt={`${company.name} logo`}
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <div className="text-lg font-bold text-muted-foreground">
                                                {company.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="font-semibold text-foreground">
                                                {company.name}
                                            </h4>
                                            <span
                                                className={cn(
                                                    "text-xs px-1.5 py-0.5 rounded",
                                                    categoryColors[
                                                        company.category
                                                    ]
                                                )}
                                            >
                                                {formatCategory(company.category)}
                                            </span>
                                            {company.subcategory && (
                                                <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-700 border border-cyan-200">
                                                    {formatSubcategory(company.subcategory)}
                                                </span>
                                            )}
                                            {company.chains && company.chains.length > 0 && (
                                                <>
                                                    <span
                                                        className={cn(
                                                            "text-xs px-1.5 py-0.5 rounded",
                                                            chainColors[company.chains[0] as keyof typeof chainColors] || chainColors.ethereum
                                                        )}
                                                    >
                                                        {company.chains[0].charAt(0).toUpperCase() + company.chains[0].slice(1)}
                                                    </span>
                                                    {company.chains.length > 1 && (
                                                        <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                                                            +{company.chains.length - 1}
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {company.description}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 ml-4">
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">
                                            {scoreLabel}
                                        </p>
                                        <p className="text-xl font-bold text-green-600">
                                            {getScore(company)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="py-8 text-center border border-dashed border-border rounded-lg">
                        <p className="text-sm text-muted-foreground">
                            No companies found in this category
                        </p>
                    </div>
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-border">
                <Link
                    href="/cindex/companies"
                    className="flex items-center justify-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                    View All Companies
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
        </div>
    );
}

interface CategoryLeaderCardProps {
    category: string;
    company?: Company;
}

export function CategoryLeaderCard({
    category,
    company,
}: CategoryLeaderCardProps) {
    if (!company) {
        return (
            <div className="bg-card rounded-lg border border-border p-4 opacity-60">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs px-2 py-1 rounded-full font-medium bg-gray-100 text-gray-500">
                        {category}
                    </span>
                    <div className="text-2xl">⏳</div>
                </div>
                <h4 className="font-semibold text-foreground mb-1">
                    Coming Soon
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    Index data for this category is currently being aggregated.
                </p>
            </div>
        );
    }
    return (
        <Link
            href={`/cindex/${company.slug}`}
            className="block bg-card rounded-lg border border-border p-4 hover:border-purple-300 hover:shadow-md transition-all"
        >
            <div className="flex items-center justify-between mb-3">
                <span
                    className={cn(
                        "text-xs px-2 py-1 rounded-full font-medium",
                        categoryColors[company.category]
                    )}
                >
                    {category}
                </span>
                <div className="w-8 h-8 flex-shrink-0 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                    {company.logo ? (
                        <img
                            src={company.logo}
                            alt={`${company.name} logo`}
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <div className="text-base font-bold text-muted-foreground">
                            {company.name.charAt(0)}
                        </div>
                    )}
                </div>
            </div>
            <h4 className="font-semibold text-foreground mb-1">
                {company.name}
            </h4>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                {company.description}
            </p>
            <div className="flex items-center justify-around">
                <div className="text-center">
                    <p className="text-xs text-muted-foreground">Overall</p>
                    <p className="text-lg font-bold text-green-600">
                        {company.overallScore}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-muted-foreground">Growth</p>
                    <p className="text-lg font-bold text-foreground">
                        {company.growth.score}
                    </p>
                </div>
            </div>
        </Link>
    );
}
