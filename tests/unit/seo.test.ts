import { describe, expect, it } from 'vitest';
import {
  absoluteUrl,
  breadcrumbJsonLd,
  donateActionJsonLd,
  faqJsonLd,
  organizationJsonLd,
  webPageJsonLd,
  websiteJsonLd,
} from '@/lib/seo';

const siteUrl = new URL('https://example.org');

describe('structured data', () => {
  it('builds absolute URLs from locale paths', () => {
    expect(absoluteUrl(siteUrl, '/hi/donate/')).toBe('https://example.org/hi/donate/');
  });

  it('describes the organisation as an NGO and a school', () => {
    const org = organizationJsonLd(siteUrl, 'hi', 'desc');
    expect(org['@type']).toEqual(['NGO', 'EducationalOrganization']);
    expect(org.url).toBe('https://example.org/hi/');
    expect(org.inLanguage).toBe('hi');
    expect(org['@id']).toBe('https://example.org/#organization');
  });

  it('gives the organisation a postal address, a map and coordinates', () => {
    const org = organizationJsonLd(siteUrl, 'en', 'desc');
    const address = org.address as Record<string, string>;
    expect(address['@type']).toBe('PostalAddress');
    expect(address.addressCountry).toBe('IN');
    expect(address.postalCode).toMatch(/^\d{6}$/);
    expect(address.streetAddress).not.toContain(address.postalCode);
    expect(org.hasMap).toMatch(/^https:\/\//);
    const geo = org.geo as Record<string, unknown>;
    expect(geo['@type']).toBe('GeoCoordinates');
    expect(typeof geo.latitude).toBe('number');
    expect(typeof geo.longitude).toBe('number');
  });

  it('links the website and pages back to the organisation', () => {
    const web = websiteJsonLd(siteUrl, 'en', 'Name');
    expect(web.publisher).toEqual({ '@id': 'https://example.org/#organization' });
    const page = webPageJsonLd(siteUrl, 'sa', { path: '/about/', title: 't', description: 'd' });
    expect(page.url).toBe('https://example.org/sa/about/');
  });

  it('numbers breadcrumbs from one', () => {
    const crumbs = breadcrumbJsonLd(siteUrl, 'en', [
      { name: 'Home', path: '/' },
      { name: 'Give', path: '/donate/' },
    ]);
    const items = crumbs.itemListElement as Array<{ position: number; item: string }>;
    expect(items.map((i) => i.position)).toEqual([1, 2]);
    expect(items[1]?.item).toBe('https://example.org/donate/');
  });

  it('builds FAQ and DonateAction entries', () => {
    const faq = faqJsonLd([{ question: 'Q', answer: 'A' }]);
    expect(faq['@type']).toBe('FAQPage');
    const donate = donateActionJsonLd(siteUrl, 'hi', 'Give');
    expect(donate.target).toBe('https://example.org/hi/donate/#give');
  });
});
