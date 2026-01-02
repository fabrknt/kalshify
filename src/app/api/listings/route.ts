import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { CreateListingSchema } from "@/lib/schemas/listing";
import { Prisma } from "@prisma/client";

/**
 * GET /api/listings
 * Query params:
 * - type: 'acquisition' | 'partnership' | 'collaboration' | 'investment'
 * - category: 'defi' | 'nft' | 'gaming' | 'infrastructure' | 'dao'
 * - status: 'active' | 'under_offer' | 'sold' | 'withdrawn' | 'in_discussion'
 * - sellerId: string
 * - limit: number (default 20)
 * - offset: number (default 0)
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const type = searchParams.get("type");
        const category = searchParams.get("category");
        const status = searchParams.get("status") || "active";
        const sellerId = searchParams.get("sellerId");
        const limit = parseInt(searchParams.get("limit") || "20");
        const offset = parseInt(searchParams.get("offset") || "0");

        // Build where clause
        const where: Prisma.ListingWhereInput = {};

        if (type) where.type = type;
        if (category) where.category = category;
        if (status) where.status = status;
        if (sellerId) where.sellerId = sellerId;

        // Fetch listings with seller info
        const [listings, total] = await Promise.all([
            prisma.listing.findMany({
                where,
                include: {
                    seller: {
                        select: {
                            id: true,
                            walletAddress: true,
                            displayName: true,
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
                orderBy: {
                    createdAt: "desc",
                },
                take: limit,
                skip: offset,
            }),
            prisma.listing.count({ where }),
        ]);

        return NextResponse.json({
            listings,
            total,
            limit,
            offset,
        });
    } catch (error) {
        console.error("GET /api/listings error:", error);
        return NextResponse.json(
            { error: "Failed to fetch listings" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/listings
 * Create a new listing
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate with Zod
        const validationResult = CreateListingSchema.safeParse(body);

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

        // Get seller ID from auth (placeholder - will be replaced with actual auth)
        // For now, we'll require it in the request body
        const sellerId = body.sellerId;

        if (!sellerId) {
            return NextResponse.json(
                { error: "Seller ID required (authentication needed)" },
                { status: 401 }
            );
        }

        // Verify seller exists
        const seller = await prisma.user.findUnique({
            where: { id: sellerId },
        });

        if (!seller) {
            return NextResponse.json(
                { error: "Seller not found" },
                { status: 404 }
            );
        }

        // Create listing
        const listing = await prisma.listing.create({
            data: {
                type: data.type,
                projectName: data.projectName,
                productType: data.productType,
                description: data.description,
                category: data.category,
                chain: data.chain,
                website: data.website || null,

                // M&A fields (only for acquisition/investment types)
                ...(data.type === "acquisition" || data.type === "investment"
                    ? {
                          askingPrice: (data as any).askingPrice
                              ? new Prisma.Decimal((data as any).askingPrice)
                              : null,
                      }
                    : {}),
                revenue: new Prisma.Decimal(data.revenue),
                mau: data.mau,

                // Partnership fields (only for partnership/collaboration types)
                ...(data.type === "partnership" || data.type === "collaboration"
                    ? {
                          seekingPartners: (data as any).seekingPartners || [],
                          offeringCapabilities:
                              (data as any).offeringCapabilities || [],
                          partnershipType:
                              (data as any).partnershipType || null,
                      }
                    : {}),

                // Deal terms
                hasNDA: data.hasNDA ?? false,
                requiresProofOfFunds: data.requiresProofOfFunds ?? false,
                minBuyerCapital: data.minBuyerCapital
                    ? new Prisma.Decimal(data.minBuyerCapital)
                    : null,

                // Intelligence link
                intelligenceCompanyId: data.intelligenceCompanyId || null,
                suiteDataSnapshot: data.suiteDataSnapshot || undefined,

                // Seller
                sellerId,

                // Status
                status: "active",
                publishedAt: new Date(),
            },
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

        return NextResponse.json(listing, { status: 201 });
    } catch (error) {
        console.error("POST /api/listings error:", error);

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                return NextResponse.json(
                    { error: "A listing with these details already exists" },
                    { status: 409 }
                );
            }
        }

        return NextResponse.json(
            { error: "Failed to create listing" },
            { status: 500 }
        );
    }
}
