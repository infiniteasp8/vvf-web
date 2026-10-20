import { expect, test } from '@playwright/test';
import { skipArrival, watchErrors } from './helpers';

test.describe('give page', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await skipArrival(page);
  });

  test('copies the UPI ID and shows a Copied state that resets', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/donate/');
    const button = page.locator('#give button[data-copy="yespay.bizsbiz59861@yesbankltd"]');
    await button.scrollIntoViewIfNeeded();
    await button.click();
    await expect(button).toHaveClass(/is-done/);
    await expect(button).toContainText('Copied');
    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).toBe('yespay.bizsbiz59861@yesbankltd');
    await expect(button).not.toHaveClass(/is-done/, { timeout: 4000 });
    await expect(button).toContainText('Copy');
    expect(errors).toEqual([]);
  });

  test('copies all bank details as one block', async ({ page }) => {
    await page.goto('/donate/');
    const button = page.locator('#give button[data-label="Copy all details"]');
    await button.scrollIntoViewIfNeeded();
    await button.click();
    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard.split('\n')).toEqual([
      'Ved Vidyalaya Foundation',
      'A/c 066388700000987',
      'IFSC YESB0000663',
      'Yes Bank, K.P. Kakkar Road, Prayagraj',
    ]);
  });

  test('has the letter, the FAQ and structured data for donations', async ({ page }) => {
    await page.goto('/hi/donate/');
    await expect(page.locator('#letter')).toBeVisible();
    const faq = page.locator('details.faq');
    await expect(faq).toHaveCount(5);
    await faq.first().locator('summary').click();
    await expect(faq.first()).toHaveAttribute('open', '');

    const types = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((scripts) => scripts.map((s) => JSON.parse(s.textContent ?? '{}')['@type']));
    expect(types).toContain('DonateAction');
    expect(types).toContain('FAQPage');
  });

  test('hero links jump to the give panel and the letter', async ({ page }) => {
    await page.goto('/donate/');
    await page.locator('main a[href="#letter"]').first().click();
    await expect(page).toHaveURL(/#letter$/);
    await page.locator('main a[href="#give"]').first().click();
    await expect(page).toHaveURL(/#give$/);
  });
});
