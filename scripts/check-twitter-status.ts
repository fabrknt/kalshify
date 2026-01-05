/**
 * Check status of failed Twitter accounts
 * Determines if accounts are suspended, not found, or have other issues
 */

import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

const DATA_DIR = "data/companies";
const COOKIES_FILE = path.join(__dirname, "..", "data", "twitter-cookies.json");

interface TwitterStatus {
  handle: string;
  company: string;
  status: 'exists' | 'not_found' | 'suspended' | 'error';
  message?: string;
}

async function checkTwitterAccount(handle: string, browser: puppeteer.Browser): Promise<TwitterStatus['status']> {
  const page = await browser.newPage();

  try {
    // Navigate to Twitter first
    await page.goto('https://twitter.com', {
      waitUntil: 'networkidle2',
      timeout: 10000
    }).catch(() => {});

    // Load cookies
    if (fs.existsSync(COOKIES_FILE)) {
      const cookies = JSON.parse(fs.readFileSync(COOKIES_FILE, 'utf-8'));
      await page.setCookie(...cookies);
    }

    // Navigate to profile
    const response = await page.goto(`https://twitter.com/${handle}`, {
      waitUntil: 'networkidle2',
      timeout: 15000
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check page content
    const pageText = await page.evaluate(() => document.body.innerText);

    if (response?.status() === 404 || pageText.includes("This account doesn't exist")) {
      await page.close();
      return 'not_found';
    }

    if (pageText.includes('Account suspended') || pageText.includes('suspended')) {
      await page.close();
      return 'suspended';
    }

    // Check if we can find follower info (means account exists)
    const hasFollowers = pageText.includes('Follower') || pageText.includes('Following');

    await page.close();
    return hasFollowers ? 'exists' : 'error';

  } catch (error) {
    await page.close().catch(() => {});
    return 'error';
  }
}

async function main() {
  console.log("🔍 Checking Twitter Account Status\n");

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
  const results: TwitterStatus[] = [];

  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // Check if Twitter fetch failed
    if (data.indexData?.twitter?.fetchStatus === 'failed' ||
        data.indexData?.twitter?.followers === null) {

      // Get Twitter handle from init-target-companies
      const INIT_TARGET_COMPANIES = require('./init-target-companies').default;
      const company = INIT_TARGET_COMPANIES.find((c: any) => c.slug === data.slug);

      if (company?.twitter) {
        console.log(`Checking @${company.twitter}...`);
        const status = await checkTwitterAccount(company.twitter, browser);

        results.push({
          handle: company.twitter,
          company: data.name,
          status
        });

        console.log(`  → ${status}\n`);

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  await browser.close();

  // Print summary
  console.log("\n" + "=".repeat(80));
  console.log("📊 TWITTER ACCOUNT STATUS SUMMARY\n");

  const notFound = results.filter(r => r.status === 'not_found');
  const suspended = results.filter(r => r.status === 'suspended');
  const exists = results.filter(r => r.status === 'exists');
  const errors = results.filter(r => r.status === 'error');

  if (notFound.length > 0) {
    console.log(`\n❌ NOT FOUND (${notFound.length}):`);
    notFound.forEach(r => console.log(`  - @${r.handle} (${r.company})`));
  }

  if (suspended.length > 0) {
    console.log(`\n🚫 SUSPENDED (${suspended.length}):`);
    suspended.forEach(r => console.log(`  - @${r.handle} (${r.company})`));
  }

  if (exists.length > 0) {
    console.log(`\n✅ EXISTS BUT FAILED TO PARSE (${exists.length}):`);
    exists.forEach(r => console.log(`  - @${r.handle} (${r.company})`));
  }

  if (errors.length > 0) {
    console.log(`\n⚠️  ERROR CHECKING (${errors.length}):`);
    errors.forEach(r => console.log(`  - @${r.handle} (${r.company})`));
  }

  console.log("\n" + "=".repeat(80));
}

main().catch(console.error);
