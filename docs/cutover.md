# Moving the sites to sabha.co

The sites run on `next.sabha.co` until launch. sabha.co itself is served by a separate deployment, with its own copies of the marketing pages, until the app's data moves and the domain switches. These steps cover the sites' side of that switch. Moving the app and its data is a separate runbook.

The blog already serves both hosts, and its admin passkeys are bound to sabha.co, so it needs no passkey step.

## Before the switch

1. Change the host in one commit:
   - `packages/theme/src/site.ts`: `HOST = "sabha.co"`. Canonical URLs, sitemaps, `robots.txt` and `llms.txt` follow it.
   - `apps/marketing/wrangler.jsonc` and `apps/docs/wrangler.jsonc`: replace `next.sabha.co` in every route.
   - `apps/blog/wrangler.jsonc`: keep the `sabha.co` routes; the `next.sabha.co` ones can stay until the redirect below.
   - `.github/workflows/deploy.yml` (environment `url`) and the `--base` default in `scripts/smoke.mjs`.
2. Merge it, but don't deploy yet.

## At the switch

Once sabha.co's DNS points at the new app server and the old deployment no longer answers:

1. In the zone's URL Rewrite Rules, change the landing rule's host from `next.sabha.co` to `sabha.co`. It clears the query string on bare `/` so the marketing Worker gets `/?utm_source=…`, which no route can match.
2. Deploy `marketing`, `docs` and `blog` from the Deploy workflow. Each one smoke-checks its paths on the new host.
3. Check by hand:
   - `pnpm smoke --app marketing --base https://sabha.co`, and the same for `docs` and `blog`;
   - signed out, `https://sabha.co/` shows the landing page; signed in, it opens your workspace;
   - the blog admin at `https://sabha.co/_emdash/admin` takes your passkey.

## After the switch

1. Redirect `next.sabha.co/*` to `https://sabha.co/${1}` at the zone (Single Redirect, 301, query string kept), once nothing needs `next.sabha.co` any more.
2. Remove the `next.sabha.co` routes left on the zone (Workers Routes in the dashboard; a deploy adds routes but doesn't delete old ones), and drop `EMDASH_ALLOWED_ORIGINS` from the blog.

## Rolling back

Point the routes back by redeploying the previous commit from the Deploy workflow, and restore the rewrite rule's host. Each Worker also keeps its earlier versions: `wrangler rollback` from the app's directory.
