# Sabha blog

The blog at **sabha.co/blog**: an [EmDash](https://github.com/emdash-cms/emdash) site (Astro on a Cloudflare Worker, with D1 and R2), started from EmDash's Cloudflare blog template. Worker routes on the sabha.co zone send `/blog` and `/_emdash` to it (`wrangler.jsonc`); every other path on sabha.co still reaches Rails.

## Running locally

```bash
pnpm install
pnpm dev
```

Open http://localhost:4321/_emdash/admin and complete the setup wizard, which applies `seed/seed.json`. The site is at http://localhost:4321/blog. Local D1 and R2 live in `.wrangler/`.

## Theme

A minimal theme in Sabha's own design: Instrument Sans and JetBrains Mono (self-hosted from `src/assets/fonts`, the same files the app ships), the app's ink and plum tokens in `src/styles/tokens.css`, and the shell in `src/styles/site.css`. Dark mode follows the visitor's system setting. Article typography is `src/styles/prose.css`.

The pages are deliberately small: a home page that leads with the site tagline (edit it in the admin under Settings), plain post lists, and articles. There are no sidebar widgets or comments, so EmDash widget areas and comment settings have no effect here.

The admin ships in English only (`admin.locales` in `astro.config.mjs`); each extra language adds to the Worker, which has to stay under the free plan's 3 MB compressed.

## Serving under /blog

- `astro.config.mjs` sets `base: "/blog"`, and the Worker routes keep the full path.
- EmDash keeps its admin, API and media URLs at the root (`/_emdash/...`) whatever the base is. That's why `/_emdash/*` is routed to the Worker too, and why those links don't go through `url()`.
- Every public link goes through `url()` in `src/utils/url.ts`. Write `url("/posts")`, never `"/posts"`; a bare root path escapes to Sabha.
- Custom menu items store absolute paths (`/blog/posts`), so do the same when adding menu items in the admin.
- `src/pages/sitemap.xml.ts` replaces EmDash's injected sitemap, which doesn't work under a base ([#2482](https://github.com/emdash-cms/emdash/issues/2482)).

## Deploying

```bash
pnpm run deploy   # astro build && wrangler deploy
```

Content changes made in the admin are live straight away and need no deploy. Only code and template changes do.

### Cloudflare account

The Worker, its D1 database and its R2 bucket live in the Cloudflare account that holds the **sabha.co** zone: account ID `bd5b792fe9596c0bb76ce100dd4f2d65`, pinned as `account_id` in `wrangler.jsonc`. It is *not* the account that holds sabha.chat (`1948dc6c…`).

- Sign in with `pnpm wrangler login` as a member of that account, then check with `pnpm wrangler whoami`; it should list the account above. If you were added to the account after your last login, log in again to pick it up.
- For one-off commands elsewhere, set `CLOUDFLARE_ACCOUNT_ID=bd5b792fe9596c0bb76ce100dd4f2d65`.
- In the dashboard, switch to that account, then open Workers & Pages → `sabha-blog`, D1 → `sabha-blog`, or R2 → `sabha-blog-media`.

First-time setup:

1. `pnpm wrangler login` (see above).
2. Generate the key with `npx emdash secrets generate`, then `pnpm wrangler secret put EMDASH_ENCRYPTION_KEY`. Keep a copy somewhere safe: plugin secrets can't be read back without it, and D1 backups don't include it.
3. `pnpm run deploy`. The first deploy creates the `sabha-blog` D1 database and the `sabha-blog-media` R2 bucket, and attaches the routes.
4. Complete the setup wizard at https://sabha.co/_emdash/admin. Passkeys are bound to `EMDASH_SITE_URL` (https://sabha.co), so never run setup at the workers.dev address.

D1 has Time Travel (point-in-time restore for 30 days); R2 holds the uploads.
