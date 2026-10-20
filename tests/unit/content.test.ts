import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

/**
 * Guards for the content folders the Foundation will edit by hand or through
 * the future admin panel. These read the JSON files directly so a mistake is
 * caught before the site is built.
 */
const root = resolve(__dirname, '../../src/content');
const locales = ['en', 'hi', 'sa'] as const;

function entries(collection: string): Array<{ file: string; data: Record<string, unknown> }> {
  const dir = join(root, collection);
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((file) => ({ file, data: JSON.parse(readFileSync(join(dir, file), 'utf8')) }));
}

function expectTrilingual(value: unknown, label: string): void {
  expect(value, label).toBeTypeOf('object');
  for (const locale of locales) {
    const text = (value as Record<string, unknown>)[locale];
    expect(typeof text === 'string' && text.trim().length > 0, `${label}.${locale}`).toBe(true);
  }
}

describe('moments', () => {
  const items = entries('moments');

  it('exist and point at images that are present on disk', () => {
    expect(items.length).toBeGreaterThan(0);
    for (const { file, data } of items) {
      const image = resolve(root, 'moments', String(data.image));
      expect(existsSync(image), `${file}: image ${data.image}`).toBe(true);
    }
  });

  it('carry titles and alt text in all three languages and a valid date', () => {
    for (const { file, data } of items) {
      expectTrilingual(data.title, `${file} title`);
      expectTrilingual(data.alt, `${file} alt`);
      expect(String(data.date)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(String(data.date))), `${file} date`).toBe(false);
    }
  });

  it('mark at least one item as featured for the home page', () => {
    expect(items.some(({ data }) => data.featured === true)).toBe(true);
  });
});

describe('stories, voices and faq', () => {
  it.each(['stories', 'voices', 'faq'])('%s entries are trilingual', (collection) => {
    const items = entries(collection);
    expect(items.length).toBeGreaterThan(0);
    for (const { file, data } of items) {
      for (const [key, value] of Object.entries(data)) {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          expectTrilingual(value, `${collection}/${file} ${key}`);
        }
      }
    }
  });

  it('faq entries name the page they belong to', () => {
    for (const { file, data } of entries('faq')) {
      expect(['donate', 'visit'], file).toContain(data.page);
    }
  });
});
