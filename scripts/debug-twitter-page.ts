/**
 * Debug Twitter page structure
 * Takes screenshot and dumps HTML to see current structure
 */

import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const COOKIES_FILE = path.join(__dirname, "..", "data", "twitter-cookies.json");

async function debugTwitterPage() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    // Load cookies
    if (fs.existsSync(COOKIES_FILE)) {
      const cookies = JSON.parse(fs.readFileSync(COOKIES_FILE, 'utf-8'));
      await page.setCookie(...cookies);
    }

    // Go to a test profile
    console.log("Loading @heliuslabs profile...");
    await page.goto('https://twitter.com/heliuslabs', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await new Promise(resolve => setTimeout(resolve, 5000));

    // Take screenshot
    await page.screenshot({ path: '/tmp/twitter-page.png', fullPage: true });
    console.log("Screenshot saved to /tmp/twitter-page.png");

    // Get page HTML
    const html = await page.content();
    fs.writeFileSync('/tmp/twitter-page.html', html);
    console.log("HTML saved to /tmp/twitter-page.html");

    // Try to find follower count using various methods
    console.log("\n=== Attempting to find metrics ===\n");

    // Method 1: Look for specific aria-labels or data attributes
    const metrics1 = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="/verified_followers"], a[href*="/followers"]'));
      const followersLink = links.find(link => link.textContent?.includes('Follower'));

      return {
        followersLink: followersLink?.textContent,
        followersHref: followersLink?.getAttribute('href')
      };
    });
    console.log("Method 1 (Links):", metrics1);

    // Method 2: Look for specific divs with numbers
    const metrics2 = await page.evaluate(() => {
      const allText = document.body.innerText;
      const lines = allText.split('\n');
      const followerLines = lines.filter(line => line.includes('Follower'));

      return {
        followerLines,
        sample: allText.substring(0, 1000)
      };
    });
    console.log("Method 2 (Text search):", JSON.stringify(metrics2, null, 2));

    // Method 3: Check for <span> elements with specific patterns
    const metrics3 = await page.evaluate(() => {
      const spans = Array.from(document.querySelectorAll('span'));
      const numberSpans = spans
        .filter(span => /^[\d,]+$/.test(span.textContent || ''))
        .map(span => span.textContent);

      return { numberSpans: numberSpans.slice(0, 20) };
    });
    console.log("Method 3 (Number spans):", metrics3);

    console.log("\nWaiting 30 seconds for you to inspect the browser...");
    console.log("Check /tmp/twitter-page.html and /tmp/twitter-page.png");
    await new Promise(resolve => setTimeout(resolve, 30000));

  } finally {
    await browser.close();
  }
}

debugTwitterPage();
