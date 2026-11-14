// Prints, as a JSON array, the apps a set of changed files affects. CI builds
// only those. A file inside apps/<name>/ affects that app; documentation
// affects none; anything else (the theme, shared scripts, the lockfile, CI
// itself) can change every app's build, so it affects all of them.
//
//   node scripts/changed-apps.mjs <base-ref>     compares <base-ref>...HEAD
import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";

export const APPS = readdirSync(new URL("../apps/", import.meta.url), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const DOCUMENTATION = /^(?!apps\/)[^/]+\.md$|^\.github\/CODEOWNERS$/;

export function changedApps(files, apps = APPS) {
  const affected = new Set();

  for (const file of files) {
    const app = file.match(/^apps\/([^/]+)\//)?.[1];
    if (app && apps.includes(app)) affected.add(app);
    else if (!DOCUMENTATION.test(file)) return [...apps];
  }

  return apps.filter((app) => affected.has(app));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const base = process.argv[2];
  if (!base) throw new Error("usage: node scripts/changed-apps.mjs <base-ref>");

  const files = execFileSync("git", ["diff", "--name-only", `${base}...HEAD`], { encoding: "utf8" })
    .split("\n")
    .filter(Boolean);
  console.log(JSON.stringify(changedApps(files)));
}
