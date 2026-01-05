/**
 * Recalculate scores with proper logic and fetch company logos
 * - Fixes inflated scores by using proper category-based weighting
 * - Fetches Twitter profile images for company cards
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { calculateIndexScore } from '../src/lib/cindex/calculators/score-calculator';
import type { GitHubTeamMetrics, TwitterMetrics, OnChainMetrics } from '../src/lib/api/types';

const SCORED_COMPANIES_DIR = path.join(process.cwd(), 'data', 'scored-companies');
const COOKIES_FILE = path.join(process.cwd(), 'data', 'twitter-cookies.json');

interface ScoredCompany {
  slug: string;
  name: string;
  category: 'defi' | 'infrastructure' | 'nft' | 'dao' | 'gaming';
  description: string;
  website: string | null;
  logo: string | null;
  overallScore: number;
  teamHealthScore: number;
  growthScore: number;
  socialScore: number;
  walletQualityScore: number;
  trend: string;
  indexData: {
    github: GitHubTeamMetrics;
    twitter: TwitterMetrics;
    onchain: OnChainMetrics;
    metadata: any;
  };
  isActive: boolean;
  isListed: boolean;
}

async function fetchTwitterProfileImage(
  page: puppeteer.Page,
  twitterHandle: string
): Promise<string | null> {
  try {
    const url = `https://twitter.com/${twitterHandle}`;
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 15000,
    });

    // Wait for profile image to load
    await page.waitForSelector('[data-testid="UserAvatar-Container-"]', { timeout: 5000 }).catch(() => null);

    // Extract profile image URL using more specific selector
    // Target the profile header avatar, not the logged-in user's avatar
    const imageUrl = await page.evaluate(() => {
      // Try multiple selectors in order of specificity
      const selectors = [
        '[data-testid="UserAvatar-Container-"] img[src*="profile_images"]',
        'a[href$="/photo"] img[src*="profile_images"]',
        '[aria-label*="Profile"] img[src*="profile_images"]',
        'div[data-testid^="UserAvatar"] img[src*="profile_images"]',
      ];

      for (const selector of selectors) {
        const img = document.querySelector(selector) as HTMLImageElement;
        if (img && img.src) {
          return img.src;
        }
      }

      // Fallback: get all profile images and find the largest one (usually the profile pic)
      const allImages = Array.from(document.querySelectorAll('img[src*="profile_images"]'));
      if (allImages.length > 0) {
        // Sort by size (width * height) and take the largest
        const sorted = allImages
          .map(img => ({ img: img as HTMLImageElement, size: img.clientWidth * img.clientHeight }))
          .sort((a, b) => b.size - a.size);
        return sorted[0].img.src;
      }

      return null;
    }).catch(() => null);

    if (imageUrl) {
      // Get the larger version of the image (400x400 instead of normal size)
      return imageUrl.replace('_normal', '_400x400').replace('_bigger', '_400x400');
    }

    return null;
  } catch (error) {
    console.error(`    ⚠️  Failed to fetch logo for @${twitterHandle}`);
    return null;
  }
}

async function recalculateScores() {
  console.log("🔄 Recalculating Scores and Fetching Logos\n");

  // Get all company files
  const files = fs.readdirSync(SCORED_COMPANIES_DIR)
    .filter(file => file.endsWith('.json'))
    .sort();

  console.log(`📋 Found ${files.length} companies\n`);

  // Launch browser for logo fetching
  console.log("📦 Launching browser for logo fetching...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  // Set user agent
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  // Load Twitter session if available
  if (fs.existsSync(COOKIES_FILE)) {
    console.log("🔐 Loading Twitter session...");
    await page.goto('https://twitter.com', {
      waitUntil: 'networkidle2',
      timeout: 10000
    }).catch(() => {});

    const cookiesString = fs.readFileSync(COOKIES_FILE, 'utf-8');
    const cookies = JSON.parse(cookiesString);
    await page.setCookie(...cookies);
    console.log("✅ Session loaded\n");
  }

  const results: Array<{
    slug: string;
    name: string;
    oldScore: number;
    newScore: number;
    change: number;
    logo: string | null;
  }> = [];

  let logosFetched = 0;
  let scoresChanged = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(SCORED_COMPANIES_DIR, file);
    const data: ScoredCompany = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    console.log(`📊 [${i + 1}/${files.length}] Processing: ${data.name}`);

    const oldScore = data.overallScore;

    // Recalculate scores using proper logic
    const newScores = await calculateIndexScore(
      data.indexData.github,
      data.indexData.twitter,
      data.indexData.onchain,
      data.category
    );

    // Fetch logo if we have a Twitter handle
    let logoUrl = data.logo;
    const twitterHandle = data.indexData?.twitter && data.indexData.twitter.fetchStatus === 'success'
      ? Object.keys(data).find(key => key.includes('twitter'))
      : null;

    // Try to extract Twitter handle from various sources
    let handle: string | null = null;
    if (data.indexData.twitter.fetchStatus === 'success') {
      // Check init-target-companies for the Twitter handle
      const targetCompaniesPath = path.join(process.cwd(), 'scripts', 'init-target-companies.ts');
      const targetCompaniesContent = fs.readFileSync(targetCompaniesPath, 'utf-8');

      // Extract Twitter handle using regex
      const slugMatch = new RegExp(`slug:\\s*"${data.slug}"[^}]*twitter:\\s*"([^"]+)"`, 's');
      const match = targetCompaniesContent.match(slugMatch);

      if (match && match[1]) {
        handle = match[1];
      }
    }

    if (handle && !logoUrl) {
      console.log(`  ↳ Fetching logo from Twitter: @${handle}`);
      logoUrl = await fetchTwitterProfileImage(page, handle);
      if (logoUrl) {
        console.log(`    ✓ Logo fetched`);
        logosFetched++;
      }
    }

    // Determine trend
    const trend: 'up' | 'stable' | 'down' =
      newScores.growthScore > 50 ? 'up' :
      newScores.growthScore < 30 ? 'down' : 'stable';

    // Update company data
    const updated: ScoredCompany = {
      ...data,
      overallScore: newScores.overall,
      teamHealthScore: newScores.teamHealth,
      growthScore: newScores.growthScore,
      socialScore: newScores.socialScore,
      walletQualityScore: newScores.walletQuality,
      trend,
      logo: logoUrl,
    };

    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf-8');

    const change = newScores.overall - oldScore;
    if (change !== 0) scoresChanged++;

    results.push({
      slug: data.slug,
      name: data.name,
      oldScore,
      newScore: newScores.overall,
      change,
      logo: logoUrl,
    });

    console.log(`  ✅ Score: ${oldScore} → ${newScores.overall} (${change > 0 ? '+' : ''}${change})`);
  }

  await browser.close();

  console.log("\n" + "=".repeat(80));
  console.log("✅ Recalculation Complete!\n");
  console.log(`📊 Results:`);
  console.log(`  Scores changed: ${scoresChanged}/${files.length}`);
  console.log(`  Logos fetched: ${logosFetched}/${files.length}`);
  console.log("=".repeat(80));

  // Show biggest changes
  console.log("\n🔝 Biggest Score Changes:");
  results
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, 10)
    .forEach((r, i) => {
      console.log(
        `  ${(i + 1).toString().padStart(2)}. ${r.name.padEnd(25)} | ` +
        `${r.oldScore.toString().padStart(3)} → ${r.newScore.toString().padStart(3)} ` +
        `(${r.change > 0 ? '+' : ''}${r.change})`
      );
    });

  // Show new top 10
  console.log("\n🏆 New Top 10 by Score:");
  results
    .sort((a, b) => b.newScore - a.newScore)
    .slice(0, 10)
    .forEach((r, i) => {
      console.log(
        `  ${(i + 1).toString().padStart(2)}. ${r.name.padEnd(25)} | Score: ${r.newScore.toString().padStart(3)}`
      );
    });
}

recalculateScores().catch(console.error);
