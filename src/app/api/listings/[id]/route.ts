import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { UpdateListingSchema } from "@/lib/schemas/listing";
import { Prisma } from "@prisma/client";

/**
 * GET /api/listings/[id]
 * Fetch a single listing by ID
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const listing = await prisma.listing.findUnique({
            where: { id },
            include: {
                seller: {
                    select: {
                        id: true,
                        walletAddress: true,
                        displayName: true,
                        website: true,
                        twitter: true,
                    },
                },
                offers: {
                    select: {
                        id: true,
                        status: true,
                        createdAt: true,
                        buyer: {
                            select: {
                                id: true,
                                walletAddress: true,
                                displayName: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                },
                dataRoomRequests: {
                    select: {
                        id: true,
                        status: true,
                        createdAt: true,
                        requester: {
                            select: {
                                id: true,
                                walletAddress: true,
                                displayName: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                },
                documents: {
                    where: {
                        requiresDataRoomAccess: false, // Only public documents
                    },
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        createdAt: true,
                    },
                },
                _count: {
                    select: {
                        offers: true,
                        dataRoomRequests: true,
                        watchlist: true,
                    },
                },
            },
        });

        if (!listing) {
            return NextResponse.json(
                { error: "Listing not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(listing);
    } catch (error) {
        const { id } = await params;
        console.error(`GET /api/listings/${id} error:`, error);
        return NextResponse.json(
            { error: "Failed to fetch listing" },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/listings/[id]
 * Update a listing
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Validate with Zod
        const validationResult = UpdateListingSchema.safeParse({
            ...body,
            id: id,
        });

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: "Validation failed",
                    details: validationResult.error.format(),
                },
                { status: 400 }
            );
        }

        const data = validationResult.data;

        // Verify listing exists and check ownership
        const existingListing = await prisma.listing.findUnique({
            where: { id: id },
            select: { sellerId: true },
        });

        if (!existingListing) {
            return NextResponse.json(
                { error: "Listing not found" },
                { status: 404 }
            );
        }

        // Check ownership (placeholder - will use actual auth)
        const requesterId = body.requesterId; // From auth
        if (requesterId && existingListing.sellerId !== requesterId) {
            return NextResponse.json(
                { error: "Unauthorized - you can only edit your own listings" },
                { status: 403 }
            );
        }

        // Prepare update data
        const updateData: Prisma.ListingUpdateInput = {
            updatedAt: new Date(),
        };

        // Update fields if provided
        if (data.projectName !== undefined)
            updateData.projectName = data.projectName;
        if (data.productType !== undefined)
            updateData.productType = data.productType;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.category !== undefined) updateData.category = data.category;
        if (data.chain !== undefined) updateData.chain = data.chain;
        if (data.website !== undefined)
            updateData.website = data.website || null;

        if (data.revenue !== undefined)
            updateData.revenue = new Prisma.Decimal(data.revenue);
        if (data.mau !== undefined) updateData.mau = data.mau;
        if (data.askingPrice !== undefined) {
            updateData.askingPrice = data.askingPrice
                ? new Prisma.Decimal(data.askingPrice)
                : null;
        }

        if ((data as any).seekingPartners !== undefined) {
            updateData.seekingPartners = (data as any).seekingPartners;
        }
        if ((data as any).offeringCapabilities !== undefined) {
            updateData.offeringCapabilities = (
                data as any
            ).offeringCapabilities;
        }
        if ((data as any).partnershipType !== undefined) {
            updateData.partnershipType = (data as any).partnershipType || null;
        }

        if (data.hasNDA !== undefined) updateData.hasNDA = data.hasNDA;
        if (data.requiresProofOfFunds !== undefined) {
            updateData.requiresProofOfFunds = data.requiresProofOfFunds;
        }
        if (data.minBuyerCapital !== undefined) {
            updateData.minBuyerCapital = data.minBuyerCapital
                ? new Prisma.Decimal(data.minBuyerCapital)
                : null;
        }

        if (data.indexCompanyId !== undefined) {
            updateData.indexCompanyId = data.indexCompanyId || null;
        }
        if (data.suiteDataSnapshot !== undefined) {
            updateData.suiteDataSnapshot = data.suiteDataSnapshot || null;
        }

        if (data.status !== undefined) updateData.status = data.status;

        // Update listing
        const listing = await prisma.listing.update({
            where: { id: id },
            data: updateData,
            include: {
                seller: {
                    select: {
                        id: true,
                        walletAddress: true,
                        displayName: true,
                    },
                },
            },
        });

        return NextResponse.json(listing);
    } catch (error) {
        const { id } = await params;
        console.error(`PUT /api/listings/${id} error:`, error);

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return NextResponse.json(
                    { error: "Listing not found" },
                    { status: 404 }
                );
            }
        }

        return NextResponse.json(
            { error: "Failed to update listing" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/listings/[id]
 * Delete (soft delete by setting status to 'withdrawn') a listing
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const hardDelete = searchParams.get("hard") === "true";

        // Verify listing exists and check ownership
        const existingListing = await prisma.listing.findUnique({
            where: { id: id },
            select: { sellerId: true },
        });

        if (!existingListing) {
            return NextResponse.json(
                { error: "Listing not found" },
                { status: 404 }
            );
        }

        // Check ownership (placeholder - will use actual auth)
        const requesterId = searchParams.get("requesterId"); // From auth
        if (requesterId && existingListing.sellerId !== requesterId) {
            return NextResponse.json(
                {
                    error: "Unauthorized - you can only delete your own listings",
                },
                { status: 403 }
            );
        }

        if (hardDelete) {
            // Hard delete (permanently remove)
            await prisma.listing.delete({
                where: { id: id },
            });

            return NextResponse.json({
                message: "Listing permanently deleted",
            });
        } else {
            // Soft delete (set status to withdrawn)
            const listing = await prisma.listing.update({
                where: { id: id },
                data: {
                    status: "withdrawn",
                    updatedAt: new Date(),
                },
            });

            return NextResponse.json(listing);
        }
    } catch (error) {
        const { id } = await params;
        console.error(`DELETE /api/listings/${id} error:`, error);

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return NextResponse.json(
                    { error: "Listing not found" },
                    { status: 404 }
                );
            }
        }

        return NextResponse.json(
            { error: "Failed to delete listing" },
            { status: 500 }
        );
    }
}
