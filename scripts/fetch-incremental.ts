/**
 * Fetch company data incrementally - saves each company separately
 * Resumes from where it left off
 * Usage: npx tsx scripts/fetch-incremental.ts
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import INIT_TARGET_COMPANIES, { TargetCompany } from "./init-target-companies";
import fs from "fs";
import path from "path";
import * as cheerio from "cheerio";
import axios from "axios";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const DATA_DIR = "data/companies";
const FETCH_TIMEOUT = 30000; // 30 seconds timeout

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface GitHubData {
  totalStars: number | null;
  totalForks: number | null;
  totalCommits30d: number | null;
  activeContributors30d: number | null;
  totalContributors: number | null;
  lastCommitDate: Date | null;
  repoCount: number | null;
  fetchStatus: 'success' | 'failed' | 'not_found' | 'rate_limited';
  fetchError?: string;
}

interface TwitterData {
  followers: number | null;
  following: number | null;
  tweetCount: number | null;
  accountCreatedAt: Date | null;
  fetchStatus: 'success' | 'failed' | 'not_found' | 'rate_limited';
  fetchError?: string;
}

interface OnChainData {
  tvl: number | null; // Total Value Locked (USD)
  tokenPrice: number | null; // Token price in USD
  marketCap: number | null; // Market cap in USD
  holderCount: number | null; // Number of token holders
  txCount24h: number | null; // Transactions in last 24h
  activeUsers24h: number | null; // Unique addresses in last 24h
  fetchStatus: 'success' | 'failed' | 'not_found' | 'partial';
  fetchError?: string;
}

async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if ((error as Error).name === 'AbortError') {
      throw new Error(`Request timeout after ${FETCH_TIMEOUT}ms`);
    }
    throw error;
  }
}

async function checkRateLimit(response: Response, apiName: string): Promise<boolean> {
  const remaining = response.headers.get('x-ratelimit-remaining');
  const reset = response.headers.get('x-ratelimit-reset');

  if (remaining === '0' && reset) {
    const resetTime = parseInt(reset) * 1000;
    const waitTime = resetTime - Date.now();
    const waitMinutes = Math.ceil(waitTime / 60000);

    if (waitMinutes <= 15) {
      console.log(`    ⏳ ${apiName} rate limit hit. Waiting ${waitMinutes} minutes until reset...`);
      await new Promise(resolve => setTimeout(resolve, waitTime + 1000));
      return true; // Successfully waited
    } else {
      console.log(`    ⚠️  ${apiName} rate limit hit. Reset in ${waitMinutes} min (>15min). Skipping for now.`);
      return false; // Too long to wait
    }
  }
  return true; // No rate limit issue
}

async function scrapeGitHubBasicData(githubOrg: string): Promise<Partial<GitHubData>> {
  try {
    const url = `https://github.com/${githubOrg}`;
    const response = await axios.get(url, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const $ = cheerio.load(response.data);

    let totalStars = 0;
    let totalForks = 0;
    let repoCount = 0;

    // Get repos from organization page
    const reposUrl = `https://github.com/orgs/${githubOrg}/repositories`;
    try {
      const reposResponse = await axios.get(reposUrl, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      const $repos = cheerio.load(reposResponse.data);

      // Count repos
      $repos('li[itemprop="owns"]').each((_, elem) => {
        repoCount++;

        // Get stars and forks from repo list
        const starsText = $repos(elem).find('a[href*="/stargazers"]').text().trim();
        const forksText = $repos(elem).find('a[href*="/forks"]').text().trim();

        if (starsText) {
          const stars = parseInt(starsText.replace(/,/g, '').replace('k', '000'));
          if (!isNaN(stars)) totalStars += stars;
        }
        if (forksText) {
          const forks = parseInt(forksText.replace(/,/g, '').replace('k', '000'));
          if (!isNaN(forks)) totalForks += forks;
        }
      });
    } catch (err) {
      // If repos page fails, try alternative
      console.log('    ⚠️  Could not fetch repos page, trying alternative...');
    }

    return {
      totalStars,
      totalForks,
      repoCount,
      fetchStatus: 'success',
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return {
        fetchStatus: 'not_found',
        fetchError: `GitHub org '${githubOrg}' not found`,
      };
    }
    return {
      fetchStatus: 'failed',
      fetchError: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function fetchGitHubData(githubOrg: string): Promise<GitHubData> {
  const emptyResult = (status: GitHubData['fetchStatus'], error?: string): GitHubData => ({
    totalStars: null,
    totalForks: null,
    totalCommits30d: null,
    activeContributors30d: null,
    totalContributors: null,
    lastCommitDate: null,
    repoCount: null,
    fetchStatus: status,
    fetchError: error,
  });

  // Step 1: Scrape basic metrics (stars, forks, repo count) - no auth needed, no rate limits
  console.log('    → Scraping basic metrics...');
  const basicData = await scrapeGitHubBasicData(githubOrg);

  if (basicData.fetchStatus === 'not_found') {
    return { ...emptyResult('not_found', basicData.fetchError) };
  }

  if (basicData.fetchStatus === 'failed') {
    return { ...emptyResult('failed', basicData.fetchError) };
  }

  // Start with scraped data
  let totalStars = basicData.totalStars || 0;
  let totalForks = basicData.totalForks || 0;
  let repoCount = basicData.repoCount || 0;
  let totalCommits30d = 0;
  let activeContributors30d = 0;
  let totalContributors = 0;
  let lastCommitDate: Date | null = null;

  // Step 2: Optionally fetch advanced metrics via API (commits, contributors)
  // Only if we have a token and want detailed data
  if (GITHUB_TOKEN) {
    console.log('    → Fetching advanced metrics (commits/contributors)...');
    try {
      const headers = {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      };

      const reposResponse = await fetchWithTimeout(
        `https://api.github.com/orgs/${githubOrg}/repos?per_page=100&sort=updated`,
        { headers }
      );

      // Check rate limit
      if (reposResponse.status === 403) {
        const canContinue = await checkRateLimit(reposResponse, 'GitHub');
        if (!canContinue) {
          console.log('    ⚠️  GitHub API rate limited, using scraped data only');
          // Return scraped data without advanced metrics
          return {
            totalStars,
            totalForks,
            totalCommits30d: null,
            activeContributors30d: null,
            totalContributors: null,
            lastCommitDate: null,
            repoCount,
            fetchStatus: 'success',
          };
        }
      }

      if (reposResponse.ok) {
        const repos = await reposResponse.json();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Update repo count from API if different
        if (repos.length > 0) {
          repoCount = repos.length;
        }

        // Update stars/forks from API (more accurate than scraping)
        totalStars = 0;
        totalForks = 0;
        let contributorsSet = new Set<string>();
        let activeContributorsSet = new Set<string>();

        for (const repo of repos) {
          totalStars += repo.stargazers_count || 0;
          totalForks += repo.forks_count || 0;

          // Only fetch commits for repos with recent activity (optimization)
          const pushedAt = new Date(repo.pushed_at);
          if (pushedAt > thirtyDaysAgo) {
            try {
              const commitsResponse = await fetchWithTimeout(
                `https://api.github.com/repos/${githubOrg}/${repo.name}/commits?since=${thirtyDaysAgo.toISOString()}&per_page=100`,
                { headers }
              );

              if (commitsResponse.ok) {
                const commits = await commitsResponse.json();
                totalCommits30d += commits.length;

                commits.forEach((commit: any) => {
                  if (commit.author?.login) {
                    activeContributorsSet.add(commit.author.login);
                  }
                });

                if (commits.length > 0 && commits[0].commit?.author?.date) {
                  const commitDate = new Date(commits[0].commit.author.date);
                  if (!lastCommitDate || commitDate > lastCommitDate) {
                    lastCommitDate = commitDate;
                  }
                }
              }

              await new Promise((resolve) => setTimeout(resolve, 500));
            } catch (err) {
              // Skip this repo
            }
          }
        }

        activeContributors30d = activeContributorsSet.size;
      }
    } catch (error) {
      console.log('    ⚠️  API fetch failed, using scraped data only');
      // Continue with scraped data
    }
  } else {
    console.log('    ℹ️  No GitHub token, skipping advanced metrics');
  }

  return {
    totalStars,
    totalForks,
    totalCommits30d: totalCommits30d || null,
    activeContributors30d: activeContributors30d || null,
    totalContributors: totalContributors || null,
    lastCommitDate,
    repoCount,
    fetchStatus: 'success',
  };
}

async function fetchAlchemyData(company: TargetCompany): Promise<Partial<OnChainData>> {
  if (!ALCHEMY_API_KEY) {
    return {};
  }

  const chainUrls: { [key: string]: string } = {
    'ethereum': `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    'base': `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    'arbitrum': `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    'optimism': `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    'polygon': `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  };

  const alchemyUrl = chainUrls[company.chain?.toLowerCase() || ''];
  if (!alchemyUrl) {
    return {};
  }

  let holderCount: number | null = null;
  let txCount24h: number | null = null;
  let activeUsers24h: number | null = null;

  try {
    // Get token metadata (includes some holder info)
    if (company.tokenAddress) {
      console.log('    → Fetching token data from Alchemy...');

      const metadataResponse = await axios.post(alchemyUrl, {
        jsonrpc: '2.0',
        id: 1,
        method: 'alchemy_getTokenMetadata',
        params: [company.tokenAddress],
      }, { timeout: 15000 });

      if (metadataResponse.data?.result) {
        const metadata = metadataResponse.data.result;
        console.log(`    ✓ Token: ${metadata.name || 'Unknown'} (${metadata.symbol || 'N/A'})`);
      }

      // Get asset transfers for last 24h to calculate tx count and active users
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const blockNumber = Math.floor(Date.now() / 1000 / 12); // Rough estimate

      const transfersResponse = await axios.post(alchemyUrl, {
        jsonrpc: '2.0',
        id: 2,
        method: 'alchemy_getAssetTransfers',
        params: [{
          fromBlock: '0x' + (blockNumber - 7200).toString(16), // ~24h ago (12s blocks)
          toBlock: 'latest',
          contractAddresses: [company.tokenAddress],
          category: ['erc20', 'external', 'internal'],
          withMetadata: true,
          maxCount: '0x3e8', // 1000 transfers max
        }],
      }, { timeout: 15000 });

      if (transfersResponse.data?.result?.transfers) {
        const transfers = transfersResponse.data.result.transfers;
        txCount24h = transfers.length;

        // Count unique addresses (from + to)
        const uniqueAddresses = new Set<string>();
        transfers.forEach((transfer: any) => {
          if (transfer.from) uniqueAddresses.add(transfer.from.toLowerCase());
          if (transfer.to) uniqueAddresses.add(transfer.to.toLowerCase());
        });
        activeUsers24h = uniqueAddresses.size;

        console.log(`    ✓ Tx (24h): ${txCount24h}, Active users: ${activeUsers24h}`);
      }
    }

    // For contract address, get transaction count
    if (company.contractAddress && !company.tokenAddress) {
      console.log('    → Fetching contract data from Alchemy...');

      const transfersResponse = await axios.post(alchemyUrl, {
        jsonrpc: '2.0',
        id: 3,
        method: 'alchemy_getAssetTransfers',
        params: [{
          fromBlock: '0x' + (Math.floor(Date.now() / 1000 / 12) - 7200).toString(16),
          toBlock: 'latest',
          toAddress: company.contractAddress,
          category: ['external', 'internal'],
          withMetadata: true,
          maxCount: '0x3e8',
        }],
      }, { timeout: 15000 });

      if (transfersResponse.data?.result?.transfers) {
        const transfers = transfersResponse.data.result.transfers;
        txCount24h = transfers.length;

        const uniqueAddresses = new Set<string>();
        transfers.forEach((transfer: any) => {
          if (transfer.from) uniqueAddresses.add(transfer.from.toLowerCase());
        });
        activeUsers24h = uniqueAddresses.size;

        console.log(`    ✓ Contract interactions (24h): ${txCount24h}, Active users: ${activeUsers24h}`);
      }
    }

    return { holderCount, txCount24h, activeUsers24h };
  } catch (error) {
    console.log('    ⚠️  Alchemy API error:', axios.isAxiosError(error) ? error.message : 'Unknown');
    return {};
  }
}

async function fetchHeliusData(company: TargetCompany): Promise<Partial<OnChainData>> {
  if (!HELIUS_API_KEY || company.chain?.toLowerCase() !== 'solana') {
    return {};
  }

  let holderCount: number | null = null;
  let txCount24h: number | null = null;

  try {
    console.log('    → Fetching Solana data from Helius...');

    if (company.tokenAddress) {
      // Get token holder count
      const holderUrl = `https://api.helius.xyz/v0/token-metadata?api-key=${HELIUS_API_KEY}`;
      const holderResponse = await axios.post(holderUrl, {
        mintAccounts: [company.tokenAddress],
      }, { timeout: 15000 });

      if (holderResponse.data?.[0]?.onChainMetadata?.tokenSupply) {
        console.log(`    ✓ Token metadata fetched`);
      }

      // Get transaction signatures for last 24h
      const txUrl = `https://api.helius.xyz/v0/addresses/${company.tokenAddress}/transactions?api-key=${HELIUS_API_KEY}&limit=1000`;
      const txResponse = await axios.get(txUrl, { timeout: 15000 });

      if (txResponse.data && Array.isArray(txResponse.data)) {
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        const recentTxs = txResponse.data.filter((tx: any) => tx.timestamp * 1000 > oneDayAgo);
        txCount24h = recentTxs.length;
        console.log(`    ✓ Solana tx (24h): ${txCount24h}`);
      }
    }

    return { holderCount, txCount24h };
  } catch (error) {
    console.log('    ⚠️  Helius API error:', axios.isAxiosError(error) ? error.message : 'Unknown');
    return {};
  }
}

async function fetchOnChainData(company: TargetCompany): Promise<OnChainData> {
  const emptyResult = (status: OnChainData['fetchStatus'], error?: string): OnChainData => ({
    tvl: null,
    tokenPrice: null,
    marketCap: null,
    holderCount: null,
    txCount24h: null,
    activeUsers24h: null,
    fetchStatus: status,
    fetchError: error,
  });

  let tvl: number | null = null;
  let tokenPrice: number | null = null;
  let marketCap: number | null = null;
  let holderCount: number | null = null;
  let txCount24h: number | null = null;
  let activeUsers24h: number | null = null;
  let hasAnyData = false;

  // 1. Try to fetch TVL from DeFi Llama
  if (company.slug) {
    try {
      console.log('    → Fetching TVL from DeFi Llama...');
      const defiLlamaUrl = `https://api.llama.fi/protocol/${company.slug}`;
      const response = await axios.get(defiLlamaUrl, { timeout: 15000 });

      if (response.data && response.data.tvl) {
        tvl = response.data.tvl[response.data.tvl.length - 1]?.totalLiquidityUSD || null;
        if (tvl) {
          hasAnyData = true;
          console.log(`    ✓ TVL: $${(tvl / 1000000).toFixed(2)}M`);
        }
      }
    } catch (error) {
      console.log('    ℹ️  TVL not found on DeFi Llama');
    }
  }

  // 2. Try to fetch token data from CoinGecko
  if (company.tokenAddress && company.chain) {
    try {
      console.log('    → Fetching token price from CoinGecko...');

      const chainMapping: { [key: string]: string } = {
        'ethereum': 'ethereum',
        'base': 'base',
        'arbitrum': 'arbitrum-one',
        'optimism': 'optimistic-ethereum',
        'polygon': 'polygon-pos',
        'avalanche': 'avalanche',
        'bsc': 'binance-smart-chain',
        'solana': 'solana',
      };

      const platform = chainMapping[company.chain.toLowerCase()];

      if (platform) {
        const coinGeckoUrl = `https://api.coingecko.com/api/v3/coins/${platform}/contract/${company.tokenAddress}`;
        const response = await axios.get(coinGeckoUrl, { timeout: 15000 });

        if (response.data) {
          tokenPrice = response.data.market_data?.current_price?.usd || null;
          marketCap = response.data.market_data?.market_cap?.usd || null;

          if (tokenPrice || marketCap) {
            hasAnyData = true;
            if (tokenPrice) console.log(`    ✓ Token price: $${tokenPrice}`);
            if (marketCap) console.log(`    ✓ Market cap: $${(marketCap / 1000000).toFixed(2)}M`);
          }
        }
      }
    } catch (error) {
      console.log('    ℹ️  Token data not found on CoinGecko');
    }
  }

  // 3. Fetch on-chain data using Alchemy (EVM) or Helius (Solana)
  const isEVM = ['ethereum', 'base', 'arbitrum', 'optimism', 'polygon'].includes(company.chain?.toLowerCase() || '');
  const isSolana = company.chain?.toLowerCase() === 'solana';

  if (isEVM && (company.tokenAddress || company.contractAddress)) {
    const alchemyData = await fetchAlchemyData(company);
    if (alchemyData.holderCount) holderCount = alchemyData.holderCount;
    if (alchemyData.txCount24h) {
      txCount24h = alchemyData.txCount24h;
      hasAnyData = true;
    }
    if (alchemyData.activeUsers24h) {
      activeUsers24h = alchemyData.activeUsers24h;
      hasAnyData = true;
    }
  } else if (isSolana && company.tokenAddress) {
    const heliusData = await fetchHeliusData(company);
    if (heliusData.holderCount) holderCount = heliusData.holderCount;
    if (heliusData.txCount24h) {
      txCount24h = heliusData.txCount24h;
      hasAnyData = true;
    }
  }

  if (hasAnyData) {
    return {
      tvl,
      tokenPrice,
      marketCap,
      holderCount,
      txCount24h,
      activeUsers24h,
      fetchStatus: 'success',
    };
  }

  return emptyResult('failed', 'No on-chain data sources available');
}

async function fetchTwitterData(twitterHandle: string): Promise<TwitterData> {
  const emptyResult = (status: TwitterData['fetchStatus'], error?: string): TwitterData => ({
    followers: null,
    following: null,
    tweetCount: null,
    accountCreatedAt: null,
    fetchStatus: status,
    fetchError: error,
  });

  if (!TWITTER_BEARER_TOKEN) {
    return emptyResult('failed', 'No Twitter Bearer token configured');
  }

  try {
    const headers = {
      'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`,
    };

    // Twitter API v2 endpoint to get user by username
    const url = `https://api.twitter.com/2/users/by/username/${twitterHandle}?user.fields=public_metrics,created_at`;
    const response = await axios.get(url, {
      headers,
      timeout: 15000
    });

    if (response.data?.data) {
      const user = response.data.data;
      const metrics = user.public_metrics;

      return {
        followers: metrics?.followers_count || 0,
        following: metrics?.following_count || 0,
        tweetCount: metrics?.tweet_count || 0,
        accountCreatedAt: user.created_at ? new Date(user.created_at) : null,
        fetchStatus: 'success',
      };
    }

    return emptyResult('failed', 'No data returned from Twitter API');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        return emptyResult('not_found', `Twitter handle '@${twitterHandle}' not found`);
      }
      if (error.response?.status === 429) {
        return emptyResult('rate_limited', 'Twitter API rate limit exceeded');
      }
      if (error.response?.status === 401 || error.response?.status === 403) {
        return emptyResult('failed', 'Twitter API authentication failed - check Bearer token');
      }
      return emptyResult('failed', `HTTP ${error.response?.status}: ${error.response?.statusText}`);
    }
    return emptyResult('failed', error instanceof Error ? error.message : 'Unknown error');
  }
}

async function fetchCompanyData(company: TargetCompany) {
  const filePath = path.join(DATA_DIR, `${company.slug}.json`);

  // Skip if already fetched
  if (fs.existsSync(filePath)) {
    console.log(`⏭️  Skipping ${company.name} (already fetched)`);
    return null;
  }

  console.log(`\n📊 Fetching data for: ${company.name}`);

  let githubData: GitHubData = {
    totalStars: null,
    totalForks: null,
    totalCommits30d: null,
    activeContributors30d: null,
    totalContributors: null,
    lastCommitDate: null,
    repoCount: null,
    fetchStatus: 'failed',
    fetchError: 'No GitHub org specified',
  };

  if (company.github) {
    console.log(`  ↳ Fetching GitHub (hybrid): ${company.github}`);
    githubData = await fetchGitHubData(company.github);
    if (githubData.fetchStatus === 'success') {
      console.log(`    ✓ Stars: ${githubData.totalStars}, Forks: ${githubData.totalForks}, Repos: ${githubData.repoCount}`);
      if (githubData.totalCommits30d !== null) {
        console.log(`    ✓ Commits (30d): ${githubData.totalCommits30d}, Active contributors: ${githubData.activeContributors30d}`);
      }
    } else {
      console.log(`    ⚠️  GitHub fetch ${githubData.fetchStatus}: ${githubData.fetchError}`);
    }
  }

  let twitterData: TwitterData = {
    followers: null,
    following: null,
    tweetCount: null,
    accountCreatedAt: null,
    fetchStatus: 'failed',
    fetchError: 'No Twitter handle specified',
  };

  if (company.twitter) {
    console.log(`  ↳ Fetching Twitter: @${company.twitter}`);
    twitterData = await fetchTwitterData(company.twitter);
    if (twitterData.fetchStatus === 'success') {
      console.log(`    ✓ Followers: ${twitterData.followers}, Following: ${twitterData.following}, Tweets: ${twitterData.tweetCount}`);
    } else {
      console.log(`    ⚠️  Twitter fetch ${twitterData.fetchStatus}: ${twitterData.fetchError}`);
    }
  }

  // Fetch on-chain data
  console.log(`  ↳ Fetching on-chain data...`);
  const onChainData = await fetchOnChainData(company);
  if (onChainData.fetchStatus === 'success' || onChainData.fetchStatus === 'partial') {
    console.log(`    ✓ On-chain data fetched`);
  } else {
    console.log(`    ⚠️  On-chain fetch ${onChainData.fetchStatus}: ${onChainData.fetchError}`);
  }

  console.log(`  ✓ Raw data collection complete`);

  const data = {
    slug: company.slug,
    name: company.name,
    category: company.category,
    description: company.description,
    website: company.website || null,
    logo: null,
    indexData: {
      github: {
        totalStars: githubData.totalStars,
        totalForks: githubData.totalForks,
        totalCommits30d: githubData.totalCommits30d,
        activeContributors30d: githubData.activeContributors30d,
        totalContributors: githubData.totalContributors,
        lastCommitDate: githubData.lastCommitDate?.toISOString() || null,
        repoCount: githubData.repoCount,
        fetchStatus: githubData.fetchStatus,
        fetchError: githubData.fetchError || null,
      },
      twitter: {
        followers: twitterData.followers,
        following: twitterData.following,
        tweetCount: twitterData.tweetCount,
        accountCreatedAt: twitterData.accountCreatedAt?.toISOString() || null,
        fetchStatus: twitterData.fetchStatus,
        fetchError: twitterData.fetchError || null,
      },
      social: {
        twitterFollowers: twitterData.followers,
      },
      onchain: {
        chain: company.chain,
        contractAddress: company.contractAddress || null,
        tokenAddress: company.tokenAddress || null,
        tvl: onChainData.tvl,
        tokenPrice: onChainData.tokenPrice,
        marketCap: onChainData.marketCap,
        holderCount: onChainData.holderCount,
        txCount24h: onChainData.txCount24h,
        activeUsers24h: onChainData.activeUsers24h,
        fetchStatus: onChainData.fetchStatus,
        fetchError: onChainData.fetchError || null,
      },
      metadata: {
        fetchedAt: new Date().toISOString(),
        dataSource: "init-target-script",
      },
    },
    isActive: true,
    isListed: false,
  };

  // Save to individual file
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`  ✅ Saved to ${filePath}`);

  return data;
}

async function main() {
  console.log("🚀 Starting Incremental Data Fetch");
  console.log(`📋 Total companies: ${INIT_TARGET_COMPANIES.length}\n`);

  let fetched = 0;
  let skipped = 0;
  let errors = 0;

  for (const company of INIT_TARGET_COMPANIES) {
    try {
      const result = await fetchCompanyData(company);
      if (result) {
        fetched++;
      } else {
        skipped++;
      }

      // Rate limiting: wait 2 seconds between companies
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`❌ Error processing ${company.name}:`, error);
      errors++;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("✅ Fetch Complete!");
  console.log(`Fetched: ${fetched} companies`);
  console.log(`Skipped: ${skipped} companies (already had data)`);
  console.log(`Errors: ${errors} companies`);
  console.log("=".repeat(50));
}

main().catch((e) => {
  console.error("❌ Fatal error:", e);
  process.exit(1);
});
