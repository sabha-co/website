// Runs only for "/" (run_worker_first in wrangler.jsonc); every other
// marketing path is a plain asset. Signed-in people and Sabha's apps go to
// Rails, which sends them on to their workspace; everyone else gets the
// landing page. The cookie is checked for presence only, never read further
// or logged.

export interface Env {
  ASSETS: Fetcher;
}

const SESSION_COOKIE = "global_session_token";

export function belongsToRails(request: Request): boolean {
  if (request.headers.has("Sabha-Client")) return true;
  if (/Hotwire Native/.test(request.headers.get("User-Agent") ?? "")) return true;

  const cookies = request.headers.get("Cookie") ?? "";
  return cookies.split(";").some((pair) => pair.trim().startsWith(`${SESSION_COOKIE}=`));
}

export default {
  async fetch(request, env): Promise<Response> {
    if (belongsToRails(request)) return fetch(request);
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
