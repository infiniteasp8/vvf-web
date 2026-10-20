import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/** A string in all three languages. */
const trilingual = z.object({ en: z.string(), hi: z.string(), sa: z.string() });

/**
 * Photographs and short films shown on the home page and the Moments page.
 * Add a JSON file per item; images are referenced relative to the JSON file.
 * A future admin panel will write these files for you.
 */
const moments = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/moments' }),
  schema: ({ image }) =>
    z.object({
      kind: z.enum(['photo', 'film']).default('photo'),
      title: trilingual,
      caption: trilingual.optional(),
      /** Alternative text for screen readers and search engines. */
      alt: trilingual,
      image: image(),
      /** For films: a YouTube or Vimeo watch URL. */
      video: z.string().url().optional(),
      /** For films: a short length label such as "4 min". */
      duration: z.string().optional(),
      /** ISO date the moment was taken, e.g. "2026-07-12". */
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      /** Lower numbers appear first. */
      order: z.number().int().default(100),
      /** Featured items appear on the home page. */
      featured: z.boolean().default(false),
      /** "night" places the caption on a dark frame for evening photographs. */
      tone: z.enum(['paper', 'night']).default('paper'),
    }),
});

/** "Seasons of the Gurukul": short stories from the year. */
const stories = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/stories' }),
  schema: z.object({
    kicker: trilingual,
    title: trilingual,
    body: trilingual,
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    order: z.number().int().default(100),
  }),
});

/** Quotes from supporters, parents and former students. Roles only, no names. */
const voices = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/voices' }),
  schema: z.object({
    quote: trilingual,
    who: trilingual,
    where: trilingual,
    order: z.number().int().default(100),
  }),
});

/** Questions and answers, shown on the page named in `page`. */
const faq = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/faq' }),
  schema: z.object({
    page: z.enum(['donate', 'visit']),
    question: trilingual,
    answer: trilingual,
    order: z.number().int().default(100),
  }),
});

export const collections = { moments, stories, voices, faq };
