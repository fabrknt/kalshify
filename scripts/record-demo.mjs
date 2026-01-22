import puppeteer from 'puppeteer';
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';

const SITE_URL = 'https://kalshify-fabrknt.vercel.app';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to click button by text content
async function clickButtonByText(page, text) {
  const clicked = await page.evaluate((searchText) => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.textContent && btn.textContent.includes(searchText)) {
        btn.click();
        return true;
      }
    }
    return false;
  }, text);
  return clicked;
}

async function recordDemo() {
  console.log('Launching browser...');

  const browser = await puppeteer.launch({
    headless: false, // Show browser for debugging
    defaultViewport: { width: 1280, height: 720 },
    args: ['--window-size=1280,720']
  });

  const page = await browser.newPage();

  // Set dark mode
  await page.emulateMediaFeatures([
    { name: 'prefers-color-scheme', value: 'dark' }
  ]);

  const recorder = new PuppeteerScreenRecorder(page, {
    fps: 30,
    ffmpeg_Path: null, // Use system ffmpeg
    videoFrame: { width: 1280, height: 720 },
    aspectRatio: '16:9'
  });

  const outputPath = './demo-video.mp4';

  console.log('Starting recording...');
  await recorder.start(outputPath);

  try {
    // 1. Landing Page (5 seconds)
    console.log('1. Landing page...');
    await page.goto(SITE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await delay(4000);

    // Scroll down slowly to show features
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 80;
        const timer = setInterval(() => {
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= 1000) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
    await delay(2000);

    // 2. Markets Page (10 seconds)
    console.log('2. Markets page...');
    await page.goto(`${SITE_URL}/markets`, { waitUntil: 'domcontentloaded' });
    await delay(3000);

    // Click heatmap view button
    try {
      const heatmapBtn = await page.$('button[aria-label="Heatmap view"]');
      if (heatmapBtn) {
        await heatmapBtn.click();
        console.log('  Clicked heatmap view');
        await delay(3000);
      }
    } catch (e) {
      console.log('  Heatmap button not found, continuing...');
    }

    // Switch back to grid view
    try {
      const gridBtn = await page.$('button[aria-label="Grid view"]');
      if (gridBtn) {
        await gridBtn.click();
        console.log('  Clicked grid view');
        await delay(2000);
      }
    } catch (e) {
      console.log('  Grid button not found, continuing...');
    }

    // 3. Intel Terminal (15 seconds) - KEY FEATURE
    console.log('3. Intel Terminal...');
    await page.goto(`${SITE_URL}/intel`, { waitUntil: 'domcontentloaded' });
    await delay(4000);

    // Click SCAN NOW button
    if (await clickButtonByText(page, 'SCAN NOW')) {
      console.log('  Clicked SCAN NOW');
      await delay(4000);
    } else {
      console.log('  SCAN NOW button not found');
    }

    // Click ANALYZE button on first signal
    if (await clickButtonByText(page, '[ANALYZE]')) {
      console.log('  Clicked ANALYZE');
      await delay(5000);
    } else {
      console.log('  ANALYZE button not found');
    }

    // Toggle LIVE mode
    if (await clickButtonByText(page, 'LIVE MODE')) {
      console.log('  Clicked LIVE MODE');
      await delay(5000);
    } else {
      console.log('  LIVE MODE button not found');
    }

    // 4. AI Picks (10 seconds)
    console.log('4. AI Picks page...');
    await page.goto(`${SITE_URL}/for-you`, { waitUntil: 'domcontentloaded' });
    await delay(3000);

    // Click Get Recommendations
    if (await clickButtonByText(page, 'Get Recommendations')) {
      console.log('  Clicked Get Recommendations');
      await delay(6000);

      // Click on a flip card (first AI pick card)
      const clicked = await page.evaluate(() => {
        const card = document.querySelector('[class*="cursor-pointer"]');
        if (card) {
          card.click();
          return true;
        }
        return false;
      });
      if (clicked) {
        console.log('  Clicked flip card');
        await delay(3000);
      }
    } else {
      console.log('  Get Recommendations button not found');
    }

    // 5. Portfolio (8 seconds)
    console.log('5. Portfolio page...');
    await page.goto(`${SITE_URL}/portfolio`, { waitUntil: 'domcontentloaded' });
    await delay(4000);

    // Click Simulate Prices
    if (await clickButtonByText(page, 'Simulate')) {
      console.log('  Clicked Simulate Prices');
      await delay(3000);
    } else {
      console.log('  Simulate button not found');
    }

    // 6. Leaderboard (5 seconds)
    console.log('6. Leaderboard page...');
    await page.goto(`${SITE_URL}/leaderboard`, { waitUntil: 'domcontentloaded' });
    await delay(5000);

    // 7. Back to landing with Kalshi CTA (5 seconds)
    console.log('7. Back to landing...');
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
    await delay(4000);

  } catch (error) {
    console.error('Error during recording:', error);
  }

  console.log('Stopping recording...');
  await recorder.stop();

  await browser.close();

  console.log(`\nDemo video saved to: ${outputPath}`);
}

recordDemo().catch(console.error);
