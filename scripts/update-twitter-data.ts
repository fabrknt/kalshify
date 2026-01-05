/**
 * Update Twitter data for existing companies
 * Keeps all other data (GitHub, on-chain) intact
 * Usage: npx tsx scripts/update-twitter-data.ts
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import INIT_TARGET_COMPANIES from "./init-target-companies";

const DATA_DIR = "data/companies";
const COOKIES_FILE = path.join(__dirname, "..", "data", "twitter-cookies.json");
const TWITTER_USERNAME = process.env.TWITTER_USERNAME;
const TWITTER_PASSWORD = process.env.TWITTER_PASSWORD;

interface TwitterData {
  followers: number | null;
  following: number | null;
  tweetCount: number | null;
  accountCreatedAt: Date | null;
  fetchStatus: 'success' | 'failed' | 'not_found' | 'rate_limited';
  fetchError?: string;
}

async function loadTwitterSession(browser: puppeteer.Browser): Promise<boolean> {
  console.log("🔐 Loading Twitter session...");

  if (!fs.existsSync(COOKIES_FILE)) {
    console.error("❌ Twitter cookies not found!");
    console.error("   Please run: npx tsx scripts/twitter-manual-login.ts");
    console.error("   This will open a browser for you to log in manually.");
    return false;
  }

  const page = await browser.newPage();

  try {
    console.log("  ↳ Reading cookies from file...");
    const cookiesString = fs.readFileSync(COOKIES_FILE, 'utf-8');
    const cookies = JSON.parse(cookiesString);
    console.log(`  ↳ Found ${cookies.length} cookies`);

    // Set cookies
    await page.setCookie(...cookies);

    // Navigate to Twitter home to verify session
    console.log("  ↳ Verifying session...");
    await page.goto('https://twitter.com/home', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if we're logged in
    const url = page.url();
    if (url.includes('home') || (url.includes('twitter.com') && !url.includes('login'))) {
      console.log("✅ Session loaded successfully\n");
      await page.close();
      return true;
    }

    console.error("❌ Session expired or invalid");
    console.error("   Please run: npx tsx scripts/twitter-manual-login.ts");
    await page.close();
    return false;

  } catch (error) {
    console.error("❌ Error loading session:", error instanceof Error ? error.message : 'Unknown error');
    await page.close().catch(() => {});
    return false;
  }
}

async function scrapeTwitterData(twitterHandle: string, browser: puppeteer.Browser): Promise<TwitterData> {
  const emptyResult = (status: TwitterData['fetchStatus'], error?: string): TwitterData => ({
    followers: null,
    following: null,
    tweetCount: null,
    accountCreatedAt: null,
    fetchStatus: status,
    fetchError: error,
  });

  let page: puppeteer.Page | null = null;

  try {
    page = await browser.newPage();

    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Navigate to Twitter first to set correct domain
    await page.goto('https://twitter.com', {
      waitUntil: 'networkidle2',
      timeout: 10000
    }).catch(() => {}); // Ignore errors, we just need the domain

    // Load cookies for this page
    if (fs.existsSync(COOKIES_FILE)) {
      const cookiesString = fs.readFileSync(COOKIES_FILE, 'utf-8');
      const cookies = JSON.parse(cookiesString);
      await page.setCookie(...cookies);
    }

    const url = `https://twitter.com/${twitterHandle}`;

    // Navigate to the profile
    const response = await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    if (!response || response.status() === 404) {
      await page.close();
      return emptyResult('not_found', `Twitter handle '@${twitterHandle}' not found`);
    }

    // Wait a bit for dynamic content to load
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Extract metrics using $$eval to avoid tsx __name bug
    const followersText = await page.$$eval(
      'a[href*="/followers"], a[href*="/verified_followers"]',
      (links) => links.find((link: any) => link.textContent?.includes('Follower'))?.textContent || null
    ).catch(() => null);

    const followingText = await page.$$eval(
      'a[href*="/following"]',
      (links) => links.find((link: any) => link.textContent?.includes('Following'))?.textContent || null
    ).catch(() => null);

    const pageText = await page.evaluate(() => document.body.innerText).catch(() => '');
    const postsMatch = pageText.match(/([0-9,.]+[KMB]?)\s+posts/i);

    // Parse counts
    function parseCount(str: string | null): number | null {
      if (!str) return null;

      const match = str.match(/([0-9,.]+[KMB]?)/i);
      if (!match) return null;

      let numStr = match[1].replace(/,/g, '');

      const multiplier = numStr.toUpperCase().endsWith('K') ? 1000 :
                        numStr.toUpperCase().endsWith('M') ? 1000000 :
                        numStr.toUpperCase().endsWith('B') ? 1000000000 : 1;

      const num = parseFloat(numStr.replace(/[KMB]/i, ''));
      return isNaN(num) ? null : Math.round(num * multiplier);
    }

    const metrics = {
      followers: parseCount(followersText),
      following: parseCount(followingText),
      tweetCount: parseCount(postsMatch?.[1] || null),
    };

    await page.close();

    // Check if we got at least followers count
    if (metrics.followers !== null) {
      return {
        followers: metrics.followers,
        following: metrics.following,
        tweetCount: metrics.tweetCount,
        accountCreatedAt: null, // Not easily available without API
        fetchStatus: 'success',
      };
    }

    return emptyResult('failed', 'Could not parse Twitter metrics from page');

  } catch (error) {
    if (page) await page.close().catch(() => {});
    return emptyResult('failed', error instanceof Error ? error.message : 'Unknown error');
  }
}

async function updateCompanyTwitterData(filePath: string, browser: puppeteer.Browser) {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // Find the company in INIT_TARGET_COMPANIES by slug
    const company = INIT_TARGET_COMPANIES.find(c => c.slug === data.slug);

    if (!company || !company.twitter) {
      console.log(`  ⏭️  ${data.name}: No Twitter handle in target companies`);
      return;
    }

    const twitterHandle = company.twitter;

    console.log(`  ↳ Scraping Twitter: @${twitterHandle}`);
    const twitterData = await scrapeTwitterData(twitterHandle, browser);

    if (twitterData.fetchStatus === 'success') {
      console.log(`    ✓ Followers: ${twitterData.followers}, Following: ${twitterData.following}, Tweets: ${twitterData.tweetCount}`);
    } else {
      console.log(`    ⚠️  Twitter fetch ${twitterData.fetchStatus}: ${twitterData.fetchError}`);
    }

    // Update only the twitter section in indexData
    if (data.indexData) {
      data.indexData.twitter = {
        followers: twitterData.followers,
        following: twitterData.following,
        tweetCount: twitterData.tweetCount,
        accountCreatedAt: twitterData.accountCreatedAt?.toISOString() || null,
        fetchStatus: twitterData.fetchStatus,
        fetchError: twitterData.fetchError || null,
      };

      // Also update social.twitterFollowers for backward compatibility
      if (data.indexData.social) {
        data.indexData.social.twitterFollowers = twitterData.followers;
      }
    }

    // Save updated data
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`  ✅ Updated ${data.name}`);

    // Polite delay: wait 3 seconds between requests to avoid overloading Twitter
    await new Promise(resolve => setTimeout(resolve, 3000));

  } catch (error) {
    console.error(`  ❌ Error processing ${filePath}:`, error);
  }
}

async function main() {
  console.log("🐦 Starting Twitter Data Update (Browser Automation)");
  console.log("📦 Launching headless browser...");

  const browser = await puppeteer.launch({
    headless: false, // Twitter detects headless browsers
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  console.log("✅ Browser launched");
  console.log("");

  // Load Twitter session from cookies
  const sessionLoaded = await loadTwitterSession(browser);

  if (!sessionLoaded) {
    console.error("\n❌ Failed to load Twitter session. Aborting.");
    await browser.close();
    process.exit(1);
  }

  console.log("");

  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filePath = path.join(DATA_DIR, file);

      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        console.log(`\n📊 [${i + 1}/${files.length}] Processing: ${data.name}`);
        await updateCompanyTwitterData(filePath, browser);
        updated++;
      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error);
        errors++;
      }
    }
  } finally {
    console.log("\n🔒 Closing browser...");
    await browser.close();
  }

  console.log("\n" + "=".repeat(50));
  console.log("✅ Twitter Update Complete!");
  console.log(`Updated: ${updated} companies`);
  console.log(`Errors: ${errors} companies`);
  console.log("=".repeat(50));
}

main().catch((e) => {
  console.error("❌ Fatal error:", e);
  process.exit(1);
});
