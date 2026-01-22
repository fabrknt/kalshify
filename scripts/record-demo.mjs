import puppeteer from 'puppeteer';
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';

const SITE_URL = 'https://kalshify-fabrknt.vercel.app';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to move mouse smoothly to element and click
// Accounts for smaller 720p viewport - scrolls element to upper-middle of screen
async function moveAndClick(page, selector, description) {
  try {
    const element = await page.$(selector);
    if (element) {
      // Scroll element to upper third of viewport (about 150px from top)
      await element.evaluate(el => {
        const rect = el.getBoundingClientRect();
        const scrollTop = window.pageYOffset + rect.top - 150;
        window.scrollTo({ top: Math.max(0, scrollTop), behavior: 'smooth' });
      });
      await delay(1000);

      const box = await element.boundingBox();
      if (box) {
        const x = box.x + box.width / 2;
        const y = box.y + box.height / 2;
        await page.mouse.move(x, y, { steps: 20 });
        await delay(300);
        await page.mouse.click(x, y);
        console.log(`  ✓ ${description}`);
        return true;
      }
    }
    console.log(`  ✗ ${description} - element not found`);
    return false;
  } catch (e) {
    console.log(`  ✗ ${description} - error: ${e.message}`);
    return false;
  }
}

// Helper to find element by text, scroll into view, and click with mouse movement
// Accounts for smaller 720p viewport - scrolls element to upper-middle of screen
async function moveAndClickByText(page, text, description) {
  try {
    // Scroll element to upper third of viewport (about 150px from top)
    const scrolled = await page.evaluate((searchText) => {
      const elements = document.querySelectorAll('button, a, [role="button"], [class*="cursor-pointer"]');
      for (const el of elements) {
        if (el.textContent && el.textContent.includes(searchText)) {
          const rect = el.getBoundingClientRect();
          const scrollTop = window.pageYOffset + rect.top - 150;
          window.scrollTo({ top: Math.max(0, scrollTop), behavior: 'smooth' });
          return true;
        }
      }
      return false;
    }, text);

    if (!scrolled) {
      console.log(`  ✗ ${description} - element not found`);
      return false;
    }

    await delay(1000); // Wait for scroll animation

    // Now get coordinates and click
    const coords = await page.evaluate((searchText) => {
      const elements = document.querySelectorAll('button, a, [role="button"], [class*="cursor-pointer"]');
      for (const el of elements) {
        if (el.textContent && el.textContent.includes(searchText)) {
          const rect = el.getBoundingClientRect();
          return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
        }
      }
      return null;
    }, text);

    if (coords) {
      await page.mouse.move(coords.x, coords.y, { steps: 20 });
      await delay(300);
      await page.mouse.click(coords.x, coords.y);
      console.log(`  ✓ ${description}`);
      return true;
    }
    console.log(`  ✗ ${description} - element not found after scroll`);
    return false;
  } catch (e) {
    console.log(`  ✗ ${description} - error: ${e.message}`);
    return false;
  }
}

// Helper to click first market card with mouse movement
// Accounts for smaller 720p viewport
async function clickFirstMarketCard(page) {
  try {
    // Scroll card to upper third of viewport
    await page.evaluate(() => {
      const cards = document.querySelectorAll('[class*="rounded-xl"][class*="cursor-pointer"]');
      for (const card of cards) {
        if (card.querySelector('h3') && card.textContent.includes('%')) {
          const rect = card.getBoundingClientRect();
          const scrollTop = window.pageYOffset + rect.top - 150;
          window.scrollTo({ top: Math.max(0, scrollTop), behavior: 'smooth' });
          return true;
        }
      }
      return false;
    });

    await delay(1000); // Wait for scroll animation

    const coords = await page.evaluate(() => {
      const cards = document.querySelectorAll('[class*="rounded-xl"][class*="cursor-pointer"]');
      for (const card of cards) {
        if (card.querySelector('h3') && card.textContent.includes('%')) {
          const rect = card.getBoundingClientRect();
          return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
        }
      }
      return null;
    });

    if (coords) {
      await page.mouse.move(coords.x, coords.y, { steps: 25 });
      await delay(300);
      await page.mouse.click(coords.x, coords.y);
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}

async function recordDemo() {
  console.log('Launching browser...');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 900 },
    args: ['--window-size=1280,900']
  });

  const page = await browser.newPage();

  // Set dark mode
  await page.emulateMediaFeatures([
    { name: 'prefers-color-scheme', value: 'dark' }
  ]);

  const recorder = new PuppeteerScreenRecorder(page, {
    fps: 30,
    ffmpeg_Path: null,
    videoFrame: { width: 1280, height: 900 },
    aspectRatio: '16:10'
  });

  const outputPath = './demo-video.mp4';

  console.log('Starting recording...');
  await recorder.start(outputPath);

  try {
    // 1. Landing Page
    console.log('1. Landing page...');
    await page.goto(SITE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await delay(3000);

    // Scroll down slowly to show features
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 80;
        const timer = setInterval(() => {
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= 800) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
    await delay(1500);

    // 2. Markets Page
    console.log('2. Markets page...');
    await page.goto(`${SITE_URL}/markets`, { waitUntil: 'domcontentloaded' });
    await delay(3000);

    // Click heatmap view button
    await moveAndClick(page, 'button[aria-label="Heatmap view"]', 'Heatmap view');
    await delay(2500);

    // Switch back to grid view
    await moveAndClick(page, 'button[aria-label="Grid view"]', 'Grid view');
    await delay(2000);

    // 3. Click on first market card to go to detail page
    console.log('3. Market detail page...');
    if (await clickFirstMarketCard(page)) {
      console.log('  ✓ Clicked on market card');
      await delay(3500);
    }

    // 4. Buy YES position - scroll down more to show the trading panel
    console.log('4. Buying YES position...');
    // Scroll down to make Buy YES button clearly visible in 720p viewport
    await page.evaluate(() => window.scrollTo({ top: 500, behavior: 'smooth' }));
    await delay(1200);
    await moveAndClickByText(page, 'Buy YES', 'Buy YES button');
    await delay(2500);

    // Scroll to bottom of page to make dialog submit button visible
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));
    await delay(1200);

    const submitClicked = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        if (btn.textContent && btn.textContent.includes('Buy YES') && btn.textContent.includes('$')) {
          const rect = btn.getBoundingClientRect();
          return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
        }
      }
      return null;
    });

    if (submitClicked) {
      await page.mouse.move(submitClicked.x, submitClicked.y, { steps: 15 });
      await delay(300);
      await page.mouse.click(submitClicked.x, submitClicked.y);
      console.log('  ✓ Submit trade');
    } else {
      console.log('  ✗ Submit trade - button not found');
    }
    await delay(3500);

    // 5. Portfolio - view the position
    console.log('5. Portfolio page...');
    await page.goto(`${SITE_URL}/portfolio`, { waitUntil: 'domcontentloaded' });
    await delay(2500);

    // Scroll to bottom of page to show position cards with Sell button
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));
    await delay(1500);

    // 6. Close the position (button says "Sell")
    console.log('6. Closing position...');
    await moveAndClickByText(page, 'Sell', 'Sell position');
    await delay(4000); // Extra time for celebration animation

    // 7. Intel Terminal
    console.log('7. Intel Terminal...');
    await page.goto(`${SITE_URL}/intel`, { waitUntil: 'domcontentloaded' });
    await delay(2500);
    // Start from top
    await page.evaluate(() => window.scrollTo(0, 0));
    await delay(1500);

    // Click SCAN NOW button
    await moveAndClickByText(page, 'SCAN NOW', 'SCAN NOW');
    await delay(4000);

    // Click ANALYZE button on first signal (wrap in try/catch to handle any frame issues)
    try {
      await moveAndClickByText(page, '[ANALYZE]', 'ANALYZE signal');
      await delay(4000);
    } catch (e) {
      console.log('  ✗ ANALYZE signal - skipped');
    }

    // Toggle LIVE mode
    try {
      await moveAndClickByText(page, 'LIVE MODE', 'LIVE MODE toggle');
      await delay(4000);
    } catch (e) {
      console.log('  ✗ LIVE MODE toggle - skipped');
    }

    // 8. AI Picks
    console.log('8. AI Picks page...');
    await page.goto(`${SITE_URL}/for-you`, { waitUntil: 'domcontentloaded' });
    await delay(2000);
    // Start from top
    await page.evaluate(() => window.scrollTo(0, 0));
    await delay(1000);

    // Click Get Recommendations - scroll handled by helper
    await moveAndClickByText(page, 'Get Recommendations', 'Get Recommendations');
    await delay(5000);

    // Scroll to and click on a flip card (150px from top for 720p viewport)
    await page.evaluate(() => {
      const cards = document.querySelectorAll('[class*="cursor-pointer"]');
      for (const card of cards) {
        if (card.textContent && card.textContent.includes('%')) {
          const rect = card.getBoundingClientRect();
          const scrollTop = window.pageYOffset + rect.top - 150;
          window.scrollTo({ top: Math.max(0, scrollTop), behavior: 'smooth' });
          return true;
        }
      }
      return false;
    });
    await delay(1000);

    const flipCardCoords = await page.evaluate(() => {
      const cards = document.querySelectorAll('[class*="cursor-pointer"]');
      for (const card of cards) {
        if (card.textContent && card.textContent.includes('%')) {
          const rect = card.getBoundingClientRect();
          return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
        }
      }
      return null;
    });

    if (flipCardCoords) {
      await page.mouse.move(flipCardCoords.x, flipCardCoords.y, { steps: 20 });
      await delay(300);
      await page.mouse.click(flipCardCoords.x, flipCardCoords.y);
      console.log('  ✓ Clicked flip card');
      await delay(3000);
    }

    // 9. Leaderboard
    console.log('9. Leaderboard page...');
    await page.goto(`${SITE_URL}/leaderboard`, { waitUntil: 'domcontentloaded' });
    await delay(2000);
    // Start from top to show podium
    await page.evaluate(() => window.scrollTo(0, 0));
    await delay(2500);

    // 10. Back to landing with Kalshi CTA
    console.log('10. Back to landing...');
    await page.goto(SITE_URL, { waitUntil: 'domcontentloaded' });

    // Scroll to "Ready for Real Trading" section
    await page.evaluate(async () => {
      const sections = document.querySelectorAll('section');
      for (const section of sections) {
        if (section.textContent && section.textContent.includes('Ready for Real Trading')) {
          section.scrollIntoView({ behavior: 'smooth', block: 'center' });
          break;
        }
      }
    });
    await delay(3500);

  } catch (error) {
    console.error('Error during recording:', error);
  }

  console.log('Stopping recording...');
  await recorder.stop();

  await browser.close();

  console.log(`\nDemo video saved to: ${outputPath}`);
}

recordDemo().catch(console.error);
