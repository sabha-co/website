import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const fixture = fileURLToPath(new URL("./fixture", import.meta.url));

function build(base) {
  const outDir = mkdtempSync(join(tmpdir(), "sabha-theme-"));
  const args = ["astro", "build", "--root", fixture, "--outDir", outDir, ...(base ? ["--base", base] : [])];
  execFileSync("pnpm", ["exec", ...args], { stdio: "pipe" });
  const html = readFileSync(join(outDir, "index.html"), "utf8");
  const assets = readdirSync(join(outDir, "_astro"));
  return { html, assets, outDir };
}

const hrefs = (html) => [...html.matchAll(new RegExp(`<a[^>]*href="([^"]+)"`, "g"))].map((m) => m[1]);

for (const base of [undefined, "/docs"]) {
  test(`header and footer build ${base ? `under base ${base}` : "with no base"}`, () => {
    const { html, assets } = build(base);

    // Header and footer links point at the host's root, whatever the app's base.
    const links = hrefs(html);
    assert.ok(links.includes("/about"));
    assert.ok(links.includes("/docs"));
    assert.ok(links.includes("/blog"));
    assert.ok(links.includes("/session/new"));
    assert.ok(!links.some((href) => href.startsWith("/docs/about")));

    // The page's own assets carry the base.
    const prefix = `${base ?? ""}/_astro/`;
    assert.match(html, new RegExp(`href="${prefix}[^"]+\\.css"`));
    assert.ok(assets.some((name) => name.endsWith(".woff2")), "fonts are emitted");
  });
}

test("tokens carry dark values for system dark mode", () => {
  const { assets, outDir } = build();
  const css = assets.filter((name) => name.endsWith(".css")).map((name) => readFileSync(join(outDir, "_astro", name), "utf8")).join("");
  assert.match(css, /color-scheme:\s*light dark/);
  assert.match(css, /--color-bg:\s*light-dark\(oklch\(100% 0 0\),\s*oklch\(19\.6% 0?\.008 274\)\)/);
});
