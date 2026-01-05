import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { calculateIndexScore } from '../src/lib/cindex/calculators/score-calculator';

// Use DIRECT_URL for scripts
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function recalculateScores() {
    console.log('Fetching all companies...');
    const companies = await prisma.company.findMany({
        where: { isActive: true }
    });

    console.log(`Found ${companies.length} companies. Recalculating scores...\n`);

    for (const company of companies) {
        const indexData = company.indexData as any;

        if (!indexData) {
            console.log(`⏭️  Skipping ${company.name} (no indexData)`);
            continue;
        }

        // Calculate new scores
        const scores = calculateIndexScore(
            indexData,
            company.category as "defi" | "infrastructure" | "nft" | "dao" | "gaming"
        );

        // Update database
        await prisma.company.update({
            where: { id: company.id },
            data: {
                overallScore: scores.overall,
                teamHealthScore: scores.teamHealth,
                growthScore: scores.growth,
                socialScore: scores.social,
                walletQualityScore: scores.walletQuality || 0,
                trend: scores.trend,
            }
        });

        console.log(`✅ ${company.name.padEnd(25)} | Overall: ${String(scores.overall).padStart(2)} (was ${String(company.overallScore).padStart(2)}) | Team: ${String(scores.teamHealth).padStart(2)} | Growth: ${String(scores.growth).padStart(2)} | Social: ${String(scores.social).padStart(2)}`);
    }

    // Show top 10 after recalculation
    console.log('\n--- TOP 10 AFTER RECALCULATION ---');
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

    topCompanies.forEach((c, i) => {
        console.log(`${String(i + 1).padStart(2)}. ${c.name.padEnd(25)} | ${String(c.overallScore).padStart(2)} | ${c.category}`);
    });

    // Check Hyperliquid and Anza specifically
    console.log('\n--- TARGET COMPANIES ---');
    const targets = await prisma.company.findMany({
        where: {
            slug: { in: ['hyperliquid', 'anza'] }
        },
        select: {
            name: true,
            category: true,
            overallScore: true,
            teamHealthScore: true,
            growthScore: true,
        },
        orderBy: { slug: 'asc' }
    });

    targets.forEach(c => {
        const status = c.overallScore >= 60 ? '✅' : '❌';
        console.log(`${status} ${c.name.padEnd(25)} | Overall: ${String(c.overallScore).padStart(2)} | Team: ${String(c.teamHealthScore).padStart(2)} | Growth: ${String(c.growthScore).padStart(2)} | ${c.category}`);
    });

    await prisma.$disconnect();
    await pool.end();
}

recalculateScores().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
});
