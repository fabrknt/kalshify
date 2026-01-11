import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const preferences = await prisma.userYieldPreferences.findUnique({
            where: { userId: user.id },
        });

        if (!preferences) {
            // Return default preferences
            return NextResponse.json({
                riskTolerance: "moderate",
                preferredChains: [],
                minApy: 0,
                maxApy: 100,
                stablecoinOnly: false,
                maxAllocationUsd: null,
            });
        }

        return NextResponse.json({
            riskTolerance: preferences.riskTolerance,
            preferredChains: preferences.preferredChains,
            minApy: preferences.minApy,
            maxApy: preferences.maxApy,
            stablecoinOnly: preferences.stablecoinOnly,
            maxAllocationUsd: preferences.maxAllocationUsd,
        });
    } catch (error) {
        console.error("Failed to fetch preferences:", error);
        return NextResponse.json(
            { error: "Failed to fetch preferences" },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const {
            riskTolerance,
            preferredChains,
            minApy,
            maxApy,
            stablecoinOnly,
            maxAllocationUsd,
        } = body;

        // Validate
        if (riskTolerance && !["conservative", "moderate", "aggressive"].includes(riskTolerance)) {
            return NextResponse.json(
                { error: "Invalid risk tolerance" },
                { status: 400 }
            );
        }

        const preferences = await prisma.userYieldPreferences.upsert({
            where: { userId: user.id },
            update: {
                riskTolerance: riskTolerance || "moderate",
                preferredChains: preferredChains || [],
                minApy: minApy ?? 0,
                maxApy: maxApy ?? 100,
                stablecoinOnly: stablecoinOnly ?? false,
                maxAllocationUsd: maxAllocationUsd || null,
            },
            create: {
                userId: user.id,
                riskTolerance: riskTolerance || "moderate",
                preferredChains: preferredChains || [],
                minApy: minApy ?? 0,
                maxApy: maxApy ?? 100,
                stablecoinOnly: stablecoinOnly ?? false,
                maxAllocationUsd: maxAllocationUsd || null,
            },
        });

        return NextResponse.json({
            riskTolerance: preferences.riskTolerance,
            preferredChains: preferences.preferredChains,
            minApy: preferences.minApy,
            maxApy: preferences.maxApy,
            stablecoinOnly: preferences.stablecoinOnly,
            maxAllocationUsd: preferences.maxAllocationUsd,
        });
    } catch (error) {
        console.error("Failed to update preferences:", error);
        return NextResponse.json(
            { error: "Failed to update preferences" },
            { status: 500 }
        );
    }
}
