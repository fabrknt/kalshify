'use client';

import Link from 'next/link';
import { Plus, Edit, Eye, Trash2, Building2 } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/stats-card';
import { getMockListings } from '@/lib/mock-data';
import { formatUSD, formatNumber, formatDate } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

const statusColors = {
  active: 'bg-green-100 text-green-800',
  under_offer: 'bg-yellow-100 text-yellow-800',
  sold: 'bg-muted text-gray-800',
  withdrawn: 'bg-red-100 text-red-800',
};

export default function SellerDashboardPage() {
  // In production, filter by current user's wallet
  // For demo, we'll show first 3 listings as "my listings"
  const allListings = getMockListings();
  const myListings = allListings.slice(0, 3);

  const activeListings = myListings.filter((l) => l.status === 'active').length;
  const totalValue = myListings.reduce((sum, l) => l.askingPrice, 0);
  const underOffer = myListings.filter((l) => l.status === 'under_offer').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Listings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your project listings and track buyer interest
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatsCard
          title="Active Listings"
          value={activeListings}
          icon={Eye}
          trend="up"
          change={0}
        />
        <StatsCard title="Total Value" value={formatUSD(totalValue)} icon={Plus} />
        <StatsCard
          title="Under Offer"
          value={underOffer}
          icon={Edit}
          trend={underOffer > 0 ? 'up' : undefined}
        />
      </div>

      {/* Actions */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground/75">
            Showing {myListings.length} {myListings.length === 1 ? 'listing' : 'listings'}
          </p>
        </div>

        <button className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">
          <Plus className="h-4 w-4" />
          New Listing
        </button>
      </div>

      {/* Listings Table */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground/75">
                Project
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground/75">
                Asking Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground/75">
                Revenue
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground/75">
                MAU
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground/75">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground/75">
                Listed
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground/75">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-card">
            {myListings.map((listing) => (
              <tr key={listing.id} className="hover:bg-muted">
                <td className="whitespace-nowrap px-6 py-4">
                  <div>
                    <div className="font-medium text-foreground">{listing.projectName}</div>
                    <div className="text-sm text-muted-foreground/75 capitalize">
                      {listing.category}
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">
                  {formatUSD(listing.askingPrice)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-foreground">
                  {formatUSD(listing.revenue)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-foreground">
                  {formatNumber(listing.mau)}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2 py-1 text-xs font-semibold',
                      statusColors[listing.status]
                    )}
                  >
                    {listing.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground/75">
                  {formatDate(listing.createdAt)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/marketplace/${listing.id}`}
                      className="text-green-600 hover:text-green-900"
                      title="View"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <button className="text-blue-600 hover:text-blue-900" title="Edit">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {myListings.length === 0 && (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No listings yet</h3>
          <p className="mt-2 text-sm text-muted-foreground/75">
            Get started by creating your first listing.
          </p>
          <button className="mt-6 flex items-center gap-2 mx-auto rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">
            <Plus className="h-4 w-4" />
            Create Listing
          </button>
        </div>
      )}

      {/* Buyer Interest (Placeholder) */}
      {myListings.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-bold text-foreground">Recent Activity</h2>
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <p className="font-medium text-foreground">New data room request</p>
                  <p className="text-sm text-muted-foreground/75">
                    For "{myListings[0].projectName}"
                  </p>
                </div>
                <span className="text-xs text-muted-foreground/75">2 hours ago</span>
              </div>

              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <p className="font-medium text-foreground">Offer submitted</p>
                  <p className="text-sm text-muted-foreground/75">
                    For "{myListings[1]?.projectName || myListings[0].projectName}"
                  </p>
                </div>
                <span className="text-xs text-muted-foreground/75">1 day ago</span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Call scheduled</p>
                  <p className="text-sm text-muted-foreground/75">
                    For "{myListings[0].projectName}"
                  </p>
                </div>
                <span className="text-xs text-muted-foreground/75">3 days ago</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
