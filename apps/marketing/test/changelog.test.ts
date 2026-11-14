import { test } from "node:test";
import assert from "node:assert/strict";

import { parseChangelog } from "../src/lib/changelog.ts";

const FIXTURE = `# Sabha Changelog

## From SmallBets

- **Threads** — inherited, before any dated section

### Nov 2025

- **Forums** — post galleries for long-form rooms
- not an entry
- **Huddles** – voice in [rooms](https://example.com/huddles) & DMs

### Multi-tenant SaaS features

- **Workspaces** — hidden with its section

### Dec 2025

- **Search** - <b>faster</b> results
`;

test("groups entries by dated heading, newest first, without the SaaS sections", () => {
  const sections = parseChangelog(FIXTURE);

  assert.deepEqual(
    sections.map((section) => section.heading),
    ["Dec 2025", "Nov 2025"],
  );
  assert.deepEqual(
    sections[1].items.map((item) => item.title),
    ["Forums", "Huddles"],
  );
});

test("links open in a new tab and source HTML is escaped", () => {
  const [dec, nov] = parseChangelog(FIXTURE);

  assert.equal(
    nov.items[1].description,
    'voice in <a href="https://example.com/huddles" target="_blank" rel="noopener" class="landing-link">rooms</a> &amp; DMs',
  );
  assert.equal(dec.items[0].description, "&lt;b&gt;faster&lt;/b&gt; results");
});

test("an empty file is an empty page", () => {
  assert.deepEqual(parseChangelog(""), []);
});
