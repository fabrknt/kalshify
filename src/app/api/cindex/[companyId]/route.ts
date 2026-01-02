import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/cindex/[companyId]
 * Get company Index data with PULSE + TRACE scores
 * Supports both ID and slug lookup
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ companyId: string }> }
) {
    try {
        const { companyId } = await params;
        // Try ID first, then slug
        const company = await prisma.company.findFirst({
            where: {
                OR: [{ id: companyId }, { slug: companyId }],
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
                isListed: true,
                indexData: true,
                lastFetchedAt: true,
            },
        });

        if (!company) {
            return NextResponse.json(
                { error: "Company not found" },
                { status: 404 }
            );
        }

        // Extract PULSE + TRACE data from indexData JSON
        const indexData = company.indexData as any;

        const response = {
            ...company,
            pulse: indexData?.github
                ? {
                      vitality_score: company.teamHealthScore,
                      developer_activity_score:
                          indexData.github.totalCommits30d || 0,
                      team_retention_score:
                          indexData.github.activeContributors30d || 0,
                      active_contributors:
                          indexData.github.activeContributors30d || 0,
                  }
                : null,
            trace: indexData?.onchain
                ? {
                      growth_score: company.growthScore,
                      verified_roi: indexData.onchain.transactionCount30d || 0,
                      roi_multiplier: 0,
                      quality_score: company.overallScore,
                  }
                : null,
            revenue_verified: 0, // Placeholder - would come from on-chain verification
            fabrknt_score: company.overallScore,
        };

        return NextResponse.json(response);
    } catch (error) {
        const { companyId } = await params;
        console.error(`GET /api/cindex/${companyId} error:`, error);
        return NextResponse.json(
            { error: "Failed to fetch company data" },
            { status: 500 }
        );
    }
}
