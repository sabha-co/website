/**
 * The site is mounted under Astro's `base` (e.g. /blog), so every public link
 * must carry it. EmDash's own admin and API stay at the root (/_emdash/...)
 * whatever the base is; never pass those through here.
 */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export const HOME = BASE || "/";

export function url(path: string): string {
	if (path === "/") return HOME;
	return `${BASE}${path}`;
}
