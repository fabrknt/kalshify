"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
    Crown,
    Check,
    Zap,
    Shield,
    TrendingUp,
    X,
    ChevronRight,
    Sparkles,
} from "lucide-react";
import { PremiumTier, TierBenefits, TIER_BENEFITS } from "@/lib/curate/premium";

const TIER_COLORS: Record<PremiumTier, { bg: string; text: string; border: string }> = {
    free: {
        bg: "bg-slate-500/10",
        text: "text-slate-400",
        border: "border-slate-500/30",
    },
    basic: {
        bg: "bg-cyan-500/10",
        text: "text-cyan-400",
        border: "border-cyan-500/30",
    },
    pro: {
        bg: "bg-purple-500/10",
        text: "text-purple-400",
        border: "border-purple-500/30",
    },
    enterprise: {
        bg: "bg-amber-500/10",
        text: "text-amber-400",
        border: "border-amber-500/30",
    },
};

interface PremiumStatus {
    tier: PremiumTier;
    tierInfo: TierBenefits;
    isPremium: boolean;
    expiresAt: string | null;
    features: Array<{
        id: string;
        name: string;
        description: string;
        requiredTier: PremiumTier;
        hasAccess: boolean;
    }>;
    usage?: {
        savedAllocations: {
            current: number;
            limit: number;
            remaining: number;
        };
    };
}

// Compact badge for header/nav
export function PremiumBadge() {
    const { data: session } = useSession();
    const [status, setStatus] = useState<PremiumStatus | null>(null);

    useEffect(() => {
        if (session?.user) {
            fetch("/api/curate/premium")
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setStatus(data.data);
                    }
                })
                .catch(console.error);
        }
    }, [session?.user]);

    if (!status || status.tier === "free") {
        return null;
    }

    const colors = TIER_COLORS[status.tier];

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}`}>
            <Crown className="h-3 w-3" />
            {status.tierInfo.name}
        </span>
    );
}

// Upgrade prompt for locked features
export function UpgradePrompt({
    feature,
    requiredTier,
    onClose,
}: {
    feature: string;
    requiredTier: PremiumTier;
    onClose: () => void;
}) {
    const tierInfo = TIER_BENEFITS[requiredTier];
    const colors = TIER_COLORS[requiredTier];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Zap className={`h-5 w-5 ${colors.text}`} />
                        <h3 className="text-lg font-semibold text-white">Upgrade Required</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <p className="text-slate-400 mb-4">
                    <span className="text-white font-medium">{feature}</span> requires a {tierInfo.name} subscription or higher.
                </p>

                <div className={`p-4 rounded-lg ${colors.bg} border ${colors.border} mb-4`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className={`font-semibold ${colors.text}`}>{tierInfo.name}</span>
                        <span className="text-white font-bold">${tierInfo.price}/mo</span>
                    </div>
                    <ul className="space-y-1">
                        {tierInfo.features.slice(0, 4).map((f, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                                <Check className={`h-3 w-3 ${colors.text}`} />
                                {f}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 text-slate-400 hover:text-white transition-colors"
                    >
                        Maybe Later
                    </button>
                    <button
                        className={`flex-1 px-4 py-2 rounded-lg font-medium ${colors.bg} ${colors.text} border ${colors.border} hover:opacity-80 transition-opacity`}
                    >
                        Upgrade Now
                    </button>
                </div>
            </div>
        </div>
    );
}

// Full pricing card component
export function PricingCard({
    tier,
    isCurrentTier,
    onSelect,
}: {
    tier: TierBenefits;
    isCurrentTier: boolean;
    onSelect: (tier: PremiumTier) => void;
}) {
    const colors = TIER_COLORS[tier.tier];
    const isPopular = tier.tier === "pro";

    return (
        <div
            className={`relative bg-slate-900/70 border rounded-xl p-6 ${
                isPopular ? "border-purple-500/50 ring-1 ring-purple-500/30" : "border-slate-700/50"
            }`}
        >
            {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-purple-500 text-white text-xs font-medium rounded-full">
                    Most Popular
                </div>
            )}

            <div className="text-center mb-6">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text} border ${colors.border} mb-3`}>
                    {tier.tier === "enterprise" && <Crown className="h-3 w-3" />}
                    {tier.name}
                </span>
                <div className="mt-2">
                    <span className="text-4xl font-bold text-white">${tier.price}</span>
                    <span className="text-slate-400">/mo</span>
                </div>
                {tier.price > 0 && (
                    <p className="text-xs text-slate-500 mt-1">
                        or ${tier.annualPrice}/year (save ${tier.price * 12 - tier.annualPrice})
                    </p>
                )}
            </div>

            <ul className="space-y-3 mb-6">
                {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className={`h-4 w-4 ${colors.text} shrink-0 mt-0.5`} />
                        <span className="text-slate-300">{feature}</span>
                    </li>
                ))}
            </ul>

            <button
                onClick={() => onSelect(tier.tier)}
                disabled={isCurrentTier}
                className={`w-full py-2.5 rounded-lg font-medium transition-colors ${
                    isCurrentTier
                        ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                        : isPopular
                        ? "bg-purple-500 text-white hover:bg-purple-600"
                        : `${colors.bg} ${colors.text} border ${colors.border} hover:opacity-80`
                }`}
            >
                {isCurrentTier ? "Current Plan" : tier.price === 0 ? "Get Started" : "Upgrade"}
            </button>
        </div>
    );
}

// Full pricing section
export function PricingSection() {
    const { data: session } = useSession();
    const [currentTier, setCurrentTier] = useState<PremiumTier>("free");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (session?.user) {
            fetch("/api/curate/premium")
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setCurrentTier(data.data.tier);
                    }
                })
                .catch(console.error);
        }
    }, [session?.user]);

    const handleSelectTier = async (tier: PremiumTier) => {
        if (!session?.user || tier === "free" || tier === currentTier) return;

        setIsLoading(true);
        try {
            const response = await fetch("/api/curate/premium", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "subscribe", tier }),
            });

            if (response.ok) {
                setCurrentTier(tier);
            }
        } catch (error) {
            console.error("Failed to subscribe:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const tiers = Object.values(TIER_BENEFITS);

    return (
        <div className="py-8">
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm mb-4">
                    <Sparkles className="h-4 w-4" />
                    Unlock More Features
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Choose Your Plan</h2>
                <p className="text-slate-400">
                    Get more from your DeFi allocations with premium features
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {tiers.map(tier => (
                    <PricingCard
                        key={tier.tier}
                        tier={tier}
                        isCurrentTier={tier.tier === currentTier}
                        onSelect={handleSelectTier}
                    />
                ))}
            </div>

            {/* Feature comparison hint */}
            <div className="text-center mt-8">
                <p className="text-sm text-slate-500">
                    All plans include core allocation features. Premium adds alerts, history, and API access.
                </p>
            </div>
        </div>
    );
}

// Usage indicator for limits
export function UsageIndicator({
    label,
    current,
    limit,
}: {
    label: string;
    current: number;
    limit: number;
}) {
    const percentage = limit === -1 ? 0 : (current / limit) * 100;
    const isUnlimited = limit === -1;
    const isNearLimit = percentage >= 80;

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">{label}</span>
                <span className={`font-medium ${isNearLimit && !isUnlimited ? "text-orange-400" : "text-white"}`}>
                    {current}{isUnlimited ? "" : ` / ${limit}`}
                </span>
            </div>
            {!isUnlimited && (
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all ${
                            isNearLimit ? "bg-orange-500" : "bg-cyan-500"
                        }`}
                        style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                </div>
            )}
        </div>
    );
}
