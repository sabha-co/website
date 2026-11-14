// The blog shares Rails' origin, so script in a post could act as whoever is
// signed in to Sabha. Public pages get a CSP that allows only the blog's own
// scripts; EmDash sets its own on /_emdash (its admin needs inline script).
// EmDash also sends nosniff and Referrer-Policy. Headers here fill in only what
// a response lacks, so EmDash's values win where it sets them.
export const PUBLIC_CSP = [
	"default-src 'self'",
	"script-src 'self'",
	"style-src 'self' 'unsafe-inline'",
	"img-src 'self' https: data:",
	"media-src 'self' https:",
	"frame-src https:",
	"connect-src 'self'",
	"form-action 'self'",
	"frame-ancestors 'none'",
	"object-src 'none'",
	"base-uri 'self'",
].join("; ");

// Rails' own HSTS on the same host.
const SECURITY_HEADERS = {
	"Strict-Transport-Security": "max-age=63072000; includeSubDomains",
	"X-Content-Type-Options": "nosniff",
	"Referrer-Policy": "strict-origin-when-cross-origin",
};

export function withSecurityHeaders(response: Response): Response {
	const secured = new Response(response.body, response);
	for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
		if (!secured.headers.has(name)) secured.headers.set(name, value);
	}
	if (!secured.headers.has("Content-Security-Policy")) {
		secured.headers.set("Content-Security-Policy", PUBLIC_CSP);
		// frame-ancestors 'none' supersedes EmDash's SAMEORIGIN.
		secured.headers.delete("X-Frame-Options");
	}
	return secured;
}
