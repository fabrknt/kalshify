import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { calculateIndexScore, calculateGitHubScore, calculateOnChainScore, calculateTwitterScore } from '../src/lib/cindex/calculators/score-calculator';

// Use DATABASE_URL (pooler) for this quick check
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkHelius() {
    const company = await prisma.company.findUnique({
        where: { slug: 'helius' },
        select: {
            name: true,
            category: true,
            overallScore: true,
            teamHealthScore: true,
            growthScore: true,
            socialScore: true,
            indexData: true,
        }
    });

    if (!company) {
        console.log('Helius not found');
        await prisma.$disconnect();
        await pool.end();
        return;
    }

    const indexData = company.indexData as any;

    console.log('=== HELIUS CURRENT DATA ===\n');
    console.log('Overall Score:', company.overallScore);
    console.log('Team Health:', company.teamHealthScore);
    console.log('Growth:', company.growthScore);
    console.log('Social:', company.socialScore);

    console.log('\n--- GitHub Data ---');
    console.log('Total Contributors:', indexData?.github?.totalContributors);
    console.log('Active Contributors (30d):', indexData?.github?.activeContributors30d);
    console.log('Total Commits (30d):', indexData?.github?.totalCommits30d);
    console.log('Stars:', indexData?.github?.stars);
    console.log('Forks:', indexData?.github?.forks);

    console.log('\n--- Twitter Data ---');
    console.log('Followers:', indexData?.twitter?.followers);
    console.log('Tweet Count:', indexData?.twitter?.tweetCount);
    console.log('Engagement (30d):', JSON.stringify(indexData?.twitter?.engagement30d, null, 2));

    console.log('\n--- On-chain Data ---');
    console.log('Chain:', indexData?.onchain?.chain);
    console.log('TVL:', indexData?.onchain?.tvl);
    console.log('Volume (30d):', indexData?.onchain?.volume30d);
    console.log('Transaction Count (30d):', indexData?.onchain?.transactionCount30d);
    console.log('Unique Wallets (30d):', indexData?.onchain?.uniqueWallets30d);
    console.log('Monthly Active Users:', indexData?.onchain?.monthlyActiveUsers);
    console.log('Daily Active Users:', indexData?.onchain?.dailyActiveUsers);

    console.log('\n--- News Data ---');
    console.log('News items:', indexData?.news?.length || 0);
    if (indexData?.news?.length > 0) {
        console.log('Latest news:', indexData.news.slice(0, 3).map((n: any) => ({
            title: n.title,
            date: n.date
        })));
    }

    console.log('\n--- Score Breakdown ---');
    const github = calculateGitHubScore(indexData?.github || {});
    const twitter = calculateTwitterScore(indexData?.twitter || {});
    const onchain = calculateOnChainScore(indexData?.onchain || {});

    console.log('GitHub Score:', github.score);
    console.log('  - Contributors:', github.breakdown.contributorScore);
    console.log('  - Activity:', github.breakdown.activityScore);
    console.log('  - Retention:', github.breakdown.retentionScore);

    console.log('Twitter Score:', twitter.score);
    console.log('  - Followers:', twitter.breakdown.followersScore);
    console.log('  - Engagement:', twitter.breakdown.engagementScore);

    console.log('On-chain Score:', onchain.score);
    console.log('  - User Growth:', onchain.breakdown.userGrowthScore);
    console.log('  - Transactions:', onchain.breakdown.transactionScore);
    console.log('  - TVL:', onchain.breakdown.tvlScore);

    await prisma.$disconnect();
    await pool.end();
}

checkHelius().catch(console.error);
