import { describe, expect, it } from 'vitest';
import { fill, messages } from '@/i18n/messages';
import { locales } from '@/i18n';

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

/** Every leaf path in a nested object, with array indices collapsed to []. */
function leafPaths(value: Json, prefix = ''): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((v) => leafPaths(v, `${prefix}[]`));
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) => leafPaths(v, prefix ? `${prefix}.${k}` : k));
  }
  return [prefix];
}

function leaves(value: Json, prefix = ''): Array<[string, Json]> {
  if (Array.isArray(value)) return value.flatMap((v, i) => leaves(v, `${prefix}[${i}]`));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) => leaves(v, prefix ? `${prefix}.${k}` : k));
  }
  return [[prefix, value]];
}

describe('translations', () => {
  const namespaces = Object.keys(messages.en) as Array<keyof typeof messages.en>;

  it.each(namespaces)('"%s" has the same keys in every language', (ns) => {
    const reference = new Set(leafPaths(messages.en[ns] as Json));
    for (const locale of locales) {
      const keys = new Set(leafPaths(messages[locale][ns] as Json));
      expect([...keys].sort(), `${locale}/${ns}`).toEqual([...reference].sort());
    }
  });

  it.each(namespaces)('"%s" has no empty strings in any language', (ns) => {
    for (const locale of locales) {
      for (const [path, value] of leaves(messages[locale][ns] as Json)) {
        expect(
          typeof value === 'string' && value.trim().length > 0,
          `${locale}/${ns}.${path}`,
        ).toBe(true);
      }
    }
  });

  it('keeps {placeholders} consistent across languages', () => {
    const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();
    for (const ns of namespaces) {
      const en = new Map(leaves(messages.en[ns] as Json));
      for (const locale of locales) {
        for (const [path, value] of leaves(messages[locale][ns] as Json)) {
          const ref = en.get(path);
          if (typeof ref === 'string' && typeof value === 'string') {
            expect(placeholders(value), `${locale}/${ns}.${path}`).toEqual(placeholders(ref));
          }
        }
      }
    }
  });

  it('never makes legal or registration claims the Foundation has not confirmed', () => {
    const banned = /\b(80G|12A|FCRA|PAN|registered|Section 8)\b/i;
    for (const locale of locales) {
      for (const ns of namespaces) {
        for (const [path, value] of leaves(messages[locale][ns] as Json)) {
          if (typeof value === 'string') {
            expect(banned.test(value), `${locale}/${ns}.${path}: "${value}"`).toBe(false);
          }
        }
      }
    }
  });

  it('fills placeholders and leaves unknown ones alone', () => {
    expect(fill('Copy {field}', { field: 'IFSC' })).toBe('Copy IFSC');
    expect(fill('Voice {n} of {total}', { n: 2 })).toBe('Voice 2 of {total}');
  });
});
