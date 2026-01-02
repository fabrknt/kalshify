"use client";

import { useState, useEffect } from "react";
import { Filter } from "lucide-react";
import { ListingCard } from "@/components/dashboard/listing-card";
import { Listing } from "@/lib/mock-data";

type CategoryFilter = "all" | Listing["category"];
type StatusFilter = "all" | Listing["status"];
type TypeFilter = "all" | "ma" | "partnership";

const categories: { value: CategoryFilter; label: string }[] = [
    { value: "all", label: "All Categories" },
    { value: "defi", label: "DeFi" },
    { value: "nft", label: "NFT" },
    { value: "gaming", label: "Gaming" },
    { value: "infrastructure", label: "Infrastructure" },
    { value: "dao", label: "DAO" },
];

const statuses: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All Statuses" },
    { value: "active", label: "Active" },
    { value: "under_offer", label: "Under Offer" },
    { value: "sold", label: "Sold" },
    { value: "withdrawn", label: "Withdrawn" },
];

const types: { value: TypeFilter; label: string }[] = [
    { value: "all", label: "All Types" },
    { value: "ma", label: "M&A (Acquisition/Investment)" },
    { value: "partnership", label: "Partnership/Collaboration" },
];

export default function MarketplacePage() {
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
    const [sortBy, setSortBy] = useState<"price" | "revenue" | "score">(
        "score"
    );
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchListings() {
            try {
                setLoading(true);
                const response = await fetch("/api/listings?status=active");
                if (!response.ok) {
                    throw new Error("Failed to fetch listings");
                }
                const data = await response.json();

                // Transform API response to match Listing interface
                const transformedListings: Listing[] = data.listings.map(
                    (listing: any) => ({
                        id: listing.id,
                        type: listing.type,
                        projectName: listing.projectName,
                        productType: listing.productType,
                        description: listing.description,
                        askingPrice: listing.askingPrice
                            ? Number(listing.askingPrice)
                            : undefined,
                        revenue: Number(listing.revenue),
                        mau: listing.mau,
                        seekingPartners: listing.seekingPartners || undefined,
                        offeringCapabilities:
                            listing.offeringCapabilities || undefined,
                        partnershipType: listing.partnershipType || undefined,
                        category: listing.category,
                        status: listing.status,
                        sellerWallet: listing.seller?.walletAddress || "",
                        createdAt: listing.createdAt,
                        suiteData: listing.suiteDataSnapshot
                            ? {
                                  pulse: listing.suiteDataSnapshot.pulse,
                                  trace: listing.suiteDataSnapshot.trace,
                                  revenue_verified:
                                      listing.suiteDataSnapshot
                                          .revenue_verified,
                                  fabrknt_score:
                                      listing.suiteDataSnapshot.fabrknt_score,
                              }
                            : undefined,
                        chain: listing.chain,
                        website: listing.website || undefined,
                        hasNDA: listing.hasNDA,
                        requiresProofOfFunds:
                            listing.requiresProofOfFunds || undefined,
                        minBuyerCapital: listing.minBuyerCapital
                            ? Number(listing.minBuyerCapital)
                            : undefined,
                    })
                );

                setListings(transformedListings);
                setError(null);
            } catch (err) {
                console.error("Error fetching listings:", err);
                setError("Failed to load listings. Please try again later.");
            } finally {
                setLoading(false);
            }
        }

        fetchListings();
    }, []);

    // Filter listings
    const filteredListings = listings.filter((listing) => {
        const categoryMatch =
            categoryFilter === "all" || listing.category === categoryFilter;
        const statusMatch =
            statusFilter === "all" || listing.status === statusFilter;

        // Type filter
        let typeMatch = true;
        if (typeFilter === "ma") {
            typeMatch =
                listing.type === "acquisition" || listing.type === "investment";
        } else if (typeFilter === "partnership") {
            typeMatch =
                listing.type === "partnership" ||
                listing.type === "collaboration";
        }

        return categoryMatch && statusMatch && typeMatch;
    });

    // Sort listings
    const sortedListings = [...filteredListings].sort((a, b) => {
        if (sortBy === "price")
            return (b.askingPrice || 0) - (a.askingPrice || 0);
        if (sortBy === "revenue") return b.revenue - a.revenue;
        if (sortBy === "score")
            return (
                (b.suiteData?.fabrknt_score || 0) -
                (a.suiteData?.fabrknt_score || 0)
            );
        return 0;
    });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground">
                    Marketplace
                </h1>
                <p className="text-muted-foreground mt-2">
                    Browse all verified Web3 projects available for acquisition
                </p>
            </div>

            {/* Filters */}
            <div className="mb-6 rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="h-5 w-5 text-muted-foreground/75" />
                    <h3 className="font-semibold text-foreground">Filters</h3>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Type Filter - PROMINENT */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-foreground/90">
                            Opportunity Type
                        </label>
                        <select
                            value={typeFilter}
                            onChange={(e) =>
                                setTypeFilter(e.target.value as TypeFilter)
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        >
                            {types.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Category Filter */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-foreground/90">
                            Category
                        </label>
                        <select
                            value={categoryFilter}
                            onChange={(e) =>
                                setCategoryFilter(
                                    e.target.value as CategoryFilter
                                )
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                        >
                            {categories.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-foreground/90">
                            Status
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(e.target.value as StatusFilter)
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                        >
                            {statuses.map((status) => (
                                <option key={status.value} value={status.value}>
                                    {status.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Sort By */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-foreground/90">
                            Sort By
                        </label>
                        <select
                            value={sortBy}
                            onChange={(e) =>
                                setSortBy(
                                    e.target.value as
                                        | "price"
                                        | "revenue"
                                        | "score"
                                )
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                        >
                            <option value="score">Fabrknt Score</option>
                            <option value="price">Asking Price</option>
                            <option value="revenue">Revenue</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="rounded-lg border border-border bg-card p-12 text-center">
                    <p className="text-muted-foreground/75">
                        Loading listings...
                    </p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {/* Results Count */}
            {!loading && !error && (
                <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing{" "}
                        <span className="font-semibold">
                            {sortedListings.length}
                        </span>{" "}
                        {sortedListings.length === 1 ? "listing" : "listings"}
                    </p>
                </div>
            )}

            {/* Listings Grid */}
            {!loading && !error && sortedListings.length === 0 && (
                <div className="rounded-lg border border-border bg-card p-12 text-center">
                    <p className="text-muted-foreground/75">
                        No listings found matching your filters.
                    </p>
                </div>
            )}

            {!loading && !error && sortedListings.length > 0 && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                    {sortedListings.map((listing) => (
                        <ListingCard key={listing.id} listing={listing} />
                    ))}
                </div>
            )}
        </div>
    );
}
