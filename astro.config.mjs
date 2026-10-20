// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

/**
 * Public URL of the deployed site. Set SITE_URL in the hosting dashboard
 * (Cloudflare Pages / Netlify / Vercel) or in a local .env file.
 */
const site = process.env.SITE_URL?.replace(/\/$/, '') || 'https://www.vedvidyalaya.org';

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  compressHTML: true,
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'hi', 'sa'],
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', hi: 'hi', sa: 'sa' },
      },
      changefreq: 'monthly',
      priority: 0.7,
    }),
  ],
  build: {
    // Small per-page stylesheets are inlined (the CSP allows inline styles); scripts stay external.
    inlineStylesheets: 'always',
    assets: '_assets',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
