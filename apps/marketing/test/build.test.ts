// Checks the built site, so run it after `pnpm build`.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";

const dist = new URL("../dist/", import.meta.url);
const built = existsSync(dist);
const read = (path: string) => readFileSync(new URL(path, dist), "utf8");

test("robots.txt lists all three sitemaps on the site's host", { skip: !built }, () => {
  const robots = read("robots.txt");

  for (const path of ["/sitemap.xml", "/docs/sitemap-index.xml", "/blog/sitemap.xml"]) {
    assert.match(robots, new RegExp(`^Sitemap: https://next\\.sabha\\.co${path.replaceAll(".", "\\.")}$`, "m"));
  }
});

test("every file a page loads is served from /_site", { skip: !built }, () => {
  for (const page of readdirSync(dist).filter((name) => name.endsWith(".html"))) {
    const html = read(page);
    for (const [, url] of html.matchAll(/(?:src|srcset|poster|data-lazy-src)="([^"]+)"/g)) {
      assert.match(url, /^\/_site\//, `${page} loads ${url}`);
    }
    for (const [, url] of html.matchAll(/<link[^>]+rel="(?:stylesheet|preload|icon)"[^>]*href="([^"]+)"/g)) {
      assert.match(url, /^\/_site\//, `${page} links ${url}`);
    }
  }
});

test("canonical URLs are the clean paths people share", { skip: !built }, () => {
  assert.match(read("index.html"), /<link rel="canonical" href="https:\/\/next\.sabha\.co\/">/);
  assert.match(read("about.html"), /<link rel="canonical" href="https:\/\/next\.sabha\.co\/about">/);
  assert.match(read("about.html"), /<meta property="og:url" content="https:\/\/next\.sabha\.co\/about">/);
});

test("the CSP placeholder was filled in", { skip: !built }, () => {
  assert.match(read("_headers"), /Content-Security-Policy: default-src 'self'; script-src 'self' 'sha256-/);
});
