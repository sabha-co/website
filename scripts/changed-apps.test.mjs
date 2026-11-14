import { test } from "node:test";
import assert from "node:assert/strict";

import { changedApps } from "./changed-apps.mjs";

const APPS = ["blog", "docs", "marketing"];

test("a change inside one app builds only that app", () => {
  assert.deepEqual(changedApps(["apps/docs/src/content/docs/index.mdx"], APPS), ["docs"]);
  assert.deepEqual(
    changedApps(["apps/marketing/src/worker.ts", "apps/blog/wrangler.jsonc"], APPS),
    ["blog", "marketing"],
  );
});

test("the theme, shared scripts and the lockfile build every app", () => {
  for (const file of ["packages/theme/src/tokens.css", "scripts/inline-csp.mjs", "pnpm-lock.yaml", ".github/workflows/ci.yml"]) {
    assert.deepEqual(changedApps(["apps/docs/README.md", file], APPS), APPS, file);
  }
});

test("documentation alone builds nothing", () => {
  assert.deepEqual(changedApps(["README.md", "AGENTS.md", ".github/CODEOWNERS"], APPS), []);
  assert.deepEqual(changedApps([], APPS), []);
});
