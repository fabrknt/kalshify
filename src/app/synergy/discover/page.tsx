import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ProfessionalDiscovery } from "@/components/synergy/professional-discovery";
import { MatchingEngine } from "@/lib/matching-engine";
import { OpportunityCardData } from "@/components/synergy/opportunity-card";

export const dynamic = "force-dynamic";

export default async function SynergyDiscoveryPage() {
  // Require authentication
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin?callbackUrl=/synergy/discover");
  }

  // Get user's claimed profile
  const claimedProfile = await prisma.claimedProfile.findFirst({
    where: { userId: user.id },
  });

  if (!claimedProfile) {
    redirect("/dashboard/claim-company");
  }

  // Check if profile is verified
  if (!claimedProfile.verified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md text-center space-y-4 bg-card p-8 rounded-lg border border-border">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 mb-4">
            <svg
              className="w-8 h-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Profile Not Verified</h1>
          <p className="text-muted-foreground">
            Your company profile is pending verification. Once verified, you'll
            be able to access Synergy features.
          </p>
          <a
            href="/dashboard/claim-company"
            className="inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            View Profile Status →
          </a>
        </div>
      </div>
    );
  }

  // Get company data
  const company = await prisma.company.findUnique({
    where: { slug: claimedProfile.companySlug },
  });

  if (!company) {
    return notFound();
  }

  // Get all companies for matching
  const allCompanies = await prisma.company.findMany({
    where: {
      isActive: true,
      slug: { not: company.slug }, // Exclude current company
    },
    select: {
      slug: true,
      name: true,
      category: true,
      description: true,
      logo: true,
      overallScore: true,
      teamHealthScore: true,
      growthScore: true,
      indexData: true,
    },
  });

  // Get partnership recommendations using matching engine
  const matchingEngine = new MatchingEngine();
  const allCompaniesWithCurrent = [
    {
      slug: company.slug,
      name: company.name,
      category: company.category,
      description: company.description,
      logo: company.logo,
      overallScore: company.overallScore,
      teamHealthScore: company.teamHealthScore,
      growthScore: company.growthScore,
      indexData: company.indexData,
    },
    ...allCompanies,
  ];

  const matches = await matchingEngine.findMatches(
    company.slug,
    allCompaniesWithCurrent,
    50 // Get top 50 matches
  );

  // Transform matches to OpportunityCardData format
  const opportunities: OpportunityCardData[] = matches.map((match) => {
    const partner = allCompanies.find((c) => c.slug === match.partnerSlug);
    const indexData = (partner?.indexData as any) || {};

    // Extract chain with multiple fallback strategies
    let chain = "ethereum"; // default fallback
    if (indexData?.onchain?.chain && typeof indexData.onchain.chain === 'string' && indexData.onchain.chain.trim()) {
      chain = indexData.onchain.chain.trim().toLowerCase();
    }

    return {
      partnerSlug: match.partnerSlug,
      partnerName: match.partnerName,
      partnerCategory: partner?.category || "infrastructure",
      partnerChain: chain,
      partnerLogo: partner?.logo || undefined,
      partnerDescription: partner?.description || undefined,
      matchScore: match.matchScore,
      partnerOverallScore: partner?.overallScore ?? undefined,
      opportunityType: match.partnershipType,
      compatibility: match.compatibility,
      projectedImpact: match.projectedImpact,
      metrics: {
        tvl: indexData.onchain?.tvl || undefined,
        users: indexData.onchain?.monthlyActiveUsers || undefined,
        teamSize: indexData.github?.totalContributors || undefined,
      },
    };
  });

  // Get existing swipes
  const existingSwipes = await prisma.swipe.findMany({
    where: {
      userId: user.id,
      companySlug: company.slug,
    },
    select: {
      partnerSlug: true,
    },
  });

  const swipedPartners = existingSwipes.map((s) => s.partnerSlug);

  return (
    <ProfessionalDiscovery
      userCompanySlug={company.slug}
      userCompanyName={company.name}
      userCompanyCategory={company.category}
      opportunities={opportunities}
      existingSwipes={swipedPartners}
    />
  );
}
