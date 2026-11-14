import { defineConfig } from "astro/config";
import { SITE_URL } from "@sabha/theme/site";

// A static build served from Workers assets. Pages build as about.html etc.,
// which assets serve at /about. Built files and images live under /_site so
// the Worker needs one route for them and every other path stays Rails'.
export default defineConfig({
  site: SITE_URL,
  output: "static",
  trailingSlash: "never",
  build: {
    format: "file",
    assets: "_site/assets",
  },
  devToolbar: { enabled: false },
});
