import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Use DIRECT_URL for scripts
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkScores() {
    const companies = await prisma.company.findMany({
        where: {
            slug: {
                in: ['hyperliquid', 'anza']
            }
        },
        select: {
            slug: true,
            name: true,
            category: true,
            overallScore: true,
            teamHealthScore: true,
            growthScore: true,
            socialScore: true,
            indexData: true,
        }
    });

    for (const company of companies) {
        const indexData = company.indexData as any;
        console.log('\n---', company.name, '---');
        console.log('Category:', company.category);
        console.log('Overall Score:', company.overallScore);
        console.log('Team Health Score:', company.teamHealthScore);
        console.log('Growth Score:', company.growthScore);
        console.log('Social Score:', company.socialScore);
        console.log('\nGitHub Data:');
        console.log('  Total Commits 30d:', indexData?.github?.totalCommits30d);
        console.log('  Active Contributors 30d:', indexData?.github?.activeContributors30d);
        console.log('  Total Contributors:', indexData?.github?.totalContributors);
        console.log('\nOn-chain Data:');
        console.log('  TVL:', indexData?.onchain?.tvl);
        console.log('  Volume 30d:', indexData?.onchain?.volume30d);
        console.log('  Transaction Count 30d:', indexData?.onchain?.transactionCount30d);
        console.log('  Unique Wallets 30d:', indexData?.onchain?.uniqueWallets30d);
        console.log('\nTwitter Data:');
        console.log('  Followers:', indexData?.twitter?.followers);
    }

    await prisma.$disconnect();
    await pool.end();
}

checkScores().catch(console.error);
