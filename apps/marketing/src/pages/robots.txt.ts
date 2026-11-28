import type { APIRoute } from "astro";
import { siteUrl } from "@sabha/theme/site";

// Crawlers may read the public sites; the app behind them is off limits.
const ALLOWED = ["/$", "/about", "/developers", "/changelog", "/openclaw", "/terms", "/privacy", "/docs", "/blog", "/_site/"];
const SITEMAPS = ["/sitemap.xml", "/docs/sitemap-index.xml", "/blog/sitemap.xml"];

export const GET: APIRoute = () =>
  new Response(
    [
      "User-agent: *",
      ...ALLOWED.map((path) => `Allow: ${path}`),
      "Disallow: /",
      "",
      ...SITEMAPS.map((path) => `Sitemap: ${siteUrl(path)}`),
      "",
    ].join("\n"),
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
