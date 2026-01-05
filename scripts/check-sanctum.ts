import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { calculateIndexScore, calculateOnChainScore, calculateAttentionScore } from '../src/lib/cindex/calculators/score-calculator';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkSanctum() {
    const company = await prisma.company.findUnique({
        where: { slug: 'sanctum' },
        select: {
            name: true,
            category: true,
            overallScore: true,
            growthScore: true,
            indexData: true,
        }
    });

    if (!company) {
        console.log('Sanctum not found');
        return;
    }

    const indexData = company.indexData as any;

    console.log('=== SANCTUM ANALYSIS ===\n');
    console.log('Current Scores:');
    console.log('  Overall:', company.overallScore);
    console.log('  Growth:', company.growthScore, '← STORED IN DB');

    console.log('\nRaw Data:');
    console.log('  TVL:', indexData?.onchain?.tvl, '($' + (indexData?.onchain?.tvl / 1e9).toFixed(2) + 'B)');
    console.log('  Twitter followers:', indexData?.twitter?.followers);
    console.log('  Transaction count:', indexData?.onchain?.transactionCount30d);

    const onchainScore = calculateOnChainScore(indexData?.onchain || {});
    console.log('\nOn-chain Score:', onchainScore.score);
    console.log('  TVL score:', onchainScore.breakdown.tvlScore);
    console.log('  User growth:', onchainScore.breakdown.userGrowthScore);
    console.log('  TX score:', onchainScore.breakdown.transactionScore);

    const attentionScore = calculateAttentionScore(indexData?.twitter || {});
    console.log('\nAttention Score:', attentionScore);

    console.log('\n--- RECALCULATING WITH NEW LOGIC ---');
    const fullScore = await calculateIndexScore(
        indexData?.github || {},
        indexData?.twitter || {},
        indexData?.onchain || {},
        company.category as any,
        indexData?.news
    );

    console.log('\nRecalculated Scores:');
    console.log('  Overall:', fullScore.overall);
    console.log('  Growth:', fullScore.growthScore, '← SHOULD BE');
    console.log('  Difference:', fullScore.growthScore - company.growthScore, 'points');

    console.log('\n🔍 Growth Score Components:');
    console.log('  On-chain:', onchainScore.score);
    console.log('  Attention:', attentionScore);
    console.log('  Category:', company.category, '(DeFi)');

    await prisma.$disconnect();
    await pool.end();
}

checkSanctum().catch(console.error);
