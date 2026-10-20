import { expect, test } from '@playwright/test';
import { skipArrival, watchErrors } from './helpers';

test.describe('arrival sequence', () => {
  test('plays on the first visit, can be skipped, and stays away for the session', async ({
    page,
  }) => {
    const errors = watchErrors(page);
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-arrival', 'on');
    await expect(page.locator('[data-intro]')).toBeVisible();

    await page.locator('[data-intro-skip]').click();
    await expect(page.locator('[data-intro]')).toHaveCount(0);
    await expect(page.locator('html')).toHaveAttribute('data-arrival', 'off');
    await expect(page.locator('h1')).toBeVisible();

    await page.goto('/about/');
    await page.goto('/');
    await expect(page.locator('[data-intro]')).toHaveCount(0);
    await expect(page.locator('html')).toHaveAttribute('data-arrival', 'off');
    expect(errors).toEqual([]);
  });

  test('finishes on its own and lifts the curtain', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-arrival', 'on');
    await expect(page.locator('html')).toHaveAttribute('data-arrival', 'done', { timeout: 8000 });
    await expect(page.locator('[data-intro]')).toHaveCount(0);
  });

  test('never shows for people who prefer reduced motion', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-arrival', 'off');
    await expect(page.locator('h1')).toBeVisible();
    await context.close();
  });
});

test.describe('interactive sections', () => {
  test.beforeEach(async ({ page }) => {
    await skipArrival(page);
    await page.goto('/');
  });

  test('learning tabs switch panels by click and keyboard', async ({ page }) => {
    const tabs = page.locator('#learning [role="tab"]');
    await expect(tabs).toHaveCount(4);
    await expect(page.locator('#learning-panel-0')).toBeVisible();
    await expect(page.locator('#learning-panel-1')).toBeHidden();

    await tabs.nth(1).click();
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#learning-panel-1')).toBeVisible();
    await expect(page.locator('#learning-panel-0')).toBeHidden();

    await tabs.nth(1).press('ArrowRight');
    await expect(tabs.nth(2)).toBeFocused();
    await expect(page.locator('#learning-panel-2')).toBeVisible();
    await tabs.nth(2).press('End');
    await expect(page.locator('#learning-panel-3')).toBeVisible();
  });

  test('the day timeline moves through the hours', async ({ page }) => {
    const hours = page.locator('#day [role="tab"]');
    await expect(hours).toHaveCount(6);
    await hours.nth(5).scrollIntoViewIfNeeded();
    await hours.nth(5).click();
    await expect(page.locator('#day-panel-5')).toBeVisible();
    await expect(page.locator('#day-panel-0')).toBeHidden();
    await hours.nth(5).press('ArrowUp');
    await expect(page.locator('#day-panel-4')).toBeVisible();
  });

  test('voices carousel responds to the next button and dots', async ({ page }) => {
    const carousel = page.locator('[data-carousel]');
    await carousel.scrollIntoViewIfNeeded();
    const slides = carousel.locator('[data-slide]');
    await expect(slides.nth(0)).toBeVisible();
    await carousel.locator('[data-next]').click();
    await expect(slides.nth(1)).toBeVisible();
    await expect(slides.nth(0)).toBeHidden();
    await carousel.locator('[data-dot]').nth(2).click();
    await expect(slides.nth(2)).toBeVisible();
    await expect(carousel.locator('[data-dot]').nth(2)).toHaveAttribute('aria-pressed', 'true');
  });

  test('the home page gives the UPI link and bank details', async ({ page }) => {
    const upi = page.locator('#give a[href^="upi://pay"]');
    await expect(upi).toHaveAttribute('href', /pa=yespay\.bizsbiz59861%40yesbankltd/);
    await expect(upi).toHaveAttribute('href', /mc=8211/);
    await expect(upi).toHaveAttribute('href', /cu=INR/);
    await expect(upi).not.toHaveAttribute('href', /am=/);
    await expect(page.locator('#give .qr svg')).toHaveCount(1);
    await expect(page.locator('#give dl')).toContainText('IFSC');
  });
});
