import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/users/[address]
 * Fetch or create user by wallet address
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ address: string }> }
) {
    try {
        const { address } = await params;

        // Validate address format (basic check)
        if (!address || address.length < 10) {
            return NextResponse.json(
                { error: "Invalid wallet address" },
                { status: 400 }
            );
        }

        // Find or create user
        let user = await prisma.user.findUnique({
            where: { walletAddress: address.toLowerCase() },
            select: {
                id: true,
                walletAddress: true,
                displayName: true,
                email: true,
                bio: true,
                website: true,
                twitter: true,
                createdAt: true,
                lastLoginAt: true,
            },
        });

        if (!user) {
            // Auto-create user on first connection
            user = await prisma.user.create({
                data: {
                    walletAddress: address.toLowerCase(),
                    displayName:
                        address.slice(0, 6) + "..." + address.slice(-4), // Default display name
                    lastLoginAt: new Date(),
                },
                select: {
                    id: true,
                    walletAddress: true,
                    displayName: true,
                    email: true,
                    bio: true,
                    website: true,
                    twitter: true,
                    createdAt: true,
                    lastLoginAt: true,
                },
            });
        } else {
            // Update last login
            await prisma.user.update({
                where: { walletAddress: address.toLowerCase() },
                data: { lastLoginAt: new Date() },
            });
        }

        return NextResponse.json(user);
    } catch (error) {
        const { address } = await params;
        console.error(`GET /api/users/${address} error:`, error);
        return NextResponse.json(
            { error: "Failed to fetch user" },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/users/[address]
 * Update user profile
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ address: string }> }
) {
    try {
        const { address } = await params;
        const body = await request.json();

        // Validate address
        if (!address || address.length < 10) {
            return NextResponse.json(
                { error: "Invalid wallet address" },
                { status: 400 }
            );
        }

        // Verify user exists
        const existingUser = await prisma.user.findUnique({
            where: { walletAddress: address.toLowerCase() },
        });

        if (!existingUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Update user
        const user = await prisma.user.update({
            where: { walletAddress: address.toLowerCase() },
            data: {
                displayName: body.displayName,
                email: body.email,
                bio: body.bio,
                website: body.website,
                twitter: body.twitter,
                updatedAt: new Date(),
            },
            select: {
                id: true,
                walletAddress: true,
                displayName: true,
                email: true,
                bio: true,
                website: true,
                twitter: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return NextResponse.json(user);
    } catch (error) {
        const { address } = await params;
        console.error(`PUT /api/users/${address} error:`, error);
        return NextResponse.json(
            { error: "Failed to update user" },
            { status: 500 }
        );
    }
}
