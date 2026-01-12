import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET - List user's vaults
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        // Return empty array if not authenticated (vaults page doesn't require sign-in)
        if (!session?.user?.id) {
            return NextResponse.json({ vaults: [] });
        }

        const searchParams = request.nextUrl.searchParams;
        const chainIdParam = searchParams.get("chainId");

        // Build query filter
        const where: { userId: string; chainId?: number } = {
            userId: session.user.id,
        };

        if (chainIdParam) {
            where.chainId = parseInt(chainIdParam, 10);
        }

        const vaults = await prisma.morphoVault.findMany({
            where,
            include: {
                allocations: true,
            },
            orderBy: {
                deployedAt: "desc",
            },
        });

        return NextResponse.json({ vaults });
    } catch (error) {
        console.error("Error fetching user vaults:", error);
        return NextResponse.json(
            { error: "Failed to fetch vaults" },
            { status: 500 }
        );
    }
}

// POST - Record a new vault deployment
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const {
            chainId,
            vaultAddress,
            factoryVersion,
            asset,
            assetSymbol,
            name,
            symbol,
            txHash,
            curatorAddress,
            performanceFee,
            managementFee,
        } = body;

        // Validate required fields
        if (!chainId || !vaultAddress || !asset || !assetSymbol || !name || !symbol) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Check if vault already exists
        const existingVault = await prisma.morphoVault.findUnique({
            where: { vaultAddress },
        });

        if (existingVault) {
            return NextResponse.json(
                { error: "Vault already registered" },
                { status: 409 }
            );
        }

        // Create vault record
        const vault = await prisma.morphoVault.create({
            data: {
                userId: session.user.id,
                chainId,
                vaultAddress: vaultAddress.toLowerCase(),
                factoryVersion: factoryVersion || "v1.1",
                asset: asset.toLowerCase(),
                assetSymbol,
                name,
                symbol,
                txHash,
                curatorAddress: curatorAddress?.toLowerCase(),
                performanceFee: performanceFee || 0,
                managementFee: managementFee || 0,
            },
        });

        return NextResponse.json({ vault }, { status: 201 });
    } catch (error) {
        console.error("Error creating vault:", error);
        return NextResponse.json(
            { error: "Failed to create vault" },
            { status: 500 }
        );
    }
}

// PATCH - Update vault info (sync TVL, allocations, etc.)
export async function PATCH(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { vaultAddress, tvl, totalEarned, curatorAddress, performanceFee, managementFee } = body;

        if (!vaultAddress) {
            return NextResponse.json(
                { error: "vaultAddress is required" },
                { status: 400 }
            );
        }

        // Find and verify ownership
        const existingVault = await prisma.morphoVault.findUnique({
            where: { vaultAddress: vaultAddress.toLowerCase() },
        });

        if (!existingVault) {
            return NextResponse.json(
                { error: "Vault not found" },
                { status: 404 }
            );
        }

        if (existingVault.userId !== session.user.id) {
            return NextResponse.json(
                { error: "Not authorized to update this vault" },
                { status: 403 }
            );
        }

        // Update vault
        const updateData: Record<string, unknown> = {
            lastSyncedAt: new Date(),
        };

        if (tvl !== undefined) updateData.tvl = tvl;
        if (totalEarned !== undefined) updateData.totalEarned = totalEarned;
        if (curatorAddress !== undefined) updateData.curatorAddress = curatorAddress?.toLowerCase();
        if (performanceFee !== undefined) updateData.performanceFee = performanceFee;
        if (managementFee !== undefined) updateData.managementFee = managementFee;

        const vault = await prisma.morphoVault.update({
            where: { vaultAddress: vaultAddress.toLowerCase() },
            data: updateData,
            include: {
                allocations: true,
            },
        });

        return NextResponse.json({ vault });
    } catch (error) {
        console.error("Error updating vault:", error);
        return NextResponse.json(
            { error: "Failed to update vault" },
            { status: 500 }
        );
    }
}
