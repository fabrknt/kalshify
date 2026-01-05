/**
 * Manual Twitter login helper
 * Opens a browser for you to log in manually, then saves cookies for automated scraping
 * Usage: npx tsx scripts/twitter-manual-login.ts
 */

import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const COOKIES_FILE = path.join(__dirname, "..", "data", "twitter-cookies.json");

async function manualLogin() {
  console.log("🌐 Opening browser for manual Twitter login...");
  console.log("  ↳ You will log in manually, then we'll save the session\n");

  const browser = await puppeteer.launch({
    headless: false, // Visible browser
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: null
  });

  const page = await browser.newPage();

  try {
    console.log("📱 Step 1: Going to Twitter...");
    await page.goto('https://twitter.com/i/flow/login', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log("\n✋ Step 2: Please log in manually in the browser");
    console.log("  ↳ Complete any verification steps (phone, email, etc.)");
    console.log("  ↳ Once you're logged in and see your home timeline:");
    console.log("  ↳ COME BACK HERE AND PRESS ENTER\n");

    // Wait for user to press Enter
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    await new Promise<void>((resolve) => {
      rl.question('Press Enter after you have logged in successfully: ', () => {
        rl.close();
        resolve();
      });
    });

    console.log("\n✅ Saving session...\n");

    // Get cookies
    const cookies = await page.cookies();

    // Ensure data directory exists
    const dataDir = path.dirname(COOKIES_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Save cookies
    fs.writeFileSync(COOKIES_FILE, JSON.stringify(cookies, null, 2));
    console.log(`💾 Cookies saved to: ${COOKIES_FILE}`);
    console.log(`📊 Saved ${cookies.length} cookies\n`);

    console.log("✅ Setup complete!");
    console.log("   You can now run: npm run update:twitter\n");

    await browser.close();

  } catch (error) {
    console.error("\n❌ Error:", error instanceof Error ? error.message : 'Unknown error');
    await browser.close();
    process.exit(1);
  }
}

manualLogin().catch((e) => {
  console.error("❌ Fatal error:", e);
  process.exit(1);
});
