// The one place the sites' host lives. Astro configs, canonical URLs,
// robots.txt and sitemaps import it; each app's wrangler.jsonc repeats it once
// in its routes and vars. Moving to sabha.co is one edit here and one per
// wrangler.jsonc.
export const HOST = "next.sabha.co";
export const SITE_URL = `https://${HOST}`;

// Rails answers these on the same host, so links stay relative.
export const SIGN_IN_PATH = "/session/new";
export const SIGN_UP_PATH = "/registration/new";

// Header and footer links are host-absolute paths, never prefixed with an
// app's `base`: /about is the marketing Worker's whether the page linking to
// it lives under /docs, /blog or the root.
export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
}

export const GITHUB_URL = "https://github.com/sabha-co/sabha";
export const EXAMPLE_COMMUNITY_URL = "https://sabha.co/1000101/join/vWZP-NBZX-tEHU";

export const headerNav: NavLink[] = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Docs", href: "/docs" },
  { label: "Blog", href: "/blog" },
  { label: "GitHub", href: GITHUB_URL, external: true },
];

export const footerColumns: { heading: string; links: NavLink[] }[] = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/#pricing" },
      { label: "OpenClaw", href: "/openclaw" },
      { label: "Changelog", href: "/changelog" },
      { label: "Docs", href: "/docs" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "GitHub", href: GITHUB_URL, external: true },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
    ],
  },
];

export const siteUrl = (path: string) => new URL(path, SITE_URL).toString();
