import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

// GET - Fetch user's allocation history
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const limit = parseInt(searchParams.get("limit") || "10");
        const activeOnly = searchParams.get("activeOnly") === "true";

        const where: Prisma.UserAllocationHistoryWhereInput = {
            userId: session.user.id,
        };

        if (activeOnly) {
            where.isActive = true;
        }

        const history = await prisma.userAllocationHistory.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take: limit,
        });

        // Get the current active allocation
        const activeAllocation = await prisma.userAllocationHistory.findFirst({
            where: {
                userId: session.user.id,
                isActive: true,
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({
            success: true,
            data: {
                history,
                activeAllocation,
                totalCount: await prisma.userAllocationHistory.count({
                    where: { userId: session.user.id },
                }),
            },
        });
    } catch (error) {
        console.error("Error fetching allocation history:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch allocation history" },
            { status: 500 }
        );
    }
}

// POST - Save a new allocation
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
        const { riskTolerance, amount, allocations, expectedApy, weightedRiskScore, notes } = body;

        if (!riskTolerance || !amount || !allocations) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Deactivate previous active allocations
        await prisma.userAllocationHistory.updateMany({
            where: {
                userId: session.user.id,
                isActive: true,
            },
            data: {
                isActive: false,
            },
        });

        // Create new allocation
        const newAllocation = await prisma.userAllocationHistory.create({
            data: {
                userId: session.user.id,
                riskTolerance,
                amount,
                allocations: allocations as unknown as Prisma.InputJsonValue,
                expectedApy,
                weightedRiskScore,
                notes,
                isActive: true,
            },
        });

        return NextResponse.json({
            success: true,
            data: newAllocation,
        });
    } catch (error) {
        console.error("Error saving allocation:", error);
        return NextResponse.json(
            { success: false, error: "Failed to save allocation" },
            { status: 500 }
        );
    }
}

// DELETE - Remove an allocation from history
export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { success: false, error: "Missing allocation ID" },
                { status: 400 }
            );
        }

        // Verify ownership
        const allocation = await prisma.userAllocationHistory.findFirst({
            where: {
                id,
                userId: session.user.id,
            },
        });

        if (!allocation) {
            return NextResponse.json(
                { success: false, error: "Allocation not found" },
                { status: 404 }
            );
        }

        await prisma.userAllocationHistory.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: "Allocation deleted",
        });
    } catch (error) {
        console.error("Error deleting allocation:", error);
        return NextResponse.json(
            { success: false, error: "Failed to delete allocation" },
            { status: 500 }
        );
    }
}

// PATCH - Update an allocation (e.g., reactivate or add notes)
export async function PATCH(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { id, notes, setActive } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: "Missing allocation ID" },
                { status: 400 }
            );
        }

        // Verify ownership
        const allocation = await prisma.userAllocationHistory.findFirst({
            where: {
                id,
                userId: session.user.id,
            },
        });

        if (!allocation) {
            return NextResponse.json(
                { success: false, error: "Allocation not found" },
                { status: 404 }
            );
        }

        // If setting as active, deactivate others first
        if (setActive) {
            await prisma.userAllocationHistory.updateMany({
                where: {
                    userId: session.user.id,
                    isActive: true,
                },
                data: {
                    isActive: false,
                },
            });
        }

        const updateData: Prisma.UserAllocationHistoryUpdateInput = {};
        if (notes !== undefined) updateData.notes = notes;
        if (setActive !== undefined) updateData.isActive = setActive;

        const updated = await prisma.userAllocationHistory.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({
            success: true,
            data: updated,
        });
    } catch (error) {
        console.error("Error updating allocation:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update allocation" },
            { status: 500 }
        );
    }
}
