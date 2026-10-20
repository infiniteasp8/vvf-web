/** Observed FCP/LCP on a fast local connection, with and without the arrival sequence. */
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
const port = 4324;
const base = `http://localhost:${port}`;
const preview = spawn('npx', ['astro', 'preview', '--port', String(port)], { stdio: 'ignore' });
for (let i = 0; i < 60; i++) {
  try {
    if ((await fetch(base + '/')).ok) break;
  } catch {}
  await sleep(500);
}
const browser = await chromium.launch();
async function measure(url, skip) {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
  const page = await ctx.newPage();
  if (skip) await page.addInitScript(() => sessionStorage.setItem('vvf-arrival-seen', '1'));
  await page.addInitScript(() => {
    window.__lcp = [];
    new PerformanceObserver((l) =>
      l.getEntries().forEach((e) =>
        window.__lcp.push({
          t: e.startTime,
          el: e.element?.tagName + '.' + (e.element?.className || '').toString().slice(0, 30),
        }),
      ),
    ).observe({ type: 'largest-contentful-paint', buffered: true });
  });
  await page.goto(base + url);
  await sleep(6000);
  const r = await page.evaluate(() => ({
    fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
    lcp: window.__lcp.at(-1),
  }));
  console.log(
    url.padEnd(10),
    skip ? 'no-arrival' : 'arrival   ',
    'FCP',
    Math.round(r.fcp),
    'ms  LCP',
    Math.round(r.lcp?.t ?? -1),
    'ms ',
    r.lcp?.el,
  );
  await ctx.close();
}
await measure('/', false);
await measure('/', true);
await measure('/hi/', false);
await measure('/donate/', true);
await browser.close();
preview.kill();
