import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  Globe,
  Shield,
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  FileText,
} from 'lucide-react';
import { formatUSD, formatNumber, formatDate } from '@/lib/utils/format';
import { SuiteRibbon } from '@/components/suite-ribbon';
import { cn } from '@/lib/utils';
import { prisma } from '@/lib/db';

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  under_offer: 'bg-yellow-100 text-yellow-800',
  sold: 'bg-muted text-gray-800',
  withdrawn: 'bg-red-100 text-red-800',
  in_discussion: 'bg-blue-100 text-blue-800',
};

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch listing from database
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
    },
  });

  if (!listing) {
    notFound();
  }

  // Transform Prisma data to match component expectations
  const transformedListing = {
    ...listing,
    revenue: Number(listing.revenue),
    askingPrice: listing.askingPrice ? Number(listing.askingPrice) : null,
    minBuyerCapital: listing.minBuyerCapital ? Number(listing.minBuyerCapital) : null,
    sellerWallet: listing.seller.walletAddress,
    // Parse suiteDataSnapshot if it exists
    suiteData: listing.suiteDataSnapshot ? JSON.parse(JSON.stringify(listing.suiteDataSnapshot)) : null,
  };

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="p-8">
          <Link
            href="/synergy/opportunities"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Marketplace
          </Link>

          <div className="mt-4 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {transformedListing.projectName}
              </h1>
              <p className="text-lg text-muted-foreground mt-1">
                {transformedListing.productType}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-sm capitalize text-muted-foreground">
                  {transformedListing.category}
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-sm capitalize text-muted-foreground">
                  {transformedListing.chain}
                </span>
                <span className="text-gray-300">•</span>
                <span
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium',
                    statusColors[transformedListing.status]
                  )}
                >
                  {transformedListing.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>

            <div className="text-right">
              {transformedListing.askingPrice ? (
                <>
                  <p className="text-sm text-muted-foreground">Asking Price</p>
                  <p className="text-3xl font-bold text-green-600">
                    {formatUSD(transformedListing.askingPrice)}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">Opportunity Type</p>
                  <p className="text-3xl font-bold text-cyan-600 capitalize">
                    {transformedListing.type}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-xl font-bold text-foreground">About</h2>
              <p className="mt-4 text-foreground/90 leading-relaxed">
                {transformedListing.description}
              </p>
            </div>

            {/* Fabrknt Suite Verification */}
            {transformedListing.suiteData && (
              <SuiteRibbon
                listingId={transformedListing.id}
                data={{
                  pulse: transformedListing.suiteData.pulse,
                  trace: transformedListing.suiteData.trace,
                  revenue_verified: transformedListing.revenue, // Pass actual revenue value
                  fabrknt_score: transformedListing.suiteData.fabrknt_score,
                }}
              />
            )}

            {/* Key Metrics */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-xl font-bold text-foreground mb-6">
                Key Metrics
              </h2>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-muted-foreground">
                      Annual Recurring Revenue
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {formatUSD(transformedListing.revenue)}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-muted-foreground">
                      Monthly Active Users
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {formatNumber(transformedListing.mau)}
                  </p>
                </div>

                <div>
                  {transformedListing.askingPrice ? (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-5 w-5 text-gray-400" />
                        <span className="text-sm text-muted-foreground">Revenue Multiple</span>
                      </div>
                      <p className="text-2xl font-bold text-foreground">
                        {(transformedListing.askingPrice / transformedListing.revenue).toFixed(1)}x
                      </p>
                    </>
                  ) : transformedListing.partnershipType ? (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-5 w-5 text-gray-400" />
                        <span className="text-sm text-muted-foreground">Partnership Type</span>
                      </div>
                      <p className="text-2xl font-bold text-foreground capitalize">
                        {transformedListing.partnershipType}
                      </p>
                    </>
                  ) : null}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-muted-foreground">Listed Date</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {formatDate(transformedListing.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-xl font-bold text-foreground mb-6">
                Additional Information
              </h2>

              <div className="space-y-4">
                {transformedListing.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-muted-foreground">Website:</span>
                    <a
                      href={transformedListing.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-green-600 hover:underline"
                    >
                      {transformedListing.website}
                    </a>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-muted-foreground">Seller Wallet:</span>
                  <code className="text-sm font-mono text-foreground">
                    {transformedListing.sellerWallet}
                  </code>
                </div>

                {transformedListing.hasNDA && (
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-muted-foreground">NDA Required:</span>
                    <span className="text-sm font-medium text-foreground">Yes</span>
                  </div>
                )}

                {transformedListing.requiresProofOfFunds && (
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-muted-foreground">
                      Proof of Funds Required:
                    </span>
                    <span className="text-sm font-medium text-foreground">Yes</span>
                  </div>
                )}

                {transformedListing.minBuyerCapital && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-muted-foreground">
                      Minimum Buyer Capital:
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {formatUSD(transformedListing.minBuyerCapital)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Card */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">
                Interested?
              </h3>

              {transformedListing.status === 'active' ? (
                <div className="space-y-3">
                  <button className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700">
                    Schedule Call
                  </button>
                  <button className="w-full rounded-lg border border-gray-300 bg-card px-4 py-3 text-sm font-semibold text-foreground/90 hover:bg-muted">
                    Request Data Room
                  </button>
                  <button className="w-full rounded-lg border border-gray-300 bg-card px-4 py-3 text-sm font-semibold text-foreground/90 hover:bg-muted">
                    Make Offer
                  </button>
                </div>
              ) : (
                <div className="rounded-lg bg-muted p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    This listing is{' '}
                    <span className="font-semibold">
                      {transformedListing.status.replace('_', ' ')}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Requirements */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">
                Requirements
              </h3>

              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div
                    className={cn(
                      'mt-0.5 h-5 w-5 rounded-full flex items-center justify-center',
                      transformedListing.hasNDA ? 'bg-green-100' : 'bg-muted'
                    )}
                  >
                    {transformedListing.hasNDA && (
                      <FileText className="h-3 w-3 text-green-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      NDA Agreement
                    </p>
                    <p className="text-xs text-muted-foreground/75">
                      {transformedListing.hasNDA ? 'Required' : 'Not required'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div
                    className={cn(
                      'mt-0.5 h-5 w-5 rounded-full flex items-center justify-center',
                      transformedListing.requiresProofOfFunds ? 'bg-green-100' : 'bg-muted'
                    )}
                  >
                    {transformedListing.requiresProofOfFunds && (
                      <Shield className="h-3 w-3 text-green-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Proof of Funds
                    </p>
                    <p className="text-xs text-muted-foreground/75">
                      {transformedListing.requiresProofOfFunds ? 'Required' : 'Not required'}
                    </p>
                  </div>
                </div>

                {transformedListing.minBuyerCapital && (
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                      <DollarSign className="h-3 w-3 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Minimum Capital
                      </p>
                      <p className="text-xs text-muted-foreground/75">
                        {formatUSD(transformedListing.minBuyerCapital)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact */}
            <div className="rounded-lg border border-green-200 bg-green-50 p-6">
              <h3 className="text-sm font-semibold text-green-900 mb-2">
                Need Help?
              </h3>
              <p className="text-xs text-green-700 mb-4">
                Our M&A advisors are here to assist you through the process.
              </p>
              <button className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">
                Contact Advisor
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
