import Link from 'next/link';
import { ArrowRight, Brain, ShoppingCart, TrendingUp, Shield, Users, Building2 } from 'lucide-react';
import { companies } from '@/lib/intelligence/companies';
import { getMockListings } from '@/lib/mock-data';

export default function SuiteLandingPage() {
  const totalCompanies = companies.length;
  const listedCompanies = companies.filter((c) => c.isListed).length;
  const listings = getMockListings();
  const activeListings = listings.filter((l) => l.status === 'active').length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted to-background">
      {/* Hero Section */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Web3 Intelligence & Acquisition Platform
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Discover verified web3 companies with automated on-chain and off-chain intelligence.
              Make informed acquisition decisions with trustworthy data.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/intelligence"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors font-semibold text-lg"
              >
                <Brain className="h-6 w-6" />
                Explore Intelligence
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/marketplace"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 transition-colors font-semibold text-lg"
              >
                <ShoppingCart className="h-6 w-6" />
                Browse Marketplace
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="text-center">
            <p className="text-4xl font-bold text-foreground mb-2">{totalCompanies}</p>
            <p className="text-sm text-muted-foreground">Companies Tracked</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-purple-600 mb-2">
              {Math.round(companies.reduce((sum, c) => sum + c.overallScore, 0) / companies.length)}
            </p>
            <p className="text-sm text-muted-foreground">Avg Intelligence Score</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-cyan-600 mb-2">{activeListings}</p>
            <p className="text-sm text-muted-foreground">Active Listings</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-green-600 mb-2">100%</p>
            <p className="text-sm text-muted-foreground">Verified Data</p>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* INTELLIGENCE Product */}
          <div className="bg-card rounded-lg border border-border p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-purple-100">
                <Brain className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">INTELLIGENCE</h2>
                <p className="text-sm text-muted-foreground">Web3 Company Intelligence</p>
              </div>
            </div>

            <p className="text-muted-foreground mb-6">
              Automated intelligence for {totalCompanies} web3 companies with verified on-chain and off-chain data.
              No manual input, just trustworthy metrics.
            </p>

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Growth Metrics</p>
                  <p className="text-sm text-muted-foreground">
                    On-chain activity, wallet growth, user growth rates
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Team Health</p>
                  <p className="text-sm text-muted-foreground">
                    GitHub commits, contributors, retention, code quality
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Verified Intelligence</p>
                  <p className="text-sm text-muted-foreground">
                    Automated verification via blockchain and GitHub APIs
                  </p>
                </div>
              </div>
            </div>

            <Link
              href="/intelligence"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors font-medium w-full justify-center"
            >
              Explore Intelligence
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          {/* MARKETPLACE Product */}
          <div className="bg-card rounded-lg border border-border p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-cyan-100">
                <ShoppingCart className="h-8 w-8 text-cyan-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">MARKETPLACE</h2>
                <p className="text-sm text-muted-foreground">Verified Company Marketplace</p>
              </div>
            </div>

            <p className="text-muted-foreground mb-6">
              Acquire web3 companies with verified intelligence. Only companies with proven metrics
              and verified data can be listed.
            </p>

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-cyan-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Verified Listings</p>
                  <p className="text-sm text-muted-foreground">
                    {listedCompanies} companies with intelligence scores available
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-cyan-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">No Self-Reported Data</p>
                  <p className="text-sm text-muted-foreground">
                    All metrics automatically verified before listing
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-cyan-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Transparent Metrics</p>
                  <p className="text-sm text-muted-foreground">
                    See team health, growth, and verified revenue
                  </p>
                </div>
              </div>
            </div>

            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 transition-colors font-medium w-full justify-center"
            >
              Browse Marketplace
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-card border-t border-b border-border">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">
              Fully Automated Verification
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">1</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">On-Chain Data</h3>
                <p className="text-sm text-muted-foreground">
                  Smart contracts, wallets, DAOs, and blockchain transactions automatically verified
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-cyan-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-cyan-600">2</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Off-Chain Sources</h3>
                <p className="text-sm text-muted-foreground">
                  GitHub commits, Discord activity, and Twitter engagement tracked in real-time
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">3</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Intelligence Score</h3>
                <p className="text-sm text-muted-foreground">
                  Algorithmic scoring combines all metrics into trustworthy overall intelligence
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-purple-50 to-cyan-50 rounded-lg border border-purple-200 p-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Start Making Data-Driven Decisions
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Research companies with INTELLIGENCE, acquire with MARKETPLACE. All backed by verified data.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/intelligence/companies"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors font-medium"
            >
              View All Companies
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/marketplace/marketplace"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-cyan-600 text-cyan-600 hover:bg-cyan-50 transition-colors font-medium"
            >
              View All Listings
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
