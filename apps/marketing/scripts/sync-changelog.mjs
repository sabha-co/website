// Refreshes src/content/changelog.md from the public Sabha repo before each
// build. If GitHub can't be reached the committed copy stays, so a build
// never fails on the network.
import { writeFileSync } from "node:fs";

const SOURCE = "https://raw.githubusercontent.com/sabha-co/sabha/main/docs/CHANGELOG.md";
const target = new URL("../src/content/changelog.md", import.meta.url);

try {
  const response = await fetch(SOURCE, { signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  writeFileSync(target, await response.text());
  console.log("changelog: synced from sabha-co/sabha");
} catch (error) {
  console.warn(`changelog: using the committed copy (${error.message})`);
}
