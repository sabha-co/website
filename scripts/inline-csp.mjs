#!/usr/bin/env node
// Writes a static site's Content-Security-Policy into its built _headers.
// Each inline <script> in the HTML gets a sha256 source, so script-src allows
// only the site's own files and those exact scripts, never 'unsafe-inline'.
// The sites share Rails' origin; a script that slipped into a page could act
// as whoever is signed in to Sabha.
//
//   node scripts/inline-csp.mjs <dist/client> [--wasm]
//
// _headers holds the line `Content-Security-Policy: CSP_PLACEHOLDER`, which
// this replaces. --wasm allows WebAssembly (the docs' Pagefind search).

import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const INLINE_SCRIPT = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
const EVENT_HANDLER = /<[a-z][^>]*\son[a-z]+\s*=/i;
const PLACEHOLDER = "CSP_PLACEHOLDER";

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
    .map((entry) => join(entry.parentPath, entry.name));
}

export function inlineScriptHashes(html) {
  const hashes = [];
  for (const [, attributes, body] of html.matchAll(INLINE_SCRIPT)) {
    if (/\bsrc\s*=/.test(attributes)) continue;
    // JSON-LD and other data blocks never run, so CSP doesn't apply to them.
    const type = attributes.match(/\btype\s*=\s*["']?([^"'\s>]+)/i)?.[1]?.toLowerCase();
    if (type && type !== "module" && type !== "text/javascript" && type !== "application/javascript") continue;
    hashes.push(`'sha256-${createHash("sha256").update(body).digest("base64")}'`);
  }
  return hashes;
}

export function buildCsp(hashes, { wasm = false } = {}) {
  const scriptSrc = ["'self'", ...(wasm ? ["'wasm-unsafe-eval'"] : []), ...[...new Set(hashes)].sort()];
  return [
    "default-src 'self'",
    `script-src ${scriptSrc.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "worker-src 'self' blob:",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
  ].join("; ");
}

export function writeCsp(clientDir, options) {
  const hashes = [];
  for (const file of htmlFiles(clientDir)) {
    const html = readFileSync(file, "utf8");
    if (EVENT_HANDLER.test(html)) throw new Error(`${file} has an inline event handler, which a hashed CSP blocks`);
    hashes.push(...inlineScriptHashes(html));
  }

  const headersFile = join(clientDir, "_headers");
  const headers = readFileSync(headersFile, "utf8");
  if (!headers.includes(PLACEHOLDER)) throw new Error(`${headersFile} has no ${PLACEHOLDER} to replace`);
  const csp = buildCsp(hashes, options);
  writeFileSync(headersFile, headers.replace(PLACEHOLDER, csp));
  return csp;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [clientDir, ...flags] = process.argv.slice(2);
  if (!clientDir) {
    console.error("Usage: node scripts/inline-csp.mjs <dist/client> [--wasm]");
    process.exit(1);
  }
  const csp = writeCsp(clientDir, { wasm: flags.includes("--wasm") });
  console.log(`CSP written to ${join(clientDir, "_headers")}: ${csp}`);
}
