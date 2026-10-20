# Deploying for free

The site is a folder of static files (`dist/`). Any static host serves it. Steps for the four common free options follow; Cloudflare Pages is recommended.

Common to all:

- **Build command**: `npm run build`
- **Output directory**: `dist`
- **Node version**: 22 (set `NODE_VERSION=22` where the host asks)
- **Environment variable**: `SITE_URL=https://your-domain.org` (no trailing slash). This is the public address used in canonical links, the sitemap and social images. Without it the build assumes `https://www.vedvidyalaya.org`.

Push the repository to GitHub first:

```bash
git add -A
git commit -m "Ved Vidyalaya Foundation website"
git branch -M main
git remote add origin https://github.com/<you>/vvf-web.git
git push -u origin main
```

## Cloudflare Workers (what the live site uses)

The repository is connected to a git-backed Worker named `vvf-web`. Every push to `main` triggers a build on Cloudflare. `wrangler.jsonc` in the repository tells Wrangler to publish `dist/` as static assets with no server code, so the deploy step needs nothing else.

Project settings (Workers & Pages → vvf-web → Settings → Build):

| Setting                   | Value                                                                          |
| ------------------------- | ------------------------------------------------------------------------------ |
| Build command             | `npm run build`                                                                |
| Deploy command            | `npx wrangler deploy`                                                          |
| Root directory            | `/`                                                                            |
| Build variable `SITE_URL` | the real address without a trailing slash, e.g. `https://www.vedvidyalaya.org` |

Node comes from `.nvmrc`. The headers in `public/_headers` and the custom 404 page are honoured by the assets host. Custom domain: Settings → Domains & Routes → Add → Custom domain, then set `SITE_URL` to match and redeploy.

To check a deploy locally without publishing: `npx wrangler deploy --dry-run` after `npm run build`.

## Cloudflare Pages (alternative)

Free, unlimited bandwidth, global CDN, honours `public/_headers` (security and caching headers).

1. https://dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to Git → choose the repository.
2. Framework preset: **Astro**. Build command `npm run build`, output `dist`.
3. Environment variables (Production): `NODE_VERSION` = `22`, `SITE_URL` = your domain.
4. Save and Deploy. Every push to `main` redeploys; pull requests get preview URLs.
5. Custom domain: Pages project → Custom domains → add `www.your-domain.org` (and the apex). Cloudflare issues the certificate.
6. Optional: Web Analytics (cookieless, free) from the Cloudflare dashboard. If you enable it, add `https://static.cloudflareinsights.com` to `script-src` and `connect-src` in `public/_headers`.

## Netlify

`netlify.toml` is already in the repository (build, publish directory, Node version). Netlify also reads `public/_headers`.

1. https://app.netlify.com → Add new site → Import an existing project → GitHub → repository.
2. Confirm build `npm run build`, publish `dist`.
3. Site configuration → Environment variables → `SITE_URL`.
4. Domain management → add your domain.

## Vercel

1. https://vercel.com/new → import the repository. Vercel detects Astro.
2. Environment variables → `SITE_URL`.
3. Headers: Vercel does not read `_headers`. Copy the rules from `public/_headers` into a `vercel.json` `headers` block if you deploy here.

## GitHub Pages

Works for a custom domain. Add a workflow:

```yaml
# .github/workflows/pages.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions: { contents: read, pages: write, id-token: write }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run build
        env: { SITE_URL: https://www.your-domain.org }
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages, url: ${{ steps.deployment.outputs.page_url }} }
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Then Settings → Pages → Source: GitHub Actions, and set the custom domain (GitHub writes the `CNAME`). GitHub Pages cannot set custom response headers, so the security headers in `public/_headers` do not apply there.

## After the first deploy

1. Open the site in all three languages and press the language switcher on an inner page.
2. Scan the UPI QR with a phone: the app must show the Foundation's name.
3. Submit the sitemap in Google Search Console: `https://your-domain.org/sitemap-index.xml`.
4. Test one page in https://search.google.com/test/rich-results (expect NGO/EducationalOrganization, BreadcrumbList, FAQPage on the give page).
5. Share a link on WhatsApp to see the social image.
6. Run https://pagespeed.web.dev on the home page.

## DNS checklist

| Record | Name  | Value                                                                                  |
| ------ | ----- | -------------------------------------------------------------------------------------- |
| CNAME  | `www` | the host's target (shown in its dashboard)                                             |
| apex   | `@`   | host-specific (Cloudflare: flatten; Netlify: load-balancer IP; GitHub: four A records) |

Redirect the apex to `www` (or the reverse) so there is one canonical address; the site assumes `SITE_URL` is the canonical one.
