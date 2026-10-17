import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import { d1, r2 } from "@emdash-cms/cloudflare";
import { defineConfig, fontProviders } from "astro/config";
import emdash from "emdash/astro";

// Served at sabha.co/blog by Worker routes on the sabha.co zone (wrangler.jsonc);
// every other path on sabha.co still reaches Rails. EmDash keeps its admin and
// API at the root (/_emdash) whatever the base is, so that prefix is routed here too.
export default defineConfig({
	site: "https://sabha.co",
	base: "/blog",
	trailingSlash: "never",
	output: "server",
	adapter: cloudflare(),
	image: {
		layout: "constrained",
		responsiveStyles: true,
	},
	integrations: [
		react(),
		emdash({
			database: d1({ binding: "DB", session: "auto", coalesce: true }),
			storage: r2({ binding: "MEDIA" }),
			// The admin's 35 translations are half the Worker bundle (~2.4 MB
			// compressed); English only keeps it under the free plan's 3 MB limit.
			admin: { locales: ["en"] },
		}),
	],
	fonts: [
		{
			provider: fontProviders.google(),
			name: "Inter",
			cssVariable: "--font-body",
			weights: [400, 500, 600, 700],
			fallbacks: ["sans-serif"],
		},
		{
			provider: fontProviders.google(),
			name: "JetBrains Mono",
			cssVariable: "--font-mono",
			weights: [400, 500],
			fallbacks: ["monospace"],
		},
	],
	devToolbar: { enabled: false },
});
