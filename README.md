# Sabha website

Sabha's public sites, each an Astro app deployed as its own Cloudflare Worker on one host (`next.sabha.co` for now):

| App | Path | What it is |
|---|---|---|
| `apps/marketing` | `/`, `/about`, `/changelog`, `/terms`, `/privacy`, `/openclaw` | Static landing and company pages |
| `apps/docs` | `/docs` | Static docs site on Nimbus |
| `apps/blog` | `/blog`, admin at `/_emdash` | The EmDash blog, with D1 and R2 |

Every other path on the host belongs to the Sabha app (Rails). Workers routes claim only their own paths.

`packages/theme` is the shared look: tokens, fonts, header, footer, and `site.ts`, the one place the host and nav live.

## Develop

```bash
pnpm install
pnpm test            # smoke-script and theme tests, then each app's own
pnpm build           # every app
```

Node 24 and pnpm 12 (`packageManager` pins it). New releases install after a one-day cooldown (`minimumReleaseAge`); pin the newest version that has passed it.

## Check a deploy

```bash
pnpm smoke --app docs                       # against next.sabha.co
pnpm smoke --app blog --base http://localhost:8787
```

The smoke script requests the app's claimed paths, checks their status and security headers, and confirms `/session/new` and `/up` still come from Rails.

Deploys are manual, from the Deploy workflow on `main`. Moving the sites to sabha.co at launch: `docs/cutover.md`.
