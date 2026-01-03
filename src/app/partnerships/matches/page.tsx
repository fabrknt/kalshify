import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { MatchesList } from "@/components/partnerships/matches-list";

export default async function MatchesPage() {
  // Check authentication
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin?callbackUrl=/partnerships/matches");
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
            You need to claim a company profile before you can view partnership
            matches.
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

  // Get all mutual matches
  const matches = await prisma.match.findMany({
    where: {
      OR: [
        { companyASlug: claimedProfile.companySlug },
        { companyBSlug: claimedProfile.companySlug },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Get partner company details for each match
  const enrichedMatches = await Promise.all(
    matches.map(async (match) => {
      // Determine which company is the partner
      const partnerSlug =
        match.companyASlug === claimedProfile.companySlug
          ? match.companyBSlug
          : match.companyASlug;

      // Get partner company data
      const partner = await prisma.company.findUnique({
        where: { slug: partnerSlug },
        select: {
          slug: true,
          name: true,
          category: true,
          description: true,
          logo: true,
          website: true,
          overallScore: true,
          teamHealthScore: true,
          growthScore: true,
          trend: true,
        },
      });

      // Get the swipes that created this match
      const userSwipe = await prisma.swipe.findFirst({
        where: {
          companySlug: claimedProfile.companySlug,
          partnerSlug,
        },
      });

      const partnerSwipe = await prisma.swipe.findFirst({
        where: {
          companySlug: partnerSlug,
          partnerSlug: claimedProfile.companySlug,
        },
      });

      return {
        id: match.id,
        partner,
        matchScore: match.matchScore,
        status: match.status,
        createdAt: match.createdAt,
        userAction: userSwipe?.action,
        partnerAction: partnerSwipe?.action,
      };
    })
  );

  return (
    <div className="min-h-screen bg-muted">
      <MatchesList
        userCompany={{
          slug: company.slug,
          name: company.name,
          category: company.category,
          logo: company.logo,
        }}
        matches={enrichedMatches}
      />
    </div>
  );
}
