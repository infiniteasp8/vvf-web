import type { Locale } from '@/i18n';
import { getCollection } from 'astro:content';

/** Pages that get a generated Open Graph image, keyed by their og/<key>.png name. */
export const ogPages = [
  'home',
  'about',
  'education',
  'life',
  'moments',
  'donate',
  'visit',
] as const;
export type OgPage = (typeof ogPages)[number];

export async function featuredMoments() {
  const all = await getCollection('moments', ({ data }) => data.featured);
  return all.sort((a, b) => a.data.order - b.data.order);
}

export async function allMoments() {
  const all = await getCollection('moments');
  return all.sort((a, b) => a.data.order - b.data.order || b.data.date.localeCompare(a.data.date));
}

export async function stories() {
  const all = await getCollection('stories');
  return all.sort((a, b) => a.data.order - b.data.order);
}

export async function voices() {
  const all = await getCollection('voices');
  return all.sort((a, b) => a.data.order - b.data.order);
}

export async function faqFor(page: 'donate' | 'visit', locale: Locale) {
  const all = await getCollection('faq', ({ data }) => data.page === page);
  const sorted = all.sort((a, b) => a.data.order - b.data.order);
  return {
    entries: sorted,
    plain: sorted.map((e) => ({
      question: e.data.question[locale],
      answer: e.data.answer[locale],
    })),
  };
}
