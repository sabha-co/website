import { test } from "node:test";
import assert from "node:assert/strict";
import { smoke, CLAIMED_PATHS } from "./smoke.mjs";

const SECURE = {
  "content-security-policy": "default-src 'self'; frame-ancestors 'none'",
  "x-content-type-options": "nosniff",
  "strict-transport-security": "max-age=31536000",
  "referrer-policy": "strict-origin-when-cross-origin",
};

const RAILS_PATHS = new Set(["/session/new", "/up", "/1000001"]);

// A fake host: Worker paths answer with `worker(path)`, Rails paths carry the
// request id Rails stamps on everything.
function fakeHost({ worker = () => ({ status: 200, headers: SECURE }), rails = () => ({ "x-request-id": "abc" }) } = {}) {
  return async (url) => {
    const path = new URL(url).pathname;
    if (RAILS_PATHS.has(path)) return new Response(null, { status: 302, headers: rails(path) });
    const { status, headers } = worker(path);
    return new Response(null, { status, headers });
  };
}

test("passes when every claimed path answers securely and Rails keeps its paths", async () => {
  for (const app of Object.keys(CLAIMED_PATHS)) {
    assert.deepEqual(await smoke({ app, fetch: fakeHost(), tenant: "1000001" }), []);
  }
});

test("fails when a claimed path is missing", async () => {
  const failures = await smoke({
    app: "docs",
    fetch: fakeHost({ worker: (path) => ({ status: path === "/docs/llms.txt" ? 404 : 200, headers: SECURE }) }),
  });
  assert.deepEqual(failures, ["/docs/llms.txt: status 404"]);
});

test("fails when a security header is missing or weak", async () => {
  const { "x-content-type-options": _, ...withoutNosniff } = SECURE;
  const failures = await smoke({
    app: "marketing",
    fetch: fakeHost({
      worker: (path) => ({
        status: 200,
        headers: path === "/about" ? withoutNosniff : path === "/terms" ? { ...SECURE, "content-security-policy": "default-src 'self'" } : SECURE,
      }),
    }),
  });
  assert.deepEqual(failures, [
    "/about: missing x-content-type-options",
    "/terms: content-security-policy is \"default-src 'self'\"",
  ]);
});

test("fails when a Worker answers a Rails path", async () => {
  const failures = await smoke({
    app: "blog",
    fetch: fakeHost({ rails: (path) => (path === "/session/new" ? {} : { "x-request-id": "abc" }) }),
  });
  assert.deepEqual(failures, ["/session/new: not answered by Rails"]);
});

test("fails when Rails still answers a claimed path", async () => {
  const failures = await smoke({
    app: "docs",
    fetch: fakeHost({ worker: (path) => ({ status: 200, headers: path === "/docs" ? { ...SECURE, "x-request-id": "abc" } : SECURE }) }),
  });
  assert.deepEqual(failures, ["/docs: answered by Rails, not the docs Worker"]);
});

test("accepts the admin's redirect to its sign-in", async () => {
  const failures = await smoke({
    app: "blog",
    fetch: fakeHost({ worker: (path) => ({ status: path === "/_emdash" ? 302 : 200, headers: SECURE }) }),
  });
  assert.deepEqual(failures, []);
});
