import type { APIRoute } from 'astro';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { ogPages, type OgPage } from '@/lib/pages';
import { getMessages } from '@/i18n/messages';
import { site } from '@/data/site';

/**
 * Open Graph images, rendered at build time. English text is used for every
 * language because the renderer cannot shape Devanagari conjuncts reliably.
 *
 * The layout is plain flex rows: satori paints absolutely positioned boxes
 * after their siblings, so a positioned band would cover the title.
 */
const require = createRequire(import.meta.url);

function fontPath(pkg: string, file: string): string {
  return join(dirname(require.resolve(`${pkg}/package.json`)), 'files', file);
}

const t = getMessages('en');
const titles: Record<OgPage, { kicker: string; title: string }> = {
  home: { kicker: t.common.tagline, title: t.home.hero.h1 },
  about: { kicker: t.about.hero.kicker, title: t.about.hero.h1 },
  education: { kicker: t.education.hero.kicker, title: t.education.hero.h1 },
  life: { kicker: t.life.hero.kicker, title: t.life.hero.h1 },
  moments: { kicker: t.moments.hero.kicker, title: t.moments.hero.h1 },
  donate: { kicker: t.donate.hero.kicker, title: t.donate.hero.h1 },
  visit: { kicker: t.visit.hero.kicker, title: t.visit.hero.h1 },
};

export function getStaticPaths() {
  return ogPages.map((page) => ({ params: { page } }));
}

const WIDTH = 1200;
const HEIGHT = 630;
const TOP = 296; // height of the paper band above the rule
const LOGO_HEIGHT = 228;

export const GET: APIRoute = async ({ params }) => {
  const page = params.page as OgPage;
  const { kicker, title } = titles[page];
  const [garamond, mukta, logoPng] = await Promise.all([
    readFile(fontPath('@fontsource/eb-garamond', 'eb-garamond-latin-500-normal.woff')),
    readFile(fontPath('@fontsource/mukta', 'mukta-latin-600-normal.woff')),
    sharp(join(process.cwd(), 'src/assets/brand/logo.png'))
      .resize({ height: 512 })
      .png()
      .toBuffer(),
  ]);
  const logoMeta = await sharp(logoPng).metadata();
  const logoWidth = Math.round((LOGO_HEIGHT * (logoMeta.width ?? 1)) / (logoMeta.height ?? 1));
  const logoDataUri = `data:image/png;base64,${logoPng.toString('base64')}`;

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: WIDTH,
          height: HEIGHT,
          display: 'flex',
          flexDirection: 'column',
          background: '#FAF6EE',
          color: '#1F1A17',
          fontFamily: 'EB Garamond',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                height: TOP,
                padding: '40px 72px 0',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      marginTop: 24,
                      fontFamily: 'Mukta',
                      fontSize: 24,
                      letterSpacing: 4,
                      textTransform: 'uppercase',
                      color: '#B5551A',
                    },
                    children: kicker,
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', width: logoWidth, height: LOGO_HEIGHT },
                    children: {
                      type: 'img',
                      props: { src: logoDataUri, width: logoWidth, height: LOGO_HEIGHT },
                    },
                  },
                },
              ],
            },
          },
          {
            type: 'div',
            props: { style: { display: 'flex', height: 3, background: '#1F1A17', opacity: 0.85 } },
          },
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                flexGrow: 1,
                padding: '24px 72px 56px',
                background: '#F1E9D8',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      maxWidth: 900,
                      fontSize: 54,
                      lineHeight: 1.12,
                      letterSpacing: -0.5,
                    },
                    children: title,
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      marginTop: 28,
                      fontFamily: 'Mukta',
                      fontSize: 26,
                      color: '#5A4E44',
                    },
                    children: `${site.name} · vedvidyalaya.org`,
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        { name: 'EB Garamond', data: garamond, weight: 500, style: 'normal' },
        { name: 'Mukta', data: mukta, weight: 600, style: 'normal' },
      ],
    },
  );

  const png = new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } }).render().asPng();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
