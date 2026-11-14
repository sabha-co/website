import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

import worker from "../src/worker.ts";

const BROWSER = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 Safari/605.1.15";
const env = { ASSETS: { fetch: async () => new Response("landing") } } as any;
const realFetch = globalThis.fetch;

beforeEach(() => {
  globalThis.fetch = (async () =>
    new Response(null, { status: 302, headers: { Location: "/1000001" } })) as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = realFetch;
});

function visit(headers: Record<string, string>) {
  const request = new Request("https://next.sabha.co/", { headers: { "User-Agent": BROWSER, ...headers } });
  return worker.fetch(request as any, env);
}

test("a signed-out browser gets the landing page", async () => {
  assert.equal(await (await visit({})).text(), "landing");
});

test("a signed-out visitor's CSRF session cookie still gets the landing page", async () => {
  assert.equal(await (await visit({ Cookie: "_sabha_saas_session=abc" })).text(), "landing");
});

test("a signed-in person goes to Rails, and its redirect comes back unchanged", async () => {
  const response = await visit({ Cookie: "theme=dark; global_session_token=abc" });

  assert.equal(response.status, 302);
  assert.equal(response.headers.get("Location"), "/1000001");
});

test("Sabha's desktop and mobile apps go to Rails", async () => {
  assert.equal((await visit({ "Sabha-Client": "desktop" })).status, 302);
  assert.equal((await visit({ "User-Agent": `${BROWSER} Hotwire Native iOS` })).status, 302);
});
