import { describe, expect, it } from 'vitest';
import {
  alternatesFor,
  defaultLocale,
  isLocale,
  localeFromParam,
  localePath,
  localeStaticPaths,
  locales,
  stripLocale,
} from '@/i18n';

describe('locale helpers', () => {
  it('knows exactly three locales with English as default', () => {
    expect(locales).toEqual(['en', 'hi', 'sa']);
    expect(defaultLocale).toBe('en');
    expect(isLocale('hi')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });

  it('keeps English at the root and prefixes the others', () => {
    expect(localePath('en', '/')).toBe('/');
    expect(localePath('hi', '/')).toBe('/hi/');
    expect(localePath('sa', '/donate/')).toBe('/sa/donate/');
  });

  it('normalises slashes and keeps anchors and queries', () => {
    expect(localePath('en', 'about')).toBe('/about/');
    expect(localePath('hi', '/about')).toBe('/hi/about/');
    expect(localePath('hi', '/donate/#give')).toBe('/hi/donate/#give');
    expect(localePath('sa', '/visit?x=1')).toBe('/sa/visit/?x=1');
  });

  it('strips a locale prefix from a pathname', () => {
    expect(stripLocale('/')).toEqual({ locale: 'en', path: '/' });
    expect(stripLocale('/hi/')).toEqual({ locale: 'hi', path: '/' });
    expect(stripLocale('/sa/donate/')).toEqual({ locale: 'sa', path: '/donate/' });
    expect(stripLocale('/history/')).toEqual({ locale: 'en', path: '/history/' });
  });

  it('builds hreflang alternates with English as x-default', () => {
    const alts = alternatesFor('/donate/');
    expect(alts.map((a) => a.hreflang)).toEqual(['en', 'hi', 'sa', 'x-default']);
    expect(alts.find((a) => a.hreflang === 'x-default')?.path).toBe('/donate/');
    expect(alts.find((a) => a.hreflang === 'sa')?.path).toBe('/sa/donate/');
  });

  it('produces one static path per locale with English unprefixed', () => {
    const paths = localeStaticPaths();
    expect(paths).toHaveLength(3);
    expect(paths[0]?.params.lang).toBeUndefined();
    expect(paths.map((p) => p.props.locale)).toEqual(['en', 'hi', 'sa']);
  });

  it('resolves route params and rejects unknown ones', () => {
    expect(localeFromParam(undefined)).toBe('en');
    expect(localeFromParam('sa')).toBe('sa');
    expect(() => localeFromParam('fr')).toThrow();
  });
});
