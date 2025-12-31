'use client';

import { useState } from 'react';
import { Filter } from 'lucide-react';
import { ListingCard } from '@/components/dashboard/listing-card';
import { getMockListings, Listing } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

type CategoryFilter = 'all' | Listing['category'];
type StatusFilter = 'all' | Listing['status'];

const categories: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'defi', label: 'DeFi' },
  { value: 'nft', label: 'NFT' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'dao', label: 'DAO' },
];

const statuses: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'under_offer', label: 'Under Offer' },
  { value: 'sold', label: 'Sold' },
  { value: 'withdrawn', label: 'Withdrawn' },
];

export default function MarketplacePage() {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<'price' | 'revenue' | 'score'>('score');

  const listings = getMockListings();

  // Filter listings
  const filteredListings = listings.filter((listing) => {
    const categoryMatch = categoryFilter === 'all' || listing.category === categoryFilter;
    const statusMatch = statusFilter === 'all' || listing.status === statusFilter;
    return categoryMatch && statusMatch;
  });

  // Sort listings
  const sortedListings = [...filteredListings].sort((a, b) => {
    if (sortBy === 'price') return b.askingPrice - a.askingPrice;
    if (sortBy === 'revenue') return b.revenue - a.revenue;
    if (sortBy === 'score')
      return (b.suiteData?.fabrknt_score || 0) - (a.suiteData?.fabrknt_score || 0);
    return 0;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Marketplace</h1>
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Category Filter */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground/90">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
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
            <label className="mb-2 block text-sm font-medium text-foreground/90">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
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
            <label className="mb-2 block text-sm font-medium text-foreground/90">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'price' | 'revenue' | 'score')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="score">Fabrknt Score</option>
              <option value="price">Asking Price</option>
              <option value="revenue">Revenue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-semibold">{sortedListings.length}</span>{' '}
          {sortedListings.length === 1 ? 'listing' : 'listings'}
        </p>
      </div>

      {/* Listings Grid */}
      {sortedListings.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground/75">No listings found matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {sortedListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
