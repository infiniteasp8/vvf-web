import { expect, test } from '@playwright/test';
import { skipArrival } from './helpers';

test.describe('mobile navigation', () => {
  test.skip(({ isMobile }) => !isMobile, 'drawer only exists on small screens');

  test('opens, closes with Escape and shows all six links', async ({ page }) => {
    await skipArrival(page);
    await page.goto('/hi/');
    const toggle = page.locator('[data-nav-toggle]');
    const nav = page.locator('#site-nav');
    await expect(nav).toBeHidden();
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(nav).toBeVisible();
    await expect(nav.locator('ul a')).toHaveCount(6);
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(nav).toBeHidden();
  });

  test('the page never scrolls sideways', async ({ page }) => {
    await skipArrival(page);
    for (const url of ['/', '/sa/donate/', '/hi/moments/']) {
      await page.goto(url);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, url).toBeLessThanOrEqual(1);
    }
  });
});
