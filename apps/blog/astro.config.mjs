import node from "@astrojs/node";
import react from "@astrojs/react";
import { defineConfig, fontProviders } from "astro/config";
import emdash, { local } from "emdash/astro";
import { sqlite } from "emdash/db";

const dataDir = process.env.DATA_DIR ?? "./data";

// Served at sabha.co/blog behind kamal-proxy, which forwards the /blog prefix
// unstripped. EmDash keeps its admin and API at the root (/_emdash) whatever
// the base is, so the proxy routes that prefix here too.
export default defineConfig({
	site: process.env.EMDASH_SITE_URL ?? "http://localhost:4321",
	base: "/blog",
	trailingSlash: "never",
	output: "server",
	adapter: node({
		mode: "standalone",
	}),
	image: {
		layout: "constrained",
		responsiveStyles: true,
	},
	integrations: [
		react(),
		emdash({
			database: sqlite({ url: `file:${dataDir}/emdash.db` }),
			storage: local({
				directory: `${dataDir}/uploads`,
				baseUrl: "/_emdash/api/media/file",
			}),
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
