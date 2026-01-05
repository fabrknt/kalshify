/**
 * Test Twitter parsing on one company
 */

import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const COOKIES_FILE = path.join(__dirname, "..", "data", "twitter-cookies.json");

async function scrapeTwitterData(twitterHandle: string) {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    // Navigate to Twitter first to set correct domain
    await page.goto('https://twitter.com', {
      waitUntil: 'networkidle2',
      timeout: 10000
    });

    // Load cookies
    if (fs.existsSync(COOKIES_FILE)) {
      const cookies = JSON.parse(fs.readFileSync(COOKIES_FILE, 'utf-8'));
      await page.setCookie(...cookies);
      console.log(`Loaded ${cookies.length} cookies`);
    }

    // Now navigate to the profile
    await page.goto(`https://twitter.com/${twitterHandle}`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check URL
    const url = page.url();
    console.log("Current URL:", url);

    // Take screenshot for debugging
    await page.screenshot({ path: '/tmp/test-parse.png' });
    console.log("Screenshot saved");

    // Extract metrics using $$eval to avoid tsx __name bug
    const followersText = await page.$$eval(
      'a[href*="/followers"], a[href*="/verified_followers"]',
      (links) => links.find((link: any) => link.textContent?.includes('Follower'))?.textContent || null
    ).catch(() => null);

    const followingText = await page.$$eval(
      'a[href*="/following"]',
      (links) => links.find((link: any) => link.textContent?.includes('Following'))?.textContent || null
    ).catch(() => null);

    const pageText = await page.evaluate(() => document.body.innerText);
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
      followersText,
      followingText,
      followers: parseCount(followersText),
      following: parseCount(followingText),
      tweetCount: parseCount(postsMatch?.[1] || null),
    };

    console.log(`@${twitterHandle}:`, JSON.stringify(metrics, null, 2));

    await page.close();
    await browser.close();

  } catch (error) {
    console.error("Error:", error);
    await browser.close();
  }
}

scrapeTwitterData("heliuslabs");
