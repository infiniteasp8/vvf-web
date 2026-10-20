import type { Page } from '@playwright/test';

export const locales = [
  { code: 'en', prefix: '', lang: 'en' },
  { code: 'hi', prefix: '/hi', lang: 'hi' },
  { code: 'sa', prefix: '/sa', lang: 'sa' },
] as const;

export const pages = ['/', '/about/', '/education/', '/life/', '/moments/', '/donate/', '/visit/'];

/** Mark the arrival sequence as already seen so clicks are not blocked by the overlay. */
export async function skipArrival(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.sessionStorage.setItem('vvf-arrival-seen', '1');
  });
}

/** Collect console errors and uncaught exceptions for the life of the page. */
export function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
  });
  return errors;
}
