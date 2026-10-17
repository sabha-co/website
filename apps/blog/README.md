# Sabha blog

The blog at **sabha.co/blog**: an [EmDash](https://github.com/emdash-cms/emdash) site (Astro + SQLite), started from EmDash's Node blog template. It runs as a Kamal accessory beside Sabha. kamal-proxy routes `/blog` and `/_emdash` to it and everything else to Rails (see `config/deploy.multitenant.yml` in sabha-ai).

## Running locally

```bash
pnpm install
pnpm dev
```

Open http://localhost:4321/_emdash/admin and complete the setup wizard, which applies `seed/seed.json`. The site is at http://localhost:4321/blog.

## Serving under /blog

- `astro.config.mjs` sets `base: "/blog"`, and kamal-proxy forwards the prefix unstripped.
- EmDash keeps its admin, API and media URLs at the root (`/_emdash/...`) whatever the base is. That's why the proxy routes `/_emdash` here too, and why those links don't go through `url()`.
- Every public link goes through `url()` in `src/utils/url.ts`. Write `url("/posts")`, never `"/posts"`; a bare root path escapes to Sabha.
- Custom menu items store absolute paths (`/blog/posts`), so do the same when adding menu items in the admin.
- `patches/emdash@1.3.0.patch` makes EmDash's sidebar widgets (categories, tags, search, recent posts, archives) honour the base. It's upstream bug [#2482](https://github.com/emdash-cms/emdash/issues/2482). When an EmDash upgrade fixes it, the patch stops applying; delete it then.
- `src/pages/sitemap.xml.ts` replaces EmDash's injected sitemap, which doesn't work under a base (the same bug).

## Deploying

Pushing to `main` builds `ghcr.io/sabha-co/sabha-blog:latest` (`.github/workflows/publish.yml`). Then, from sabha-ai:

```bash
kamal accessory reboot blog -d multitenant   # pulls :latest, restarts (a few seconds down)
```

Content changes made in the admin are live straight away and need no deploy. Only code and template changes do.

First-time setup on the server:

1. Generate the key with `npx emdash secrets generate`, add it as `EMDASH_ENCRYPTION_KEY` to sabha-ai's GitHub secrets and to the local env behind `.kamal/secrets.multitenant`, and keep a copy somewhere safe. Plugin secrets can't be read back without it.
2. `sudo install -d -o 1000 -g 1000 /disk/sabha-blog`, since the container runs as uid 1000.
3. `kamal accessory boot blog -d multitenant`, then complete the setup wizard at https://sabha.co/_emdash/admin.

Back up `/disk/sabha-blog`: it holds `emdash.db` and `uploads/`.
