import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { calculateIndexScore } from '@/lib/cindex/calculators/score-calculator';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes

export async function POST() {
    try {
        const companies = await prisma.company.findMany({
            where: { isActive: true }
        });

        console.log(`Recalculating scores for ${companies.length} companies...`);

        const results = [];

        for (const company of companies) {
            const indexData = company.indexData as any;

            if (!indexData) {
                console.log(`Skipping ${company.name} (no indexData)`);
                continue;
            }

            // Calculate new scores
            const scores = await calculateIndexScore(
                indexData.github || {},
                indexData.twitter || {},
                indexData.onchain || {},
                company.category as "defi" | "defi-infra",
                indexData.news,
                undefined, // partnership analyses
                indexData.npm?.downloads30d
            );

            // Determine trend based on growth score
            const trend = scores.growthScore >= 60 ? 'up' : scores.growthScore >= 30 ? 'stable' : 'down';

            // Update database
            await prisma.company.update({
                where: { id: company.id },
                data: {
                    overallScore: scores.overall,
                    teamHealthScore: scores.teamHealth,
                    growthScore: scores.growthScore,
                    socialScore: scores.socialScore,
                    walletQualityScore: scores.walletQuality || 0,
                    trend: trend as "up" | "stable" | "down",
                }
            });

            results.push({
                name: company.name,
                category: company.category,
                oldScore: company.overallScore,
                newScore: scores.overall,
                change: scores.overall - company.overallScore,
            });

            console.log(`✅ ${company.name} | ${company.overallScore} → ${scores.overall}`);
        }

        // Get top 10
        const topCompanies = await prisma.company.findMany({
            where: { isActive: true },
            orderBy: { overallScore: 'desc' },
            take: 10,
            select: {
                name: true,
                category: true,
                overallScore: true,
            }
        });

        // Get target companies
        const targets = await prisma.company.findMany({
            where: {
                slug: { in: ['hyperliquid', 'anza'] }
            },
            select: {
                name: true,
                slug: true,
                category: true,
                overallScore: true,
                teamHealthScore: true,
                growthScore: true,
            }
        });

        return NextResponse.json({
            success: true,
            recalculated: results.length,
            topCompanies,
            targets,
            results: results.sort((a, b) => b.newScore - a.newScore).slice(0, 20),
        });
    } catch (error) {
        console.error('Error recalculating scores:', error);
        return NextResponse.json(
            { error: 'Failed to recalculate scores', details: String(error) },
            { status: 500 }
        );
    }
}
