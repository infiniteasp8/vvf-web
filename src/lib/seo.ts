import type { Locale } from '@/i18n';
import { localeMeta, localePath } from '@/i18n';
import { site } from '@/data/site';

export function absoluteUrl(siteUrl: URL | string, path: string): string {
  return new URL(path, siteUrl).toString();
}

type JsonLd = Record<string, unknown>;

export function organizationJsonLd(
  siteUrl: URL | string,
  locale: Locale,
  description: string,
): JsonLd {
  const sameAs = Object.values(site.social).filter((v) => v.length > 0);
  const out: JsonLd = {
    '@context': 'https://schema.org',
    '@type': ['NGO', 'EducationalOrganization'],
    '@id': absoluteUrl(siteUrl, '/#organization'),
    name: site.name,
    alternateName: site.nameDevanagari,
    url: absoluteUrl(siteUrl, localePath(locale, '/')),
    logo: absoluteUrl(siteUrl, '/brand/logo.png'),
    image: absoluteUrl(siteUrl, '/og/home.png'),
    description,
    inLanguage: localeMeta[locale].htmlLang,
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.contact.address.street,
      addressLocality: site.contact.address.locality,
      addressRegion: site.contact.address.region,
      postalCode: site.contact.address.postalCode,
      addressCountry: site.contact.address.country,
    },
  };
  if (site.contact.email) out.email = site.contact.email;
  if (site.contact.phone) out.telephone = site.contact.phone;
  if (site.contact.mapUrl) out.hasMap = site.contact.mapUrl;
  if (site.contact.geo) {
    out.geo = {
      '@type': 'GeoCoordinates',
      latitude: site.contact.geo.latitude,
      longitude: site.contact.geo.longitude,
    };
  }
  if (sameAs.length) out.sameAs = sameAs;
  return out;
}

export function websiteJsonLd(siteUrl: URL | string, locale: Locale, name: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': absoluteUrl(siteUrl, '/#website'),
    name,
    url: absoluteUrl(siteUrl, localePath(locale, '/')),
    inLanguage: localeMeta[locale].htmlLang,
    publisher: { '@id': absoluteUrl(siteUrl, '/#organization') },
  };
}

export function webPageJsonLd(
  siteUrl: URL | string,
  locale: Locale,
  page: { path: string; title: string; description: string },
): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url: absoluteUrl(siteUrl, localePath(locale, page.path)),
    name: page.title,
    description: page.description,
    inLanguage: localeMeta[locale].htmlLang,
    isPartOf: { '@id': absoluteUrl(siteUrl, '/#website') },
    about: { '@id': absoluteUrl(siteUrl, '/#organization') },
  };
}

export function breadcrumbJsonLd(
  siteUrl: URL | string,
  locale: Locale,
  items: Array<{ name: string; path: string }>,
): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(siteUrl, localePath(locale, item.path)),
    })),
  };
}

export function faqJsonLd(items: Array<{ question: string; answer: string }>): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

export function donateActionJsonLd(siteUrl: URL | string, locale: Locale, name: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'DonateAction',
    name,
    target: absoluteUrl(siteUrl, localePath(locale, '/donate/#give')),
    recipient: { '@id': absoluteUrl(siteUrl, '/#organization') },
  };
}
