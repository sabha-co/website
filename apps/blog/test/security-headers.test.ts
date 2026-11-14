import { test } from "node:test";
import assert from "node:assert/strict";

import { PUBLIC_CSP, withSecurityHeaders } from "../src/security-headers.ts";

test("a public page gets the strict CSP, HSTS and nosniff, and drops X-Frame-Options", () => {
	const page = new Response("<p>post</p>", { headers: { "X-Frame-Options": "SAMEORIGIN" } });
	const headers = withSecurityHeaders(page).headers;

	assert.equal(headers.get("Content-Security-Policy"), PUBLIC_CSP);
	assert.match(PUBLIC_CSP, /script-src 'self'(;|$)/);
	assert.match(PUBLIC_CSP, /frame-ancestors 'none'/);
	assert.equal(headers.get("Strict-Transport-Security"), "max-age=63072000; includeSubDomains");
	assert.equal(headers.get("X-Content-Type-Options"), "nosniff");
	assert.equal(headers.get("Referrer-Policy"), "strict-origin-when-cross-origin");
	assert.equal(headers.has("X-Frame-Options"), false);
});

test("the admin keeps the CSP EmDash set", () => {
	const adminCsp = "default-src 'self'; script-src 'self' 'unsafe-inline'; frame-ancestors 'none'";
	const admin = new Response("<div id=admin></div>", { headers: { "Content-Security-Policy": adminCsp } });

	assert.equal(withSecurityHeaders(admin).headers.get("Content-Security-Policy"), adminCsp);
});

test("the status, body and other headers pass through", async () => {
	const redirect = new Response(null, { status: 302, headers: { Location: "/_emdash/admin/login" } });
	const secured = withSecurityHeaders(redirect);

	assert.equal(secured.status, 302);
	assert.equal(secured.headers.get("Location"), "/_emdash/admin/login");
	assert.equal(await withSecurityHeaders(new Response("hello")).text(), "hello");
});
