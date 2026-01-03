import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PartnerDiscovery } from "@/components/partnerships/partner-discovery";

export default async function PartnershipDiscoveryPage() {
  // Check authentication
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin?callbackUrl=/partnerships/discover");
  }

  // Get user's claimed profile
  const claimedProfile = await prisma.claimedProfile.findFirst({
    where: { userId: user.id },
  });

  if (!claimedProfile) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center p-4">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold">No Profile Claimed</h1>
          <p className="text-muted-foreground">
            You need to claim a company profile before you can discover
            partnership opportunities.
          </p>
          <p className="text-sm text-muted-foreground">
            Visit a company page and click "Claim This Profile" to get started.
          </p>
          <a
            href="/cindex/companies"
            className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Browse Companies →
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

  // Get all other companies for matching
  const allCompanies = await prisma.company.findMany({
    where: {
      isActive: true,
      slug: { not: claimedProfile.companySlug }, // Exclude own company
    },
    select: {
      id: true,
      slug: true,
      name: true,
      category: true,
      description: true,
      logo: true,
      website: true,
      overallScore: true,
      teamHealthScore: true,
      growthScore: true,
      socialScore: true,
      walletQualityScore: true,
      trend: true,
      indexData: true,
    },
  });

  // Get existing swipes to filter out
  const existingSwipes = await prisma.swipe.findMany({
    where: {
      userId: user.id,
      companySlug: claimedProfile.companySlug,
    },
    select: {
      partnerSlug: true,
      action: true,
    },
  });

  const swipedPartners = new Set(existingSwipes.map((s) => s.partnerSlug));

  return (
    <div className="min-h-screen bg-muted">
      <PartnerDiscovery
        userCompany={{
          slug: company.slug,
          name: company.name,
          category: company.category,
          logo: company.logo,
        }}
        allCompanies={allCompanies}
        swipedPartners={swipedPartners}
      />
    </div>
  );
}
