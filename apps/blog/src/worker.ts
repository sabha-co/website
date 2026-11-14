import handler, { createScheduledHandler, PluginBridge } from "@emdash-cms/cloudflare/worker";

import { withSecurityHeaders } from "./security-headers";

export { PluginBridge };

export default {
	...handler,
	async fetch(request, env, ctx) {
		const response = await handler.fetch(request, env, ctx);
		// A WebSocket upgrade's response can't be rebuilt.
		if (response.status === 101) return response;
		return withSecurityHeaders(response);
	},
	scheduled: createScheduledHandler(),
} satisfies ExportedHandler;
