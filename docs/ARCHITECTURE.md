# Architecture

## Goals that shaped it

- **Zero running cost.** Static files only; free hosting; no server, database or paid service.
- **Three languages as equals.** English, Hindi and Sanskrit each get full pages, correct `lang`, hreflang links, their own typefaces and type scale.
- **Search-engine ready.** Every page has a canonical URL, descriptions, Open Graph images, JSON-LD structured data, a sitemap with language alternates, and clean HTML.
- **Donations without a gateway.** UPI QR, UPI deep link, UPI ID and bank details. Nothing is collected on the site.
- **Content the Foundation can edit** today in JSON files, and later through an admin panel without rewriting the site.
- **Quiet, meaningful motion** that never gets in the way: skippable, once per session, off for people who prefer reduced motion.

## Stack

| Layer         | Choice                                                                                | Why                                                                                                                                                                                          |
| ------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework     | **Astro 5** (static output)                                                           | Ships zero JavaScript by default, first-class content collections and i18n routing, image pipeline, build-time endpoints. The best fit for a content site that must be fast and SEO-perfect. |
| Styling       | **Tailwind CSS 4** + a small `global.css` of design tokens, type utilities and motion | Tokens from the design system live in `@theme`; components stay readable; no runtime CSS.                                                                                                    |
| Fonts         | **Fontsource** (self-hosted EB Garamond, Tiro Devanagari Hindi/Sanskrit, Mukta)       | No third-party requests, no consent banner, cached for a year. Only the subsets a page uses are downloaded.                                                                                  |
| Interactivity | Plain TypeScript modules (`src/scripts/`)                                             | Tabs, carousel, copy buttons, mobile nav and the arrival sequence need a few hundred lines, not a framework.                                                                                 |
| Content       | JSON files validated by Zod schemas (`src/content.config.ts`) + typed message bundles | Safe to edit by hand; a wrong field fails the build with a clear message; a future CMS can write the same files.                                                                             |
| Images        | `astro:assets`                                                                        | Real photographs will be resized and converted to modern formats automatically.                                                                                                              |
| Social images | **satori** + **resvg** at build time (`src/pages/og/[page].png.ts`)                   | One branded 1200×630 image per page, no design tool needed when titles change.                                                                                                               |
| QR code       | `qrcode` at build time                                                                | The QR is generated from the UPI ID in `site.ts`, so it can never disagree with the printed ID or the "open UPI app" link.                                                                   |
| Tests         | Vitest (unit) · Playwright + axe (end-to-end) · html-validate · Lighthouse            | Routing and translations are unit-tested; every page in every language is loaded in a real browser on desktop and mobile and checked for errors, metadata and accessibility.                 |
| Hosting       | Any static host; **Cloudflare Pages** recommended                                     | Free, unlimited bandwidth, global CDN, custom domain, reads `public/_headers`. Netlify, Vercel and GitHub Pages work too (see DEPLOY.md).                                                    |

### Options considered

| Option                          | Verdict                                                                                                                                                                                                                                 |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Next.js (static export)         | Heavier client bundle, i18n with static export is awkward, more moving parts than this site needs.                                                                                                                                      |
| Hugo / Eleventy                 | Fast and simple, but weaker component model, image handling and i18n ergonomics; harder for a future editor to extend.                                                                                                                  |
| WordPress / Wix / Squarespace   | Need hosting or a subscription, slow by default, and lock the content in. The Foundation's content is more valuable as plain files it owns.                                                                                             |
| Payment gateway (Razorpay etc.) | Costs a percentage of every gift and requires registration details the site deliberately does not claim. UPI and bank transfer are free and arrive whole.                                                                               |
| Astro 7 instead of Astro 5      | Astro 7 is current, but needs Node 22.12+ everywhere and has a different plugin ecosystem. Astro 5 is still maintained and is the version most tooling (including CMS integrations) targets. Upgrade later with `npx @astrojs/upgrade`. |

## How a page is built

```
src/pages/[...lang]/donate.astro
  └─ getStaticPaths() → "/", "/hi/", "/sa/"        (src/i18n/index.ts)
  └─ getMessages(locale) → typed copy              (src/i18n/messages.ts)
  └─ getCollection('faq') → trilingual entries     (src/content/)
  └─ <BaseLayout> → <Seo/>, JSON-LD, header, footer
        └─ components render the sections
```

- **Routing.** English lives at the root (`/about/`), Hindi and Sanskrit under a prefix (`/hi/about/`, `/sa/about/`). Slugs stay in Latin in every language so links never break when a translation lags.
- **Translations.** `src/i18n/messages/<lang>/<page>.json`. The English files define the shape; TypeScript and a unit test enforce that Hindi and Sanskrit have the same keys, no empty strings and the same `{placeholders}`.
- **Content collections.** `moments`, `stories`, `voices`, `faq` are JSON files with `{ en, hi, sa }` objects for every piece of text, so one photograph carries three captions.
- **SEO.** `Seo.astro` emits title, description, canonical, four hreflang links (en, hi, sa, x-default), Open Graph and Twitter tags. `lib/seo.ts` builds JSON-LD: `NGO` + `EducationalOrganization`, `WebSite`, `WebPage`, `BreadcrumbList`, `FAQPage`, `DonateAction`. `@astrojs/sitemap` writes a sitemap with language alternates; `robots.txt` points at it.
- **Security.** `public/_headers` sets a strict Content-Security-Policy (scripts only from the site itself), HSTS, frame denial and a year-long cache for hashed assets. No cookies, no analytics, no third-party scripts.
- **Performance.** No framework runtime; one small script bundle; fonts preloaded per language; the hero and lamp illustrations are layered SVGs animated on the compositor; scroll reveals use CSS scroll-driven animations with an IntersectionObserver fallback; everything honours `prefers-reduced-motion`.

## The arrival sequence

A fixed overlay plays a 3.5-second sequence on the first visit of a session: the lamp lights, the horizon draws, the sun rises, the mantra "asato mā sadgamaya" rises word by word, then the curtain lifts onto the hero. It is pure CSS; `src/scripts/arrival.ts` only decides whether to show it (session storage, reduced motion), handles Skip, Escape and Replay, and removes the overlay afterwards. While the overlay is up the hero is already painted underneath, so the largest-contentful-paint metric is not delayed by the animation.

## Roadmap for the admin panel (next phase)

The content model was shaped for a git-based CMS such as **Keystatic** or **Decap CMS**, both free:

- `src/data/site.ts` → a "Site settings" singleton (UPI, bank, contact).
- `src/i18n/messages/*` → "Page text" singletons per language.
- `src/content/moments` → a "Moments" collection with image upload and trilingual captions; films by YouTube/Vimeo link.
- `src/content/stories`, `voices`, `faq` → collections.

Editors log in with GitHub, edit in a form, and every save becomes a commit that triggers a rebuild on the host. No server is needed.
