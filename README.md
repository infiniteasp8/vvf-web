# Ved Vidyalaya Foundation — website

A trilingual (English · हिन्दी · संस्कृतम्) static website for a Gurukul that keeps the Vedic oral tradition alive. Built with Astro, deployed as plain files to any free static host, with no backend and no payment gateway: donations go by UPI QR, UPI ID and bank transfer.

- **Design**: Direction B "Serene Gurukul" (paper, ink, kesari, night). Design canvas: https://claude.ai/artifact/Sft2yteYmRWma8xdHBAzYS
- **Stack and decisions**: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Editing text, photos, UPI and bank details**: [docs/CONTENT-GUIDE.md](docs/CONTENT-GUIDE.md)
- **Deploying for free**: [docs/DEPLOY.md](docs/DEPLOY.md)

## Quick start

Requires Node 22 or newer (`.nvmrc` says 24).

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # static site in dist/
npm run preview    # serve dist/ locally
```

## Before launch

1. `src/data/site.ts` — holds the Foundation's UPI ID, Yes Bank account, WhatsApp number, address and map link. The email is blank (which hides the email links) until the Foundation has one. The QR code is generated from the UPI ID at build time and carries the same payload as the bank's printed QR.
2. `SITE_URL` — set it in the hosting dashboard (or `.env`) to the real domain, e.g. `https://www.vedvidyalaya.org`. It drives canonical links, the sitemap and social images.
3. Photographs — drop real images into `src/assets/moments/` and point the JSON files in `src/content/moments/` at them.

Have the Hindi and Sanskrit copy in `src/i18n/messages/` read by someone from the Gurukul before launch.

## Scripts

| Command                 | What it does                                                     |
| ----------------------- | ---------------------------------------------------------------- |
| `npm run dev`           | Development server with hot reload                               |
| `npm run build`         | Production build to `dist/` (also renders the Open Graph images) |
| `npm run preview`       | Serve the production build locally                               |
| `npm run check`         | Astro and TypeScript type-check                                  |
| `npm run lint`          | ESLint (TypeScript, Astro, accessibility rules)                  |
| `npm run format`        | Prettier                                                         |
| `npm run test`          | Unit tests (Vitest): routing, translations, UPI, structured data |
| `npm run test:e2e`      | Browser tests (Playwright + axe): every page, every language     |
| `npm run validate:html` | HTML validity of the built site                                  |
| `npm run lighthouse`    | Lighthouse scores for three pages (needs Chrome)                 |
| `npm run brand <file>`  | Cut the logo out of a JPG/PNG into `src/assets/brand/`           |
| `npm run icons`         | Re-render favicons, app icons and `public/brand/` from the logo  |
| `npm run ci`            | Everything the CI pipeline runs, in order                        |

## Project layout

```
src/
  data/site.ts            ← UPI, bank, contact details (edit this)
  i18n/messages/{en,hi,sa}/*.json   ← all page copy, one file per page per language
  content/                ← moments (photos/films), stories, voices, faq — JSON, trilingual
  assets/moments/         ← photographs referenced by content/moments
  components/             ← Astro components (no framework, no client JS except small scripts)
  layouts/BaseLayout.astro← <head>, SEO, fonts, header, footer
  pages/[...lang]/*.astro ← one file per page; renders /, /hi/, /sa/
  pages/og/[page].png.ts  ← Open Graph images rendered at build time
  scripts/                ← arrival sequence, tabs, carousel, copy buttons, mobile nav
  styles/global.css       ← design tokens, typography, motion
public/_headers           ← security + caching headers (Cloudflare Pages, Netlify)
tests/unit, tests/e2e     ← Vitest and Playwright
.github/workflows/ci.yml  ← check, lint, test, build, validate, e2e on every push
```

## Quality gates

Every push runs type-check, lint, formatting, unit tests, a production build, HTML validation and the Playwright suite (including axe accessibility checks on desktop and mobile). Lighthouse on the built site scores 100 for Accessibility, Best Practices and SEO, and 86–89 for Performance under the simulated slow-4G mobile profile (fonts for three scripts are the remaining cost).
