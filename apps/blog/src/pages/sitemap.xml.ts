import type { APIRoute } from "astro";
import { getEmDashCollection } from "emdash";

import { url as withBase } from "../utils/url";

// Replaces EmDash's injected sitemap, which ignores Astro's base and fails
// under /blog. Rails' sitemap at the domain root points here.
export const GET: APIRoute = async ({ site, url }) => {
	const siteUrl = site ?? new URL(url.origin);
	const entries = [
		...(await allEntries("posts")).map((entry) => ({ path: `/posts/${entry.id}`, entry })),
		...(await allEntries("pages")).map((entry) => ({ path: `/pages/${entry.id}`, entry })),
	];

	const urls = [
		`  <url><loc>${new URL(withBase("/"), siteUrl).href}</loc></url>`,
		...entries.map(({ path, entry }) => {
			const loc = new URL(withBase(path), siteUrl).href;
			const updated = entry.data.updatedAt ?? entry.data.publishedAt;
			const lastmod = updated ? `<lastmod>${updated.toISOString()}</lastmod>` : "";
			return `  <url><loc>${loc}</loc>${lastmod}</url>`;
		}),
	];

	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`,
		{ headers: { "Content-Type": "application/xml; charset=utf-8" } },
	);
};

async function allEntries(collection: "posts" | "pages") {
	const entries = [];
	let cursor: string | undefined;
	do {
		const page = await getEmDashCollection(collection, { limit: 100, cursor });
		entries.push(...page.entries);
		cursor = page.nextCursor;
	} while (cursor);
	return entries;
}
