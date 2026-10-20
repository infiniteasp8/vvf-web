/**
 * Locale definitions and URL helpers.
 *
 * English lives at the root ("/about/"); Hindi and Sanskrit are prefixed
 * ("/hi/about/", "/sa/about/"). Slugs stay in Latin in every language so a
 * link never breaks when a translation lags behind.
 */
export const locales = ['en', 'hi', 'sa'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export interface LocaleMeta {
  code: Locale;
  /** Value for <html lang>. */
  htmlLang: string;
  /** English name, used in aria-labels. */
  name: string;
  /** Name in the language itself, used in the switcher. */
  nativeName: string;
  /** Open Graph locale. */
  ogLocale: string;
  /** hreflang value. */
  hreflang: string;
}

export const localeMeta: Record<Locale, LocaleMeta> = {
  en: {
    code: 'en',
    htmlLang: 'en',
    name: 'English',
    nativeName: 'English',
    ogLocale: 'en_IN',
    hreflang: 'en',
  },
  hi: {
    code: 'hi',
    htmlLang: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    ogLocale: 'hi_IN',
    hreflang: 'hi',
  },
  sa: {
    code: 'sa',
    htmlLang: 'sa',
    name: 'Sanskrit',
    nativeName: 'संस्कृतम्',
    ogLocale: 'sa_IN',
    hreflang: 'sa',
  },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value);
}

/** Resolve the `[...lang]` route parameter to a locale. Undefined means English. */
export function localeFromParam(param: string | undefined): Locale {
  if (param === undefined || param === '') return defaultLocale;
  if (isLocale(param)) return param;
  throw new Error(`Unknown locale segment "${param}"`);
}

/** Split a path into its locale prefix and the locale-less remainder. */
export function stripLocale(pathname: string): { locale: Locale; path: string } {
  const match = pathname.match(/^\/(hi|sa)(?=\/|$)(.*)$/);
  if (match && isLocale(match[1])) {
    const rest = match[2] || '/';
    return { locale: match[1], path: ensureSlashes(rest) };
  }
  return { locale: defaultLocale, path: ensureSlashes(pathname || '/') };
}

/** Build the localized URL for a locale-less path such as "/about/#give". */
export function localePath(locale: Locale, path = '/'): string {
  const { pathname, suffix } = splitSuffix(path);
  const clean = ensureSlashes(pathname);
  const prefixed = locale === defaultLocale ? clean : `/${locale}${clean}`;
  return prefixed + suffix;
}

/** hreflang alternates for a locale-less path, English doubling as x-default. */
export function alternatesFor(
  path: string,
): Array<{ hreflang: string; locale: Locale; path: string }> {
  const list = locales.map((locale) => ({
    hreflang: localeMeta[locale].hreflang,
    locale,
    path: localePath(locale, path),
  }));
  list.push({
    hreflang: 'x-default',
    locale: defaultLocale,
    path: localePath(defaultLocale, path),
  });
  return list;
}

/** getStaticPaths() entries for a `[...lang]` route: "/", "/hi/", "/sa/". */
export function localeStaticPaths() {
  return [
    { params: { lang: undefined }, props: { locale: 'en' as Locale } },
    { params: { lang: 'hi' }, props: { locale: 'hi' as Locale } },
    { params: { lang: 'sa' }, props: { locale: 'sa' as Locale } },
  ];
}

function ensureSlashes(p: string): string {
  let out = p.startsWith('/') ? p : `/${p}`;
  if (!out.endsWith('/')) out += '/';
  return out.replace(/\/{2,}/g, '/');
}

function splitSuffix(path: string): { pathname: string; suffix: string } {
  const idx = path.search(/[?#]/);
  if (idx === -1) return { pathname: path, suffix: '' };
  return { pathname: path.slice(0, idx), suffix: path.slice(idx) };
}
