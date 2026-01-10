/**
 * Generate SQL INSERT statements for new companies
 * Run with: npx tsx scripts/generate-sql-inserts.ts > inserts.sql
 */

import { COMPANY_CONFIGS } from '../src/lib/cindex/company-configs';

// List of existing company slugs (from the 40 original companies)
const EXISTING_SLUGS = new Set([
  'adamik', 'altlayer', 'anza', 'avantis', 'blockscout-base', 'caldera',
  'clockwork', 'concentric', 'contango', 'daimo', 'dolomite', 'drift',
  'espresso-systems', 'fabrknt', 'flash-trade', 'fluid-instadapp', 'gelato',
  'goldsky', 'helius', 'hyperliquid', 'infinex', 'ironforge', 'juice-finance',
  'jupiter', 'kamino', 'lagrange', 'lobby', 'marginfi', 'meteora',
  'napier-finance', 'openfort', 'orca', 'parcl', 'peapods-finance',
  'phoenix-ellipsis', 'pimlico', 'ramses-exchange', 'sanctum', 'spire',
  'squads', 'steakhouse-financial', 'swaap', 'term-finance', 'uniswap',
  'voltius', 'winr-protocol', 'zeeve'
]);

function escapeString(str: string): string {
  return str.replace(/'/g, "''");
}

function generateInsert(config: typeof COMPANY_CONFIGS[0]): string {
  const chains = config.chains || [config.onchain.chain];
  const now = new Date().toISOString();

  // Calculate placeholder scores
  const teamHealthScore = 25;
  const growthScore = 20;
  const socialScore = 15;
  const overallScore = Math.round(teamHealthScore * 0.4 + growthScore * 0.3 + socialScore * 0.3);

  const indexData = {
    github: {
      totalStars: 0,
      totalForks: 0,
      totalCommits30d: 0,
      activeContributors30d: 0,
      totalContributors: 0,
      lastCommitDate: null,
      repoCount: 0,
      fetchStatus: "placeholder"
    },
    twitter: {
      followers: 0,
      following: 0,
      tweetCount: 0,
      accountCreatedAt: null,
      fetchStatus: "placeholder"
    },
    social: {
      twitterFollowers: 0
    },
    onchain: {
      chain: config.onchain.chain,
      contractAddress: config.onchain.address || null,
      tokenAddress: null,
      tvl: null,
      fetchStatus: "placeholder"
    },
    metadata: {
      fetchedAt: now,
      dataSource: "sql-seed"
    }
  };

  return `INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  '${escapeString(config.slug)}',
  '${escapeString(config.name)}',
  '${config.category}',
  ${config.subcategory ? `'${config.subcategory}'` : 'NULL'},
  ARRAY[${chains.map(c => `'${c}'`).join(', ')}]::text[],
  '${escapeString(config.description)}',
  ${config.logo ? `'${escapeString(config.logo)}'` : 'NULL'},
  ${config.website ? `'${escapeString(config.website)}'` : 'NULL'},
  ${overallScore},
  ${teamHealthScore},
  ${growthScore},
  ${socialScore},
  0,
  'stable',
  '${JSON.stringify(indexData).replace(/'/g, "''")}',
  true,
  false,
  '${now}',
  '${now}',
  '${now}'
) ON CONFLICT (slug) DO NOTHING;`;
}

// Generate SQL for new companies only
console.log('-- SQL INSERT statements for new companies');
console.log('-- Generated at:', new Date().toISOString());
console.log('-- Run this in Supabase SQL Editor\n');

let count = 0;
for (const config of COMPANY_CONFIGS) {
  if (!EXISTING_SLUGS.has(config.slug)) {
    console.log(generateInsert(config));
    console.log('');
    count++;
  }
}

console.log(`-- Total new companies: ${count}`);
