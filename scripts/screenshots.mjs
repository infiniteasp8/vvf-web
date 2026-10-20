/**
 * Captures review screenshots of the built site (desktop and mobile, all three languages).
 *
 *   npm run build && node scripts/screenshots.mjs <output-dir> <project-dir>
 */
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
const out = process.argv[2];
const port = 4323;
const base = `http://localhost:${port}`;
const preview = spawn('npx', ['astro', 'preview', '--port', String(port)], {
  stdio: 'ignore',
  cwd: process.argv[3],
});
for (let i = 0; i < 60; i++) {
  try {
    if ((await fetch(base + '/')).ok) break;
  } catch {}
  await sleep(500);
}
const browser = await chromium.launch();
async function shot(
  name,
  url,
  { width = 1440, height = 900, full = false, skip = true, waitMs = 1200, scrollTo = null } = {},
) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  if (skip) await page.addInitScript(() => sessionStorage.setItem('vvf-arrival-seen', '1'));
  await page.goto(base + url, { waitUntil: 'networkidle' });
  if (scrollTo) {
    await page.locator(scrollTo).scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, -80));
  }
  await sleep(waitMs);
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: full });
  await ctx.close();
  console.log('shot', name);
}
await shot('arrival-1500ms', '/', { skip: false, waitMs: 1500 });
await shot('home-en-hero', '/');
await shot('home-hi-hero', '/hi/');
await shot('home-sa-hero', '/sa/');
await shot('home-en-learning', '/', { scrollTo: '#learning' });
await shot('home-en-day', '/', { scrollTo: '#day' });
await shot('home-en-moments', '/', { scrollTo: '#moments' });
await shot('home-en-give', '/', { scrollTo: '#give' });
await shot('home-en-full', '/', { full: true });
await shot('donate-en-hero', '/donate/');
await shot('donate-hi-give', '/hi/donate/', { scrollTo: '#give' });
await shot('donate-en-letter', '/donate/', { scrollTo: '#letter' });
await shot('about-sa', '/sa/about/');
await shot('visit-en-contact', '/visit/', { scrollTo: '#contact' });
await shot('moments-en', '/moments/', { scrollTo: 'main ul' });
await shot('mobile-home-hi', '/hi/', { width: 390, height: 844, full: true });
await shot('mobile-donate-en-give', '/donate/', { width: 390, height: 844, scrollTo: '#give' });
await browser.close();
preview.kill();
