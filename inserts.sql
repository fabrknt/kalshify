-- SQL INSERT statements for new companies
-- Generated at: 2026-01-07T05:50:31.820Z
-- Run this in Supabase SQL Editor

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'sonne-finance',
  'Sonne Finance',
  'defi',
  'lending',
  ARRAY['optimism']::text[],
  'Native Optimism lending market, a Compound fork with ve tokenomics for governance',
  '☀️',
  'https://sonne.finance',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"optimism","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.821Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.821Z',
  '2026-01-07T05:50:31.821Z',
  '2026-01-07T05:50:31.821Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'exactly-protocol',
  'Exactly Protocol',
  'defi',
  'lending',
  ARRAY['optimism']::text[],
  'Fixed-rate lending protocol with variable rate optimization for predictable borrowing costs',
  '📐',
  'https://exact.ly',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"optimism","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.821Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.821Z',
  '2026-01-07T05:50:31.821Z',
  '2026-01-07T05:50:31.821Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'pika-protocol',
  'Pika Protocol',
  'defi',
  'derivatives',
  ARRAY['optimism']::text[],
  'Perpetual exchange with low fees and deep liquidity, native to Optimism',
  '⚡',
  'https://pikaprotocol.com',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"optimism","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.821Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.821Z',
  '2026-01-07T05:50:31.821Z',
  '2026-01-07T05:50:31.821Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'synthetix',
  'Synthetix',
  'defi',
  'derivatives',
  ARRAY['optimism']::text[],
  'Synthetic assets protocol providing liquidity for derivatives, heavily focused on Optimism after migration',
  '💠',
  'https://synthetix.io',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"optimism","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.821Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.821Z',
  '2026-01-07T05:50:31.821Z',
  '2026-01-07T05:50:31.821Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'beethoven-x',
  'Beethoven X',
  'defi',
  'dex',
  ARRAY['optimism']::text[],
  'Balancer-style weighted pools DEX with yield optimization on Optimism',
  '🎼',
  'https://beets.fi',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"optimism","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.821Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.821Z',
  '2026-01-07T05:50:31.821Z',
  '2026-01-07T05:50:31.821Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'granary-finance',
  'Granary Finance',
  'defi',
  'lending',
  ARRAY['optimism']::text[],
  'Aave fork focused on emerging assets and yield opportunities across multiple chains',
  '🌾',
  'https://granary.finance',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"optimism","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.821Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.821Z',
  '2026-01-07T05:50:31.821Z',
  '2026-01-07T05:50:31.821Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'extra-finance',
  'Extra Finance',
  'defi',
  'yield',
  ARRAY['optimism']::text[],
  'Leveraged yield farming protocol enabling up to 7x leverage on LP positions',
  '➕',
  'https://extra.finance',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"optimism","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.821Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.821Z',
  '2026-01-07T05:50:31.821Z',
  '2026-01-07T05:50:31.821Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'thales',
  'Thales',
  'defi',
  'derivatives',
  ARRAY['optimism']::text[],
  'Binary options and sports betting protocol built on Synthetix liquidity',
  '🎯',
  'https://thalesmarket.io',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"optimism","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.821Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.821Z',
  '2026-01-07T05:50:31.821Z',
  '2026-01-07T05:50:31.821Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'conduit',
  'Conduit',
  'infrastructure',
  'l2',
  ARRAY['optimism']::text[],
  'Rollup deployment platform making it easy to launch OP Stack and Arbitrum Orbit chains',
  '🔧',
  'https://conduit.xyz',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"optimism","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.821Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.821Z',
  '2026-01-07T05:50:31.821Z',
  '2026-01-07T05:50:31.821Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'lattice',
  'Lattice',
  'infrastructure',
  'dev-tools',
  ARRAY['optimism']::text[],
  'MUD framework creators building infrastructure for fully on-chain games and autonomous worlds',
  '🎮',
  'https://lattice.xyz',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"optimism","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.821Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.821Z',
  '2026-01-07T05:50:31.821Z',
  '2026-01-07T05:50:31.821Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'socket',
  'Socket',
  'infrastructure',
  'dev-tools',
  ARRAY['optimism']::text[],
  'Cross-chain infrastructure providing bridging and interoperability solutions',
  '🔌',
  'https://socket.tech',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"optimism","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.821Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.821Z',
  '2026-01-07T05:50:31.821Z',
  '2026-01-07T05:50:31.821Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'layer3',
  'Layer3',
  'infrastructure',
  'identity',
  ARRAY['optimism']::text[],
  'Quest and credential platform helping projects distribute tokens and build communities',
  '🏆',
  'https://layer3.xyz',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"optimism","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.821Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.821Z',
  '2026-01-07T05:50:31.821Z',
  '2026-01-07T05:50:31.821Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'galxe',
  'Galxe',
  'infrastructure',
  'identity',
  ARRAY['optimism']::text[],
  'On-chain credential network for building and verifying digital identity',
  '🌌',
  'https://galxe.com',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"optimism","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.821Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.821Z',
  '2026-01-07T05:50:31.821Z',
  '2026-01-07T05:50:31.821Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'dune-analytics',
  'Dune Analytics',
  'infrastructure',
  'data',
  ARRAY['optimism']::text[],
  'Community-powered blockchain analytics platform with SQL-based queries',
  '📊',
  'https://dune.com',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"optimism","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.821Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.821Z',
  '2026-01-07T05:50:31.821Z',
  '2026-01-07T05:50:31.821Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'chainlink-optimism',
  'Chainlink',
  'infrastructure',
  'data',
  ARRAY['optimism']::text[],
  'Decentralized oracle network providing price feeds and verifiable randomness',
  '🔗',
  'https://chain.link',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"optimism","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.821Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.821Z',
  '2026-01-07T05:50:31.821Z',
  '2026-01-07T05:50:31.821Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'op-labs',
  'OP Labs',
  'infrastructure',
  'l2',
  ARRAY['optimism']::text[],
  'Core development team building the OP Stack and Optimism ecosystem',
  '🔴',
  'https://optimism.io',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"optimism","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.821Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.821Z',
  '2026-01-07T05:50:31.821Z',
  '2026-01-07T05:50:31.821Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'quickswap',
  'QuickSwap',
  'defi',
  'dex',
  ARRAY['polygon']::text[],
  'Leading DEX on Polygon with DragonLair staking and concentrated liquidity',
  '🐉',
  'https://quickswap.exchange',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"polygon","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.821Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.821Z',
  '2026-01-07T05:50:31.821Z',
  '2026-01-07T05:50:31.821Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'gains-network',
  'Gains Network',
  'defi',
  'derivatives',
  ARRAY['polygon']::text[],
  'Decentralized leveraged trading platform with synthetic assets and low fees',
  '📈',
  'https://gains.trade',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"polygon","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.821Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.821Z',
  '2026-01-07T05:50:31.821Z',
  '2026-01-07T05:50:31.821Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'beefy-finance',
  'Beefy Finance',
  'defi',
  'yield',
  ARRAY['polygon']::text[],
  'Multi-chain yield optimizer with auto-compounding vaults across 20+ chains',
  '🐮',
  'https://beefy.com',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"polygon","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.822Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'gamma-strategies',
  'Gamma Strategies',
  'defi',
  'yield',
  ARRAY['polygon']::text[],
  'Active liquidity management protocol for concentrated liquidity positions',
  'Γ',
  'https://gamma.xyz',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"polygon","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.822Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'mai-finance',
  'Mai Finance',
  'defi',
  'lending',
  ARRAY['polygon']::text[],
  'Stablecoin lending protocol offering interest-free loans against crypto collateral',
  '🏦',
  'https://mai.finance',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"polygon","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.822Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'balancer-polygon',
  'Balancer',
  'defi',
  'dex',
  ARRAY['polygon']::text[],
  'Automated portfolio manager and liquidity provider with weighted pools',
  '⚖️',
  'https://balancer.fi',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"polygon","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.822Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'harvest-finance',
  'Harvest Finance',
  'defi',
  'yield',
  ARRAY['polygon']::text[],
  'Yield aggregator with auto-compounding strategies across multiple chains',
  '🚜',
  'https://harvest.finance',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"polygon","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.822Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'dystopia',
  'Dystopia',
  'defi',
  'dex',
  ARRAY['polygon']::text[],
  've(3,3) DEX inspired by Solidly, focused on low-fee swaps and gauge voting',
  '🌆',
  'https://dystopia.exchange',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"polygon","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.822Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'polygon-labs',
  'Polygon Labs',
  'infrastructure',
  'l2',
  ARRAY['polygon']::text[],
  'Core development team building Polygon PoS, zkEVM, and CDK infrastructure',
  '💜',
  'https://polygon.technology',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"polygon","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.822Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'biconomy',
  'Biconomy',
  'infrastructure',
  'wallet',
  ARRAY['polygon']::text[],
  'Account abstraction and gasless transaction infrastructure for Web3 apps',
  '🔥',
  'https://biconomy.io',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"polygon","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.822Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'lens-protocol',
  'Lens Protocol',
  'infrastructure',
  'identity',
  ARRAY['polygon']::text[],
  'Decentralized social graph enabling portable social identities and content',
  '🌿',
  'https://lens.xyz',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"polygon","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.822Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'alchemy',
  'Alchemy',
  'infrastructure',
  'data',
  ARRAY['polygon']::text[],
  'Blockchain development platform with node infrastructure and developer tools',
  '🧪',
  'https://alchemy.com',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"polygon","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.822Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'quicknode',
  'QuickNode',
  'infrastructure',
  'data',
  ARRAY['polygon']::text[],
  'Blockchain node infrastructure providing fast and reliable RPC endpoints',
  '⚡',
  'https://quicknode.com',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"polygon","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.822Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'thirdweb',
  'thirdweb',
  'infrastructure',
  'dev-tools',
  ARRAY['polygon']::text[],
  'Full-stack Web3 development platform with SDKs, contracts, and infrastructure',
  '🔺',
  'https://thirdweb.com',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"polygon","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.822Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'sequence',
  'Sequence',
  'infrastructure',
  'wallet',
  ARRAY['polygon']::text[],
  'Smart wallet infrastructure designed for gaming and consumer applications',
  '🎮',
  'https://sequence.xyz',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"polygon","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.822Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'immutable',
  'Immutable',
  'infrastructure',
  'dev-tools',
  ARRAY['polygon']::text[],
  'Gaming-focused infrastructure with zkEVM and marketplace solutions',
  '🎯',
  'https://immutable.com',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"polygon","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.822Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'gearbox',
  'Gearbox',
  'defi',
  'lending',
  ARRAY['ethereum']::text[],
  'Composable leverage protocol enabling leveraged positions across DeFi',
  '⚙️',
  'https://gearbox.fi',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"ethereum","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.822Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'sommelier',
  'Sommelier',
  'defi',
  'yield',
  ARRAY['ethereum']::text[],
  'Intelligent DeFi vaults using off-chain computation for yield optimization',
  '🍷',
  'https://sommelier.finance',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"ethereum","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.822Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'eigenlayer',
  'EigenLayer',
  'infrastructure',
  'security',
  ARRAY['ethereum']::text[],
  'Restaking protocol enabling shared security for new protocols and rollups',
  '🔒',
  'https://eigenlayer.xyz',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"ethereum","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.822Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'raydium',
  'Raydium',
  'defi',
  'dex',
  ARRAY['solana']::text[],
  'AMM and order book DEX providing liquidity to Serum''s central limit order book',
  '☢️',
  'https://raydium.io',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"solana","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.822Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'marinade-finance',
  'Marinade Finance',
  'defi',
  'liquid-staking',
  ARRAY['solana']::text[],
  'Largest liquid staking protocol on Solana with mSOL and native staking',
  '🥖',
  'https://marinade.finance',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"solana","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.822Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'lifinity',
  'Lifinity',
  'defi',
  'dex',
  ARRAY['solana']::text[],
  'Proactive market maker DEX using oracle prices to reduce impermanent loss',
  '♾️',
  'https://lifinity.io',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"solana","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.822Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'save-solend',
  'Save (Solend)',
  'defi',
  'lending',
  ARRAY['solana']::text[],
  'Algorithmic lending and borrowing protocol, rebranded from Solend',
  '💰',
  'https://save.finance',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"solana","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.822Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'jito-labs',
  'Jito Labs',
  'infrastructure',
  'dev-tools',
  ARRAY['solana']::text[],
  'MEV infrastructure and liquid staking protocol with JitoSOL',
  '🔥',
  'https://jito.network',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"solana","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.822Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'triton',
  'Triton',
  'infrastructure',
  'data',
  ARRAY['solana']::text[],
  'High-performance RPC and validator infrastructure for Solana',
  '🔱',
  'https://triton.one',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"solana","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.822Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'switchboard',
  'Switchboard',
  'infrastructure',
  'data',
  ARRAY['solana']::text[],
  'Decentralized oracle network providing customizable data feeds for Solana',
  '🔀',
  'https://switchboard.xyz',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"solana","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.822Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'light-protocol',
  'Light Protocol',
  'infrastructure',
  'dev-tools',
  ARRAY['solana']::text[],
  'ZK compression protocol enabling cost-efficient state on Solana',
  '💡',
  'https://lightprotocol.com',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"solana","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.822Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'aerodrome',
  'Aerodrome',
  'defi',
  'dex',
  ARRAY['base']::text[],
  'Leading ve(3,3) DEX on Base, forked from Velodrome with governance incentives',
  '✈️',
  'https://aerodrome.finance',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"base","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.822Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'moonwell',
  'Moonwell',
  'defi',
  'lending',
  ARRAY['base']::text[],
  'Open lending protocol native to Base with community governance',
  '🌙',
  'https://moonwell.fi',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"base","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.822Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'seamless-protocol',
  'Seamless Protocol',
  'defi',
  'lending',
  ARRAY['base']::text[],
  'Integrated lending protocol with ILMs (Integrated Liquidity Markets) on Base',
  '🔄',
  'https://seamlessprotocol.com',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"base","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.822Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'baseswap',
  'BaseSwap',
  'defi',
  'dex',
  ARRAY['base']::text[],
  'Native Base DEX with yield farming and NFT marketplace features',
  '🔵',
  'https://baseswap.fi',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"base","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.822Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'coinbase-wallet',
  'Coinbase Wallet',
  'infrastructure',
  'wallet',
  ARRAY['base']::text[],
  'Self-custody wallet from Coinbase, primary gateway to the Base ecosystem',
  '💼',
  'https://wallet.coinbase.com',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"base","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.822Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'privy',
  'Privy',
  'infrastructure',
  'wallet',
  ARRAY['base']::text[],
  'Embedded wallet infrastructure enabling seamless Web3 onboarding',
  '🔐',
  'https://privy.io',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"base","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.822Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'zora',
  'Zora',
  'infrastructure',
  'dev-tools',
  ARRAY['base']::text[],
  'NFT and media protocol with its own L2 network on the OP Stack',
  '🎨',
  'https://zora.co',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"base","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.822Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'mirror',
  'Mirror',
  'infrastructure',
  'dev-tools',
  ARRAY['base']::text[],
  'Decentralized publishing platform for writers and creators',
  '🪞',
  'https://mirror.xyz',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"base","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.822Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'camelot',
  'Camelot',
  'defi',
  'dex',
  ARRAY['arbitrum']::text[],
  'Native Arbitrum DEX with launchpad and innovative tokenomics',
  '⚔️',
  'https://camelot.exchange',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"arbitrum","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.822Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'radiant-capital',
  'Radiant Capital',
  'defi',
  'lending',
  ARRAY['arbitrum']::text[],
  'Cross-chain lending protocol leveraging LayerZero for omnichain borrowing',
  '☀️',
  'https://radiant.capital',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"arbitrum","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.822Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'pendle',
  'Pendle',
  'defi',
  'yield',
  ARRAY['arbitrum']::text[],
  'Yield tokenization protocol enabling trading of future yield',
  '⏳',
  'https://pendle.finance',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"arbitrum","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.822Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'vela-exchange',
  'Vela Exchange',
  'defi',
  'derivatives',
  ARRAY['arbitrum']::text[],
  'Perpetual DEX with advanced order types and low fees on Arbitrum',
  '⛵',
  'https://vela.exchange',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"arbitrum","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.822Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'jones-dao',
  'Jones DAO',
  'defi',
  'yield',
  ARRAY['arbitrum']::text[],
  'Options vaults and yield strategies maximizing returns on blue-chip assets',
  '🎩',
  'https://jonesdao.io',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"arbitrum","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.822Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'arbitrum-foundation',
  'Arbitrum Foundation',
  'infrastructure',
  'l2',
  ARRAY['arbitrum']::text[],
  'Governance body supporting the Arbitrum ecosystem and grants',
  '🔷',
  'https://arbitrum.foundation',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"arbitrum","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.822Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'offchain-labs',
  'Offchain Labs',
  'infrastructure',
  'l2',
  ARRAY['arbitrum']::text[],
  'Core development team building Arbitrum technology and Stylus VM',
  '🔬',
  'https://offchainlabs.com',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"arbitrum","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.822Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'layerzero',
  'LayerZero',
  'infrastructure',
  'dev-tools',
  ARRAY['arbitrum']::text[],
  'Omnichain interoperability protocol enabling cross-chain messaging',
  '0️⃣',
  'https://layerzero.network',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"arbitrum","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.822Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Company" (
  id, slug, name, category, subcategory, chains, description, logo, website,
  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",
  trend, "indexData", "isActive", "isListed", "lastFetchedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'chainlink-ccip',
  'Chainlink CCIP',
  'infrastructure',
  'dev-tools',
  ARRAY['arbitrum']::text[],
  'Cross-Chain Interoperability Protocol for secure token and message transfers',
  '🔗',
  'https://chain.link/cross-chain',
  21,
  25,
  20,
  15,
  0,
  'stable',
  '{"github":{"totalStars":0,"totalForks":0,"totalCommits30d":0,"activeContributors30d":0,"totalContributors":0,"lastCommitDate":null,"repoCount":0,"fetchStatus":"placeholder"},"twitter":{"followers":0,"following":0,"tweetCount":0,"accountCreatedAt":null,"fetchStatus":"placeholder"},"social":{"twitterFollowers":0},"onchain":{"chain":"arbitrum","contractAddress":"0x0000000000000000000000000000000000000000","tokenAddress":null,"tvl":null,"fetchStatus":"placeholder"},"metadata":{"fetchedAt":"2026-01-07T05:50:31.822Z","dataSource":"sql-seed"}}',
  true,
  false,
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z',
  '2026-01-07T05:50:31.822Z'
) ON CONFLICT (slug) DO NOTHING;

-- Total new companies: 60
