'use client';

import Link from 'next/link';
import { Building2, TrendingUp, Users, DollarSign, Shield } from 'lucide-react';
import { Listing } from '@/lib/mock-data';
import { formatUSD, formatNumber, truncateAddress } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

interface ListingCardProps {
  listing: Listing;
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  under_offer: 'bg-yellow-100 text-yellow-800',
  sold: 'bg-muted text-gray-800',
  withdrawn: 'bg-red-100 text-red-800',
};

const categoryIcons = {
  defi: DollarSign,
  nft: Building2,
  gaming: Users,
  infrastructure: Shield,
  dao: Users,
};

export function ListingCard({ listing }: ListingCardProps) {
  const CategoryIcon = categoryIcons[listing.category];
  const fabrkntScore = listing.suiteData?.fabrknt_score || 0;

  // Color code the Fabrknt Score
  const scoreColor =
    fabrkntScore >= 80
      ? 'text-green-600 bg-green-50'
      : fabrkntScore >= 60
      ? 'text-yellow-600 bg-yellow-50'
      : 'text-red-600 bg-red-50';

  return (
    <div className="group rounded-lg border border-border bg-card p-6 transition-all hover:border-green-300 hover:shadow-lg">
      <Link href={`/dashboard/marketplace/${listing.id}`} className="block">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2">
              <CategoryIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground group-hover:text-green-600">
                {listing.projectName}
              </h3>
              <p className="text-sm text-muted-foreground/75 capitalize">
                {listing.category} • {listing.chain}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <span
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium',
              statusColors[listing.status]
            )}
          >
            {listing.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        {/* Description */}
        <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">
          {listing.description}
        </p>

        {/* Metrics Grid */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground/75">Asking Price</p>
            <p className="mt-1 text-lg font-bold text-foreground">
              {formatUSD(listing.askingPrice)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground/75">Revenue (ARR)</p>
            <p className="mt-1 text-lg font-bold text-foreground">
              {formatUSD(listing.revenue)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground/75">MAU</p>
            <p className="mt-1 text-lg font-bold text-foreground">
              {formatNumber(listing.mau)}
            </p>
          </div>
        </div>

        {/* Fabrknt Score & Verification */}
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
          <div className="flex items-center gap-2">
            {listing.suiteData?.revenue_verified && (
              <div className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-1">
                <Shield className="h-3 w-3 text-green-600" />
                <span className="text-xs font-medium text-green-700">
                  Revenue Verified
                </span>
              </div>
            )}
            {listing.hasNDA && (
              <div className="rounded-full bg-muted px-2 py-1">
                <span className="text-xs font-medium text-foreground/90">NDA</span>
              </div>
            )}
          </div>

          {/* Fabrknt Score */}
          {listing.suiteData && (
            <div className={cn('rounded-lg px-3 py-1', scoreColor)}>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-bold">{fabrkntScore}</span>
                <span className="text-xs font-medium opacity-75">
                  Fabrknt Score
                </span>
              </div>
            </div>
          )}
        </div>
      </Link>

      {/* Seller - Outside Link to avoid nested anchors */}
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground/75">
        <span>Seller: {truncateAddress(listing.sellerWallet)}</span>
        {listing.website && (
          <a
            href={listing.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:underline"
          >
            Visit Website →
          </a>
        )}
      </div>
    </div>
  );
}
