import type { APIRoute } from "astro";
import { siteUrl } from "@sabha/theme/site";

// The marketing pages only; the docs and blog publish their own sitemaps,
// which robots.txt lists beside this one.
const PAGES = [
  { path: "/", changefreq: "monthly", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.8" },
  { path: "/developers", changefreq: "monthly", priority: "0.8" },
  { path: "/changelog", changefreq: "weekly", priority: "0.6" },
  { path: "/openclaw", changefreq: "monthly", priority: "0.8" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
];

export const GET: APIRoute = () =>
  new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PAGES.map(
  ({ path, changefreq, priority }) =>
    `  <url>\n    <loc>${siteUrl(path)}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`,
).join("\n")}
</urlset>
`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
