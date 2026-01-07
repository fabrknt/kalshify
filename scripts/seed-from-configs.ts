/**
 * Seed Companies from COMPANY_CONFIGS
 * Creates database entries for all companies defined in company-configs.ts
 * Uses placeholder scores that can be updated later via fetch scripts
 *
 * Usage: npx tsx scripts/seed-from-configs.ts
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { COMPANY_CONFIGS } from '../src/lib/cindex/company-configs';

// Use DIRECT_URL for scripts (non-pooled connection)
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedFromConfigs() {
  console.log("🌱 Seeding companies from COMPANY_CONFIGS...\n");
  console.log(`📋 Total configs: ${COMPANY_CONFIGS.length}\n`);

  // Get existing companies
  const existingCompanies = await prisma.company.findMany({
    select: { slug: true },
  });
  const existingSlugs = new Set(existingCompanies.map(c => c.slug));
  console.log(`📦 Existing companies in DB: ${existingSlugs.size}\n`);

  let created = 0;
  let skipped = 0;
  let errors = 0;
  const errorList: string[] = [];

  for (const config of COMPANY_CONFIGS) {
    // Skip if already exists
    if (existingSlugs.has(config.slug)) {
      console.log(`⏭️  Skipping ${config.name} (already exists)`);
      skipped++;
      continue;
    }

    try {
      // Generate placeholder scores based on config data
      // These will be updated later when real data is fetched
      const baseScore = config.fallbackData.teamHealth?.activeContributors
        ? Math.min(100, config.fallbackData.teamHealth.activeContributors * 5 + 15)
        : 25;

      const growthScore = config.fallbackData.growth?.tvl
        ? Math.min(100, Math.log10(config.fallbackData.growth.tvl) * 10)
        : 20;

      const socialScore = config.fallbackData.social?.twitterFollowers
        ? Math.min(100, Math.log10(config.fallbackData.social.twitterFollowers) * 15)
        : 15;

      const teamHealthScore = baseScore;
      const overallScore = Math.round(
        teamHealthScore * 0.4 + growthScore * 0.3 + socialScore * 0.3
      );

      const trend = config.fallbackData.teamHealth?.activeContributors &&
                   config.fallbackData.teamHealth.activeContributors > 5
        ? "up" as const
        : "stable" as const;

      // Create company record
      await prisma.company.create({
        data: {
          slug: config.slug,
          name: config.name,
          category: config.category,
          subcategory: config.subcategory || null,
          chains: config.chains || [config.onchain.chain],
          description: config.description,
          logo: config.logo || null,
          website: config.website || null,
          overallScore,
          teamHealthScore,
          growthScore: Math.round(growthScore),
          socialScore: Math.round(socialScore),
          walletQualityScore: 0,
          trend,
          indexData: {
            github: {
              totalStars: config.github?.repos?.[0] ? 100 : 0,
              totalForks: 0,
              totalCommits30d: config.fallbackData.teamHealth?.activeContributors
                ? config.fallbackData.teamHealth.activeContributors * 10
                : 0,
              activeContributors30d: config.fallbackData.teamHealth?.activeContributors || 0,
              totalContributors: config.fallbackData.teamHealth?.totalContributors || 0,
              lastCommitDate: null,
              repoCount: config.github?.repos?.length || 0,
              fetchStatus: "placeholder",
            },
            twitter: {
              followers: config.fallbackData.social?.twitterFollowers || 0,
              following: 0,
              tweetCount: 0,
              accountCreatedAt: null,
              fetchStatus: "placeholder",
            },
            social: {
              twitterFollowers: config.fallbackData.social?.twitterFollowers || 0,
            },
            onchain: {
              chain: config.onchain.chain,
              contractAddress: config.onchain.contractAddress || null,
              tokenAddress: config.onchain.tokenAddress || null,
              tvl: config.fallbackData.growth?.tvl || null,
              tokenPrice: null,
              marketCap: null,
              holderCount: null,
              txCount24h: null,
              activeUsers24h: null,
              fetchStatus: "placeholder",
            },
            metadata: {
              fetchedAt: new Date().toISOString(),
              dataSource: "company-configs-seed",
            },
          },
          isActive: true,
          isListed: false,
          lastFetchedAt: new Date(),
        },
      });

      console.log(`✅ Created: ${config.name} (${config.category}/${config.subcategory || 'general'} on ${config.chains?.join(', ') || config.onchain.chain})`);
      created++;
    } catch (error: any) {
      console.error(`❌ Error creating ${config.name}:`, error.message);
      errorList.push(`${config.name}: ${error.message}`);
      errors++;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("📊 Seeding Complete!");
  console.log(`  ✅ Created: ${created}`);
  console.log(`  ⏭️  Skipped: ${skipped}`);
  console.log(`  ❌ Errors: ${errors}`);

  if (errorList.length > 0) {
    console.log("\n❌ Error Details:");
    errorList.forEach(e => console.log(`  - ${e}`));
  }

  // Show summary
  const totalInDB = await prisma.company.count();
  const byCategory = await prisma.company.groupBy({
    by: ['category'],
    _count: true,
  });

  console.log(`\n📈 Database Summary:`);
  console.log(`  Total companies: ${totalInDB}`);
  console.log(`\n  By Category:`);
  byCategory.forEach(c => {
    console.log(`    ${c.category}: ${c._count}`);
  });

  // Show by chain
  const allCompanies = await prisma.company.findMany({
    select: { chains: true },
  });

  const chainCounts: Record<string, number> = {};
  allCompanies.forEach(c => {
    (c.chains as string[] || []).forEach(chain => {
      chainCounts[chain] = (chainCounts[chain] || 0) + 1;
    });
  });

  console.log(`\n  By Chain:`);
  Object.entries(chainCounts).sort((a, b) => b[1] - a[1]).forEach(([chain, count]) => {
    console.log(`    ${chain}: ${count}`);
  });

  console.log("=".repeat(60));
}

seedFromConfigs()
  .catch((e) => {
    console.error("❌ Fatal error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
