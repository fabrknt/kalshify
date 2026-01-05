/**
 * Fetch company logos from Twitter (fixed version)
 * Fetches Twitter profile images for company cards
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

const SCORED_COMPANIES_DIR = path.join(process.cwd(), 'data', 'scored-companies');
const COOKIES_FILE = path.join(process.cwd(), 'data', 'twitter-cookies.json');
const INIT_TARGET_FILE = path.join(process.cwd(), 'scripts', 'init-target-companies.ts');

async function fetchTwitterProfileImage(
  page: puppeteer.Page,
  twitterHandle: string
): Promise<string | null> {
  try {
    const url = `https://twitter.com/${twitterHandle}`;
    console.log(`  ↳ Navigating to: ${url}`);

    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 15000,
    });

    // Wait a bit for dynamic content to load
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Extract profile image URL using more specific selector
    const imageUrl = await page.evaluate(() => {
      // Get all profile images
      const allImages = Array.from(document.querySelectorAll('img[src*="profile_images"]'));

      if (allImages.length === 0) return null;

      // Filter out very small images (likely icons/badges)
      const largeImages = allImages.filter((img: any) => {
        return img.clientWidth >= 40 && img.clientHeight >= 40;
      });

      if (largeImages.length === 0) return null;

      // Sort by size and take the largest
      const sorted = largeImages
        .map(img => ({
          src: (img as HTMLImageElement).src,
          size: (img as HTMLImageElement).clientWidth * (img as HTMLImageElement).clientHeight
        }))
        .sort((a, b) => b.size - a.size);

      return sorted[0].src;
    }).catch(() => null);

    if (imageUrl) {
      // Get the larger version (400x400)
      const largeUrl = imageUrl
        .replace('_normal', '_400x400')
        .replace('_bigger', '_400x400')
        .replace('_mini', '_400x400');
      console.log(`    ✓ Found: ${largeUrl.substring(0, 60)}...`);
      return largeUrl;
    }

    console.log(`    ⚠️  No image found`);
    return null;
  } catch (error) {
    console.error(`    ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

async function extractTwitterHandle(slug: string): Promise<string | null> {
  const content = fs.readFileSync(INIT_TARGET_FILE, 'utf-8');
  const slugMatch = new RegExp(`slug:\\s*"${slug}"[^}]*twitter:\\s*"([^"]+)"`, 's');
  const match = content.match(slugMatch);
  return match ? match[1] : null;
}

async function fetchLogos() {
  console.log("🖼️  Fetching Company Logos from Twitter\n");

  // Get all company files
  const files = fs.readdirSync(SCORED_COMPANIES_DIR)
    .filter(file => file.endsWith('.json'))
    .sort();

  console.log(`📋 Found ${files.length} companies\n`);

  // Launch browser
  console.log("📦 Launching browser...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  // Load Twitter session
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

  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(SCORED_COMPANIES_DIR, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    console.log(`\n📊 [${i + 1}/${files.length}] ${data.name}`);

    // Skip if already has logo
    if (data.logo && data.logo.startsWith('https://')) {
      console.log(`  ⏭️  Already has logo, skipping`);
      skipCount++;
      continue;
    }

    // Get Twitter handle
    const handle = await extractTwitterHandle(data.slug);
    if (!handle) {
      console.log(`  ⚠️  No Twitter handle found`);
      failCount++;
      continue;
    }

    // Fetch logo
    const logoUrl = await fetchTwitterProfileImage(page, handle);

    if (logoUrl) {
      data.logo = logoUrl;
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`  ✅ Logo saved`);
      successCount++;
    } else {
      console.log(`  ❌ Failed to fetch logo`);
      failCount++;
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  await browser.close();

  console.log("\n" + "=".repeat(80));
  console.log("✅ Logo Fetching Complete!\n");
  console.log(`📊 Results:`);
  console.log(`  Success: ${successCount}`);
  console.log(`  Failed: ${failCount}`);
  console.log(`  Skipped: ${skipCount}`);
  console.log("=".repeat(80));
}

fetchLogos().catch(console.error);
