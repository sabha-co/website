# AGENTS.md

Sabha's public sites: marketing, docs and blog, three Astro apps deployed as three Cloudflare Workers on one host the Sabha app (Rails) also serves. Read `README.md` first.

## Rules

- **Never deploy without an explicit go-ahead.** No `wrangler deploy`, route change, secret change or D1/R2 write unless asked in that turn.
- **This repo is public.** Nothing private goes in: no secrets, no `.env`, no internal plans. Docs describe Sabha as built in `sabha-ai`: read labels and behaviour from there, not from the public `sabha-co/sabha` repo, which lags it. The docs say what the marketing site says: the built-in agent is "the agent", the wiki is "the company brain" (the app labels it Team Wiki), and outside AI agents a team brings are "bots".
- **The host lives in `packages/theme/src/site.ts`.** Each `wrangler.jsonc` repeats it once in its routes and vars; change both together.
- **Workers claim explicit paths, never `host/*`.** Each path comes as a pair: `/x` and `/x/*`. Anything unclaimed reaches Rails.
- **Worker code never reads, logs or forwards cookies**, except the marketing root script's presence check. The sites share Rails' origin.
- **Every response carries the security headers** (CSP with `frame-ancestors 'none'`, nosniff, HSTS, Referrer-Policy): `public/_headers` for static apps, the Worker for the blog. The smoke script checks them.
- **Header and footer links are host-absolute** (`/about`, `/docs`), never prefixed with an app's `base`.
- **Vocabulary:** "apps" for things a team adds to Sabha; a bot is only how an app appears in chat. Never "plugin".
- **Versions:** one Astro, adapter and Wrangler for all apps, pinned in the `catalog:` of `pnpm-workspace.yaml`.

## Look

The theme copies the app's tokens from `sabha-ai`'s `app/assets/stylesheets/application/colors.css`, which stays the source of truth. Instrument Sans and JetBrains Mono, self-hosted; dark mode follows the system. Read only the semantic `--color-*` tokens.
