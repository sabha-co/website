import { defineConfig } from "astro/config";
import { SITE_URL } from "@sabha/theme/site";

export default defineConfig({ site: SITE_URL, output: "static" });
