const { chromium } = require('playwright');
const path = require('path');

const SITE_URL = 'http://localhost:4200/jasbir';
const OUTPUT_DIR = path.join(__dirname, 'mockup-videos');
const SCROLL_SPEED = 2; // pixels per frame (~60fps feel)
const PAUSE_TOP = 2000; // ms to pause at top
const PAUSE_BOTTOM = 2000; // ms to pause at bottom

const viewports = [
  {
    name: 'desktop',
    width: 1440,
    height: 900,
    deviceScaleFactor: 2,
  },
  {
    name: 'mobile',
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  },
];

async function smoothScroll(page, durationMs) {
  const scrollHeight = await page.evaluate(() => document.body.scrollHeight - window.innerHeight);
  const steps = Math.ceil(durationMs / 16); // ~60fps
  const stepPx = scrollHeight / steps;

  for (let i = 0; i <= steps; i++) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.min(i * stepPx, scrollHeight));
    await page.waitForTimeout(16);
  }
}

(async () => {
  const fs = require('fs');
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const vp of viewports) {
    console.log(`\n Recording ${vp.name} (${vp.width}x${vp.height})...`);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.deviceScaleFactor || 2,
      isMobile: vp.isMobile || false,
      hasTouch: vp.hasTouch || false,
      recordVideo: {
        dir: OUTPUT_DIR,
        size: { width: vp.width, height: vp.height },
      },
    });

    const page = await context.newPage();

    // Load the page and wait for everything to render
    await page.goto(SITE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500); // let animations settle

    // Dismiss any popups/overlays if present
    await page.evaluate(() => {
      document.querySelectorAll('[class*="cookie"], [class*="popup"], [class*="overlay"]').forEach(el => el.remove());
    });

    // Pause at top
    console.log(`  Pausing at top for ${PAUSE_TOP}ms...`);
    await page.waitForTimeout(PAUSE_TOP);

    // Smooth scroll down
    const scrollDuration = vp.name === 'mobile' ? 18000 : 15000;
    console.log(`  Scrolling down (${scrollDuration / 1000}s)...`);
    await smoothScroll(page, scrollDuration);

    // Pause at bottom
    console.log(`  Pausing at bottom for ${PAUSE_BOTTOM}ms...`);
    await page.waitForTimeout(PAUSE_BOTTOM);

    // Close and save video
    await page.close();
    await context.close();
    await browser.close();

    // Rename the video file
    const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.webm'));
    const latest = files
      .map(f => ({ name: f, time: fs.statSync(path.join(OUTPUT_DIR, f)).mtimeMs }))
      .sort((a, b) => b.time - a.time)[0];

    if (latest) {
      const newName = `${vp.name}-scroll.webm`;
      fs.renameSync(path.join(OUTPUT_DIR, latest.name), path.join(OUTPUT_DIR, newName));
      console.log(`  Saved: mockup-videos/${newName}`);
    }
  }

  console.log('\n Done! Videos saved to mockup-videos/');
})();
