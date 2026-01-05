import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { calculateGitHubScore, calculateOnChainScore, calculateTwitterScore } from '@/lib/cindex/calculators/score-calculator';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { slug } = await request.json();

        const company = await prisma.company.findUnique({
            where: { slug },
            select: {
                name: true,
                slug: true,
                category: true,
                overallScore: true,
                teamHealthScore: true,
                growthScore: true,
                socialScore: true,
                indexData: true,
            }
        });

        if (!company) {
            return NextResponse.json({ error: 'Company not found' }, { status: 404 });
        }

        const indexData = company.indexData as any;

        // Calculate component scores
        const github = calculateGitHubScore(indexData?.github || {});
        const twitter = calculateTwitterScore(indexData?.twitter || {});
        const onchain = calculateOnChainScore(indexData?.onchain || {});

        return NextResponse.json({
            name: company.name,
            slug: company.slug,
            category: company.category,
            scores: {
                overall: company.overallScore,
                teamHealth: company.teamHealthScore,
                growth: company.growthScore,
                social: company.socialScore,
            },
            rawData: {
                github: indexData?.github,
                twitter: indexData?.twitter,
                onchain: indexData?.onchain,
                newsCount: indexData?.news?.length || 0,
                latestNews: indexData?.news?.slice(0, 3),
            },
            scoreBreakdown: {
                github: {
                    score: github.score,
                    breakdown: github.breakdown,
                },
                twitter: {
                    score: twitter.score,
                    breakdown: twitter.breakdown,
                },
                onchain: {
                    score: onchain.score,
                    breakdown: onchain.breakdown,
                },
            },
        });
    } catch (error) {
        console.error('Error inspecting company:', error);
        return NextResponse.json(
            { error: 'Failed to inspect company', details: String(error) },
            { status: 500 }
        );
    }
}
