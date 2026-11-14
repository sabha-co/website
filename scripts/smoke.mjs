#!/usr/bin/env node
// Checks one app's claimed paths on a host: each answers with a good status
// and the security headers, and the paths Rails keeps still come from Rails.
//
//   node scripts/smoke.mjs --app docs [--base https://next.sabha.co] [--tenant 1000001]

import { parseArgs } from "node:util";
import { pathToFileURL } from "node:url";

export const CLAIMED_PATHS = {
  marketing: ["/", "/about", "/changelog", "/terms", "/privacy", "/openclaw", "/robots.txt", "/sitemap.xml", "/llms.txt"],
  docs: ["/docs", "/docs/", "/docs/llms.txt"],
  blog: ["/blog", "/blog/sitemap.xml", "/blog/rss.xml", "/_emdash/admin"],
};

export const SECURITY_HEADERS = {
  "content-security-policy": /frame-ancestors 'none'/,
  "x-content-type-options": /^nosniff$/i,
  "strict-transport-security": /max-age=\d+/,
  "referrer-policy": /\S/,
};

// Rails' ActionDispatch::RequestId stamps every response; Workers never do.
const RAILS_MARKER = "x-request-id";

// Static sites send a bare directory to its slash form, where the index lives.
const EXPECTED_REDIRECTS = { "/docs": "/docs/" };

// The admin redirects to its sign-in (or setup), so a redirect is a pass there.
const OK_STATUS = (path, response) => {
  const { status } = response;
  if (status >= 200 && status < 300) return true;
  if (status < 300 || status >= 400) return false;
  if (path.startsWith("/_emdash")) return true;
  const location = response.headers.get("location");
  return location !== null && new URL(location, "https://x").pathname === EXPECTED_REDIRECTS[path];
};

export async function smoke({ app, base = "https://next.sabha.co", tenant, fetch = globalThis.fetch }) {
  const paths = CLAIMED_PATHS[app];
  if (!paths) throw new Error(`Unknown app "${app}"; expected one of ${Object.keys(CLAIMED_PATHS).join(", ")}`);

  const failures = [];
  const get = (path, headers = {}) => fetch(new URL(path, base), { redirect: "manual", headers });

  for (const path of paths) {
    const response = await get(path, { "user-agent": "sabha-website-smoke" });
    if (!OK_STATUS(path, response)) failures.push(`${path}: status ${response.status}`);
    if (response.headers.has(RAILS_MARKER)) failures.push(`${path}: answered by Rails, not the ${app} Worker`);

    for (const [name, pattern] of Object.entries(SECURITY_HEADERS)) {
      const value = response.headers.get(name);
      if (!value) failures.push(`${path}: missing ${name}`);
      else if (!pattern.test(value)) failures.push(`${path}: ${name} is "${value}"`);
    }
  }

  const railsPaths = ["/session/new", "/up", ...(tenant ? [`/${tenant}`] : [])];
  for (const path of railsPaths) {
    const response = await get(path);
    if (!response.headers.has(RAILS_MARKER)) failures.push(`${path}: not answered by Rails`);
  }

  return failures;
}

async function main() {
  const { values } = parseArgs({
    options: {
      app: { type: "string" },
      base: { type: "string", default: "https://next.sabha.co" },
      tenant: { type: "string" },
    },
  });

  const failures = await smoke(values);
  if (failures.length) {
    console.error(`Smoke failed for ${values.app} on ${values.base}:`);
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exit(1);
  }
  console.log(`Smoke passed for ${values.app} on ${values.base}.`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();
