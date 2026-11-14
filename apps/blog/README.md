# Sabha blog

The blog at **next.sabha.co/blog**: an [EmDash](https://github.com/emdash-cms/emdash) site (Astro on a Cloudflare Worker, with D1 and R2), started from EmDash's Cloudflare blog template. Worker routes send `/blog` and `/_emdash` to it (`wrangler.jsonc`); every other path on the host reaches Rails. It moved here from `sabha-co/sabha-blog` and `sabha.co/blog`, history included.

## Running locally

From the workspace root, then this directory:

```bash
pnpm install
cd apps/blog && pnpm dev
```

Open http://localhost:4321/_emdash/admin and complete the setup wizard, which applies `seed/seed.json`. The site is at http://localhost:4321/blog. Local D1 and R2 live in `.wrangler/`.

## Theme

Structured after [boat.dev/blog](https://boat.dev/blog), in Sabha's own design. The shared header, footer, tokens and fonts (Instrument Sans and JetBrains Mono, the same files the app ships) come from `@sabha/theme`; `src/styles/tokens.css` adds the blog's layout values and `src/styles/site.css` the shell. Dark mode follows the visitor's system setting.

- **Index** (`/blog`, `/blog/category/:slug`, `/blog/tag/:slug`): eyebrow, a large "Blog" title, the site tagline as the lead (edit it in the admin under Settings), category pills, and a two-column grid of square cards with cover images. `/blog/posts` redirects to `/blog`.
- **Post**: an "All posts" button in the blog's title bar, a "Blog / Category" breadcrumb, title, date and reading time, a wide cover, then a narrower text column that opens with the excerpt. Quotes render as a boxed callout. Article typography is `src/styles/prose.css`.
- Posts are meant to have a cover image and one category; the pills list every category, in the order the admin returns them.
- There are no sidebar widgets, menus or comments, so those admin settings have no effect here.

The admin ships in English only (`admin.locales` in `astro.config.mjs`); each extra language adds to the Worker, which has to stay under the free plan's 3 MB compressed.

## Serving under /blog

- `astro.config.mjs` sets `base: "/blog"`, and the Worker routes keep the full path.
- EmDash keeps its admin, API and media URLs at the root (`/_emdash/...`) whatever the base is. That's why `/_emdash/*` is routed to the Worker too, and why those links don't go through `url()`.
- Every public link goes through `url()` in `src/utils/url.ts`. Write `url("/posts")`, never `"/posts"`; a bare root path escapes to Sabha.
- Custom menu items store absolute paths (`/blog/posts`), so do the same when adding menu items in the admin.
- `src/pages/sitemap.xml.ts` replaces EmDash's injected sitemap, which doesn't work under a base ([#2482](https://github.com/emdash-cms/emdash/issues/2482)).

## Deploying

Deploys are manual and need a go-ahead. From this directory:

```bash
pnpm run deploy   # astro build && wrangler deploy
```

`astro build` writes `dist/server/wrangler.json`, which `wrangler deploy` picks up. Content changes made in the admin are live straight away and need no deploy. Only code and template changes do.

### Cloudflare account

The Worker, its D1 database and its R2 bucket live in the Sabha account (ashwin@sabha.co's), which holds the **sabha.co** zone: account ID `1948dc6c405b77891f2b25bc1018fefd`, pinned as `account_id` in `wrangler.jsonc`.

- Sign in with `pnpm wrangler login` as a member of that account, then check with `pnpm wrangler whoami`; it should list the account above.
- In the dashboard, switch to that account, then open Workers & Pages → `sabha-blog`, D1 → `sabha-blog`, or R2 → `sabha-blog-media`.
- The D1 database's id is pinned in `wrangler.jsonc`. Without it, a name that doesn't match makes Wrangler create an empty database silently.
- The Worker holds the `EMDASH_ENCRYPTION_KEY` secret (`npx emdash secrets generate`, then `pnpm wrangler secret put EMDASH_ENCRYPTION_KEY`). Plugin secrets can't be read back without it, and D1 backups don't include it.

D1 has Time Travel (point-in-time restore for 30 days); R2 holds the uploads.

### Passkeys and the host

EmDash binds passkeys to `EMDASH_SITE_URL`'s host (the relying-party id), and setup must never run at the workers.dev address. `EMDASH_SITE_URL` is `https://sabha.co`, the launch domain, with `https://next.sabha.co` in `EMDASH_ALLOWED_ORIGINS`: a passkey made for sabha.co works on any of its subdomains, so the same passkeys sign in on both hosts and nothing changes at the domain switch. The admin's canonical address is `sabha.co/_emdash/admin`.

Moving to a host outside sabha.co would need a new passkey per admin: deploy with both hosts' routes and `EMDASH_SITE_URL` set to the new one, sign in on the old host, choose **Continue on <new host>** in Settings → General and register a passkey there.
