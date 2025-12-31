import Link from 'next/link';
import { Building2, DollarSign, TrendingUp, Users, ArrowRight } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/stats-card';
import { ListingCard } from '@/components/dashboard/listing-card';
import { getMockListings, calculateMarketplaceStats } from '@/lib/mock-data';

export default function DashboardPage() {
  const stats = calculateMarketplaceStats();
  const listings = getMockListings();
  const activeListings = listings.filter((l) => l.status === 'active');
  const featuredListings = activeListings.slice(0, 3); // Top 3 active listings

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Marketplace Overview</h1>
        <p className="text-muted-foreground mt-2">
          Discover verified Web3 projects with proven team vitality and growth signals
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Listings"
          value={stats.totalListings}
          icon={Building2}
          trend="up"
          change={12}
        />
        <StatsCard
          title="Active Listings"
          value={stats.activeListings}
          icon={TrendingUp}
          trend="up"
          change={8}
        />
        <StatsCard
          title="Total Value"
          value={`$${(stats.totalValue / 1000000).toFixed(1)}M`}
          icon={DollarSign}
          trend="up"
          change={15}
        />
        <StatsCard
          title="Avg Fabrknt Score"
          value={stats.avgFabrkntScore}
          icon={Users}
          trend="up"
          change={3}
        />
      </div>

      {/* Featured Listings */}
      <div className="mt-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Featured Listings</h2>
            <p className="text-sm text-muted-foreground/75">
              Top active projects with verified signals
            </p>
          </div>
          <Link
            href="/dashboard/marketplace"
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
          >
            View All Listings
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {featuredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Revenue Breakdown */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-lg font-bold text-foreground">Marketplace Metrics</h3>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Revenue</span>
              <span className="font-bold text-foreground">
                ${(stats.totalRevenue / 1000000).toFixed(1)}M ARR
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total MAU</span>
              <span className="font-bold text-foreground">
                {(stats.totalMAU / 1000).toFixed(0)}K Users
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Verified Listings</span>
              <span className="font-bold text-green-600">
                {listings.filter((l) => l.suiteData?.revenue_verified).length}/{stats.totalListings}
              </span>
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-lg font-bold text-foreground">Category Distribution</h3>
          <div className="mt-4 space-y-4">
            {['defi', 'gaming', 'dao', 'nft', 'infrastructure'].map((category) => {
              const count = listings.filter((l) => l.category === category).length;
              const percentage = (count / stats.totalListings) * 100;
              return (
                <div key={category}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize text-muted-foreground">{category}</span>
                    <span className="font-medium text-foreground">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-green-600"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
