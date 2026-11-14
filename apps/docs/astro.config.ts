import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import nimbus, {
  defineConfig as defineNimbusConfig,
} from "@cloudflare/nimbus-docs";
import { tableScroll } from "@cloudflare/nimbus-docs/markdown";
import { SITE_URL, GITHUB_URL } from "@sabha/theme/site";

const nimbusConfig = defineNimbusConfig({
  site: SITE_URL,
  title: "Sabha Docs",
  description: "Run Sabha, use it with your team, and connect apps to it.",
  locale: "en",
  github: GITHUB_URL,
  socialImageAlt: "Sabha Docs",
  // The origin root (/.well-known) belongs to Rails, which serves
  // /.well-known/change-password there. Turn this on when the docs own a root.
  agents: { discovery: false },
  sidebar: {
    items: ["index", { autogenerate: { collection: "docs" } }],
  },
});

// Served at /docs by Worker routes (wrangler.jsonc); every other path on the
// host reaches Rails. Static, built through the Cloudflare adapter so the
// output nests under the base (dist/client/docs/…), Nimbus's recipe for a
// site under a path. `nimbus-docs add adapter-cloudflare` would switch it to
// server output; don't.
export default defineConfig({
  base: "/docs",
  trailingSlash: "ignore",
  output: "static",
  adapter: cloudflare({ prerenderEnvironment: "node" }),
  // Tailwind v4 via its Vite plugin (the integration Astro recommends for
  // Tailwind v4 — replaces the PostCSS plugin, which doesn't build under
  // Astro 7's Vite 8 bundler).
  vite: {
    plugins: [tailwindcss()],
  },
  // Hover-prefetch link targets so full-page navigations feel instant without
  // a client-side router.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },
  integrations: [
    nimbus(nimbusConfig, {
      // Authoring rules are opt-in by design — your repo, your taste. The
      // two below are the load-bearing pair: frontmatter has to validate
      // against the content schema for the page to render properly, and
      // broken internal links are 404s for your readers. Add the others
      // (heading hierarchy, code-block language, style, etc.) when you're
      // ready to enforce them — see `nimbus-docs lint --help`.
      rules: {
        "nimbus/frontmatter-shape": "error",
        "nimbus/internal-link": "error",
      },
      markdown: {
        // Wrap wide tables so they scroll instead of overflowing the page
        // (styled by `.nb-table-scroll` in src/styles/prose.css).
        hastPlugins: [tableScroll()],
        // `## Install {#install}` gives a heading a fixed id. A heading that
        // ends in other `{…}` text, such as `{account_id}` in a .md file, is
        // read as attributes too; remove this to keep it as text.
        features: { headingAttributes: true },
      },
    }),
  ],
});
