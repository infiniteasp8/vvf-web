import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { skipArrival } from './helpers';

// Animations are disabled so axe measures the settled page, not a frame mid-fade.
test.use({ reducedMotion: 'reduce' });

const urls = [
  '/',
  '/hi/',
  '/sa/',
  '/donate/',
  '/hi/donate/',
  '/visit/',
  '/moments/',
  '/education/',
];

for (const url of urls) {
  test(`${url} has no serious accessibility violations`, async ({ page }) => {
    await skipArrival(page);
    await page.goto(url);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );
    expect(
      serious.map(
        (v) => `${v.id}: ${v.help} (${v.nodes.length} nodes) ${v.nodes[0]?.target.join(' ')}`,
      ),
    ).toEqual([]);
  });
}
