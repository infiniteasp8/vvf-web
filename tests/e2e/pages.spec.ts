import { expect, test } from '@playwright/test';
import { locales, pages, skipArrival, watchErrors } from './helpers';

for (const locale of locales) {
  for (const path of pages) {
    const url = `${locale.prefix}${path}`;
    test(`${url} renders with the right language, metadata and no errors`, async ({ page }) => {
      await skipArrival(page);
      const errors = watchErrors(page);
      const response = await page.goto(url);
      expect(response?.status()).toBe(200);

      await expect(page.locator('html')).toHaveAttribute('lang', locale.lang);
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();

      const title = await page.title();
      expect(title.length).toBeGreaterThan(10);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{40,}/);

      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical).toHaveAttribute('href', new RegExp(`${url.replace(/\//g, '\\/')}$`));
      await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(4);
      await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute(
        'href',
        new RegExp(`${path.replace(/\//g, '\\/')}$`),
      );
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
        'content',
        /\/og\/\w+\.png$/,
      );
      expect(await page.locator('script[type="application/ld+json"]').count()).toBeGreaterThan(0);

      // Navigation stays inside the current language.
      const navHrefs = await page
        .locator('nav#site-nav ul a')
        .evaluateAll((as) => as.map((a) => a.getAttribute('href') ?? ''));
      expect(navHrefs.length).toBe(6);
      for (const href of navHrefs) {
        if (locale.prefix) expect(href.startsWith(`${locale.prefix}/`)).toBe(true);
        else expect(href.startsWith('/hi/') || href.startsWith('/sa/')).toBe(false);
      }

      expect(errors).toEqual([]);
    });
  }
}

test('the language switcher keeps the visitor on the same page', async ({ page, isMobile }) => {
  await skipArrival(page);
  await page.goto('/donate/');
  const open = async () => {
    if (isMobile) await page.locator('[data-nav-toggle]').click();
  };
  await open();
  await page.locator('header nav[aria-label] a[hreflang="hi"]').first().click();
  await expect(page).toHaveURL(/\/hi\/donate\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'hi');
  await open();
  await page.locator('header nav[aria-label] a[hreflang="sa"]').first().click();
  await expect(page).toHaveURL(/\/sa\/donate\/$/);
  await open();
  await page.locator('header nav[aria-label] a[hreflang="en"]').first().click();
  await expect(page).toHaveURL(/\/donate\/$/);
});

test('a missing page shows the 404 page with links home', async ({ page }) => {
  await skipArrival(page);
  const response = await page.goto('/this-page-does-not-exist/');
  expect(response?.status()).toBe(404);
  await expect(page.locator('h1')).toContainText('gone quiet');
  await expect(page.locator('main a[href="/hi/"]')).toBeVisible();
});

test('robots, sitemap, manifest and social images are served', async ({ request }) => {
  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain('Sitemap:');

  const sitemap = await request.get('/sitemap-index.xml');
  expect(sitemap.status()).toBe(200);

  const urls = await request.get('/sitemap-0.xml');
  const xml = await urls.text();
  expect(xml).toContain('hreflang="sa"');
  expect(xml).toContain('/hi/donate/');

  const og = await request.get('/og/donate.png');
  expect(og.status()).toBe(200);
  expect(og.headers()['content-type']).toContain('image/png');

  const manifest = await request.get('/manifest.webmanifest');
  expect(manifest.status()).toBe(200);
});
