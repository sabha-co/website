// Turns Sabha's docs/CHANGELOG.md into the /changelog page: one group per
// "### " heading, newest first, with the SaaS and Multi-tenant groups left
// out. Only "- **Title** — description" lines become entries.

export interface ChangelogItem {
  title: string;
  /** HTML: the escaped description with its markdown links made anchors. */
  description: string;
}

export interface ChangelogSection {
  heading: string;
  items: ChangelogItem[];
}

const HIDDEN = ["Multi-tenant", "SaaS"];
const ITEM = /^- \*\*(.+?)\*\*\s*[—–-]\s*(.+)$/;
const LINK = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;

export function parseChangelog(markdown: string): ChangelogSection[] {
  const sections: ChangelogSection[] = [];
  let current: ChangelogSection | null = null;

  for (const line of markdown.split(/\r?\n/)) {
    if (line.startsWith("### ")) {
      const heading = line.slice(4);
      current = HIDDEN.some((word) => heading.includes(word)) ? null : { heading, items: [] };
      if (current) sections.push(current);
    } else if (current && line.startsWith("- ")) {
      const match = line.match(ITEM);
      if (match) current.items.push({ title: match[1], description: renderLinks(match[2]) });
    }
  }

  return sections.reverse();
}

export function renderLinks(text: string): string {
  return escapeHtml(text).replace(
    LINK,
    (_, label, url) => `<a href="${url}" target="_blank" rel="noopener" class="landing-link">${label}</a>`,
  );
}

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
