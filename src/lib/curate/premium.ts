/**
 * Premium Features
 * Manages premium tier access and feature gates
 */

export type PremiumTier = "free" | "basic" | "pro" | "enterprise";

export interface PremiumFeature {
    id: string;
    name: string;
    description: string;
    requiredTier: PremiumTier;
    icon?: string;
}

export interface TierBenefits {
    tier: PremiumTier;
    name: string;
    price: number; // Monthly price in USD
    annualPrice: number; // Annual price in USD
    features: string[];
    limits: {
        apiCallsPerDay: number;
        savedAllocations: number;
        alertsEnabled: boolean;
        customTemplates: number;
        historicalDataDays: number;
        exportFormats: string[];
        prioritySupport: boolean;
        whiteLabel: boolean;
    };
}

// Premium tier definitions
export const TIER_BENEFITS: Record<PremiumTier, TierBenefits> = {
    free: {
        tier: "free",
        name: "Free",
        price: 0,
        annualPrice: 0,
        features: [
            "Basic allocation recommendations",
            "5 risk profiles",
            "7-day performance history",
            "3 saved allocations",
            "Weekly market updates",
        ],
        limits: {
            apiCallsPerDay: 100,
            savedAllocations: 3,
            alertsEnabled: false,
            customTemplates: 0,
            historicalDataDays: 7,
            exportFormats: [],
            prioritySupport: false,
            whiteLabel: false,
        },
    },
    basic: {
        tier: "basic",
        name: "Basic",
        price: 9,
        annualPrice: 90,
        features: [
            "Everything in Free",
            "Rebalance alerts",
            "30-day performance history",
            "20 saved allocations",
            "Curator comparison",
            "CSV export",
        ],
        limits: {
            apiCallsPerDay: 500,
            savedAllocations: 20,
            alertsEnabled: true,
            customTemplates: 3,
            historicalDataDays: 30,
            exportFormats: ["csv"],
            prioritySupport: false,
            whiteLabel: false,
        },
    },
    pro: {
        tier: "pro",
        name: "Pro",
        price: 29,
        annualPrice: 290,
        features: [
            "Everything in Basic",
            "90-day performance history",
            "Unlimited saved allocations",
            "Custom allocation templates",
            "API access",
            "CSV & JSON export",
            "Priority email support",
        ],
        limits: {
            apiCallsPerDay: 2000,
            savedAllocations: -1, // Unlimited
            alertsEnabled: true,
            customTemplates: 10,
            historicalDataDays: 90,
            exportFormats: ["csv", "json"],
            prioritySupport: true,
            whiteLabel: false,
        },
    },
    enterprise: {
        tier: "enterprise",
        name: "Enterprise",
        price: 99,
        annualPrice: 990,
        features: [
            "Everything in Pro",
            "365-day performance history",
            "Unlimited custom templates",
            "Full API access",
            "White-label options",
            "Dedicated support",
            "Custom integrations",
        ],
        limits: {
            apiCallsPerDay: 10000,
            savedAllocations: -1,
            alertsEnabled: true,
            customTemplates: -1, // Unlimited
            historicalDataDays: 365,
            exportFormats: ["csv", "json", "xlsx"],
            prioritySupport: true,
            whiteLabel: true,
        },
    },
};

// Feature definitions
export const PREMIUM_FEATURES: PremiumFeature[] = [
    {
        id: "rebalance-alerts",
        name: "Rebalance Alerts",
        description: "Get notified when your allocation needs adjustment",
        requiredTier: "basic",
    },
    {
        id: "curator-comparison",
        name: "Curator Comparison",
        description: "Compare your allocation with professional curators",
        requiredTier: "basic",
    },
    {
        id: "extended-history",
        name: "Extended History",
        description: "Access up to 90 days of performance data",
        requiredTier: "pro",
    },
    {
        id: "custom-templates",
        name: "Custom Templates",
        description: "Create and save custom allocation templates",
        requiredTier: "pro",
    },
    {
        id: "api-access",
        name: "API Access",
        description: "Programmatic access to allocation data",
        requiredTier: "pro",
    },
    {
        id: "white-label",
        name: "White Label",
        description: "Remove branding for your own applications",
        requiredTier: "enterprise",
    },
];

/**
 * Check if a user has access to a specific feature
 */
export function hasFeatureAccess(
    userTier: PremiumTier,
    featureId: string
): boolean {
    const feature = PREMIUM_FEATURES.find(f => f.id === featureId);
    if (!feature) return true; // Unknown features are accessible

    const tierOrder: PremiumTier[] = ["free", "basic", "pro", "enterprise"];
    const userTierIndex = tierOrder.indexOf(userTier);
    const requiredTierIndex = tierOrder.indexOf(feature.requiredTier);

    return userTierIndex >= requiredTierIndex;
}

/**
 * Check if a user can perform an action based on their tier limits
 */
export function checkTierLimit(
    userTier: PremiumTier,
    limitKey: keyof TierBenefits["limits"],
    currentUsage?: number
): { allowed: boolean; limit: number | boolean; remaining?: number } {
    const tierBenefits = TIER_BENEFITS[userTier];
    const limit = tierBenefits.limits[limitKey];

    if (typeof limit === "boolean") {
        return { allowed: limit, limit };
    }

    const numericLimit = limit as number;

    if (numericLimit === -1) {
        return { allowed: true, limit: -1 }; // Unlimited
    }

    if (currentUsage !== undefined) {
        const remaining = numericLimit - currentUsage;
        return {
            allowed: remaining > 0,
            limit: numericLimit,
            remaining: Math.max(0, remaining),
        };
    }

    return { allowed: true, limit: numericLimit };
}

/**
 * Get the user's effective tier based on subscription status
 */
export function getEffectiveTier(
    isPremium: boolean,
    premiumTier: string | null,
    premiumExpiresAt: Date | null
): PremiumTier {
    if (!isPremium || !premiumTier) {
        return "free";
    }

    // Check if premium has expired
    if (premiumExpiresAt && new Date(premiumExpiresAt) < new Date()) {
        return "free";
    }

    if (["basic", "pro", "enterprise"].includes(premiumTier)) {
        return premiumTier as PremiumTier;
    }

    return "free";
}

/**
 * Get upgrade suggestion for a user
 */
export function getUpgradeSuggestion(
    currentTier: PremiumTier,
    blockedFeatureId?: string
): { suggestedTier: PremiumTier; reason: string } | null {
    if (currentTier === "enterprise") {
        return null; // Already at max tier
    }

    const tierOrder: PremiumTier[] = ["free", "basic", "pro", "enterprise"];
    const currentIndex = tierOrder.indexOf(currentTier);

    if (blockedFeatureId) {
        const feature = PREMIUM_FEATURES.find(f => f.id === blockedFeatureId);
        if (feature) {
            const requiredIndex = tierOrder.indexOf(feature.requiredTier);
            if (requiredIndex > currentIndex) {
                return {
                    suggestedTier: feature.requiredTier,
                    reason: `Upgrade to ${TIER_BENEFITS[feature.requiredTier].name} to unlock ${feature.name}`,
                };
            }
        }
    }

    // Default suggestion: next tier up
    const nextTier = tierOrder[currentIndex + 1] as PremiumTier;
    return {
        suggestedTier: nextTier,
        reason: `Upgrade to ${TIER_BENEFITS[nextTier].name} for more features`,
    };
}
