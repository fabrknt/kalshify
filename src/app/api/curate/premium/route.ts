import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
    TIER_BENEFITS,
    PREMIUM_FEATURES,
    getEffectiveTier,
    hasFeatureAccess,
    checkTierLimit,
    PremiumTier,
} from "@/lib/curate/premium";

// GET - Get user's premium status and available features
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        // Allow unauthenticated access to see tier info
        const searchParams = request.nextUrl.searchParams;
        const action = searchParams.get("action");

        // Return tier information for pricing page
        if (action === "tiers") {
            return NextResponse.json({
                success: true,
                data: {
                    tiers: Object.values(TIER_BENEFITS),
                    features: PREMIUM_FEATURES,
                },
            });
        }

        // User-specific data requires auth
        if (!session?.user?.id) {
            return NextResponse.json({
                success: true,
                data: {
                    tier: "free",
                    tierInfo: TIER_BENEFITS.free,
                    features: PREMIUM_FEATURES.map(f => ({
                        ...f,
                        hasAccess: f.requiredTier === "free",
                    })),
                },
            });
        }

        // Get user's premium status
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                isPremium: true,
                premiumTier: true,
                premiumExpiresAt: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

        const effectiveTier = getEffectiveTier(
            user.isPremium,
            user.premiumTier,
            user.premiumExpiresAt
        );

        // Get usage stats for limit checking
        const [allocationCount] = await Promise.all([
            prisma.userAllocationHistory.count({
                where: { userId: session.user.id },
            }),
        ]);

        const tierInfo = TIER_BENEFITS[effectiveTier];
        const allocationLimit = checkTierLimit(effectiveTier, "savedAllocations", allocationCount);

        return NextResponse.json({
            success: true,
            data: {
                tier: effectiveTier,
                tierInfo,
                isPremium: user.isPremium,
                expiresAt: user.premiumExpiresAt,
                features: PREMIUM_FEATURES.map(f => ({
                    ...f,
                    hasAccess: hasFeatureAccess(effectiveTier, f.id),
                })),
                usage: {
                    savedAllocations: {
                        current: allocationCount,
                        limit: allocationLimit.limit,
                        remaining: allocationLimit.remaining,
                    },
                },
            },
        });
    } catch (error) {
        console.error("Error fetching premium status:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch premium status" },
            { status: 500 }
        );
    }
}

// POST - Handle premium subscription actions (mock for now)
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { action, tier } = body;

        if (action === "subscribe") {
            // In production, this would integrate with Stripe
            // For now, we'll mock the subscription
            if (!["basic", "pro", "enterprise"].includes(tier)) {
                return NextResponse.json(
                    { success: false, error: "Invalid tier" },
                    { status: 400 }
                );
            }

            // Calculate expiry (1 month from now for monthly)
            const expiresAt = new Date();
            expiresAt.setMonth(expiresAt.getMonth() + 1);

            await prisma.user.update({
                where: { id: session.user.id },
                data: {
                    isPremium: true,
                    premiumTier: tier,
                    premiumExpiresAt: expiresAt,
                },
            });

            return NextResponse.json({
                success: true,
                message: `Subscribed to ${tier} tier`,
                data: {
                    tier,
                    expiresAt,
                },
            });
        }

        if (action === "cancel") {
            await prisma.user.update({
                where: { id: session.user.id },
                data: {
                    isPremium: false,
                    premiumTier: null,
                    premiumExpiresAt: null,
                },
            });

            return NextResponse.json({
                success: true,
                message: "Subscription cancelled",
            });
        }

        return NextResponse.json(
            { success: false, error: "Invalid action" },
            { status: 400 }
        );
    } catch (error) {
        console.error("Error processing premium action:", error);
        return NextResponse.json(
            { success: false, error: "Failed to process request" },
            { status: 500 }
        );
    }
}
