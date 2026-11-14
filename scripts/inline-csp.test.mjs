import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { inlineScriptHashes, writeCsp } from "./inline-csp.mjs";

const sha = (body) => `'sha256-${createHash("sha256").update(body).digest("base64")}'`;

function site(pages, headers = "/*\n  Content-Security-Policy: CSP_PLACEHOLDER\n") {
  const dir = mkdtempSync(join(tmpdir(), "inline-csp-"));
  mkdirSync(join(dir, "docs"));
  for (const [name, html] of Object.entries(pages)) writeFileSync(join(dir, "docs", name), html);
  writeFileSync(join(dir, "_headers"), headers);
  return dir;
}

test("hashes inline scripts but not external files or data blocks", () => {
  const html = `
    <script>theme()</script>
    <script type="module">mod()</script>
    <script type="module" src="/docs/_astro/a.js"></script>
    <script type="application/ld+json">{"@type":"WebPage"}</script>`;
  assert.deepEqual(inlineScriptHashes(html), [sha("theme()"), sha("mod()")]);
});

test("writes one policy with every page's scripts, each hash once", () => {
  const dir = site({
    "index.html": "<script>theme()</script>",
    "guide.html": "<script>theme()</script><script>other()</script>",
  });
  writeCsp(dir, { wasm: true });

  const headers = readFileSync(join(dir, "_headers"), "utf8");
  const scriptSrc = headers.match(/script-src ([^;]+)/)[1].split(" ");
  assert.deepEqual(scriptSrc.slice(0, 2), ["'self'", "'wasm-unsafe-eval'"]);
  assert.deepEqual(scriptSrc.slice(2).sort(), [sha("theme()"), sha("other()")].sort());
  assert.match(headers, /frame-ancestors 'none'/);
  assert.doesNotMatch(headers, /'unsafe-inline'[^;]*;\s*style/);
  assert.doesNotMatch(headers, /CSP_PLACEHOLDER/);
});

test("refuses inline event handlers, which a hash can't allow", () => {
  const dir = site({ "index.html": `<button onclick="go()">Go</button>` });
  assert.throws(() => writeCsp(dir), /inline event handler/);
});

test("refuses a _headers file with nothing to replace", () => {
  const dir = site({ "index.html": "<p>hi</p>" }, "/*\n  X-Content-Type-Options: nosniff\n");
  assert.throws(() => writeCsp(dir), /no CSP_PLACEHOLDER/);
});
