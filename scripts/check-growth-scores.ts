import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { calculateIndexScore, calculateOnChainScore, calculateNpmScore, calculateAttentionScore, calculateTwitterScore } from '../src/lib/cindex/calculators/score-calculator';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkGrowthScores() {
    const companies = await prisma.company.findMany({
        where: {
            slug: { in: ['helius', 'hyperliquid'] }
        },
        select: {
            name: true,
            slug: true,
            category: true,
            overallScore: true,
            growthScore: true,
            indexData: true,
        }
    });

    for (const company of companies) {
        const indexData = company.indexData as any;

        console.log(`\n=== ${company.name.toUpperCase()} ===`);
        console.log('Category:', company.category);
        console.log('Current Growth Score:', company.growthScore);

        console.log('\nRaw Data:');
        console.log('  npm downloads:', indexData?.npm?.downloads30d);
        console.log('  Twitter followers:', indexData?.twitter?.followers);
        console.log('  TVL:', indexData?.onchain?.tvl);
        console.log('  Transaction count 30d:', indexData?.onchain?.transactionCount30d);

        console.log('\nComponent Scores:');
        const onchainScore = calculateOnChainScore(indexData?.onchain || {});
        console.log('  On-chain score:', onchainScore.score);
        console.log('    - TVL score:', onchainScore.breakdown.tvlScore);
        console.log('    - User growth score:', onchainScore.breakdown.userGrowthScore);
        console.log('    - Transaction score:', onchainScore.breakdown.transactionScore);

        const twitterScore = calculateTwitterScore(indexData?.twitter || {});
        console.log('  Twitter score:', twitterScore.score);

        const npmScore = calculateNpmScore(indexData?.npm?.downloads30d);
        console.log('  NPM score:', npmScore);

        const attentionScore = calculateAttentionScore(indexData?.twitter || {});
        console.log('  Attention score:', attentionScore);

        // Recalculate with npm data
        const fullScore = await calculateIndexScore(
            indexData?.github || {},
            indexData?.twitter || {},
            indexData?.onchain || {},
            company.category as any,
            indexData?.news,
            undefined,
            indexData?.npm?.downloads30d
        );

        console.log('\nRecalculated Growth Score:', fullScore.growthScore);
        console.log('Expected vs Actual:', fullScore.growthScore, 'vs', company.growthScore);
    }

    await prisma.$disconnect();
    await pool.end();
}

checkGrowthScores().catch(console.error);
