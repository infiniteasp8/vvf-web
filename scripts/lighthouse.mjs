/**
 * Runs Lighthouse against the production build for a few representative pages
 * and prints the category scores. Requires Google Chrome on the machine.
 *
 *   npm run build && npm run lighthouse
 */
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { setTimeout as sleep } from 'node:timers/promises';

const port = 4322;
const base = `http://localhost:${port}`;
const pages = ['/', '/hi/', '/donate/'];

await mkdir('.lighthouse', { recursive: true });

const preview = spawn('npx', ['astro', 'preview', '--port', String(port)], { stdio: 'ignore' });
try {
  await waitFor(`${base}/`);
  for (const path of pages) {
    const name = path === '/' ? 'home' : path.replace(/\//g, '-').replace(/^-|-$/g, '');
    const out = `.lighthouse/${name}`;
    await run('npx', [
      '--yes',
      'lighthouse@12',
      `${base}${path}`,
      '--quiet',
      '--output=json',
      '--output=html',
      `--output-path=${out}`,
      '--chrome-flags=--headless=new --no-sandbox',
      '--only-categories=performance,accessibility,best-practices,seo',
    ]);
    const { readFile } = await import('node:fs/promises');
    const report = JSON.parse(await readFile(`${out}.report.json`, 'utf8'));
    const scores = Object.entries(report.categories)
      .map(([key, cat]) => `${key}=${Math.round(cat.score * 100)}`)
      .join('  ');
    console.log(`${path.padEnd(10)} ${scores}`);
  }
} finally {
  preview.kill();
}

async function waitFor(url) {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // not up yet
    }
    await sleep(500);
  }
  throw new Error(`Preview server did not start at ${url}`);
}

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit' });
    child.on('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`)),
    );
  });
}
