import type { APIRoute } from "astro";
import { siteUrl } from "@sabha/theme/site";

const BODY = `# Sabha

> Sabha is an open-core, self-hostable group chat platform for communities and teams.

Sabha is built with Ruby on Rails, Hotwire, and ActionCable. It supports self-hosted single-tenant deployments and a SaaS multi-tenant mode.

## Key concepts

- **Rooms**: Group chat channels (open, closed, direct messages, threads)
- **Messages**: Rich text via ActionText, with file attachments, @mentions, and reactions
- **Members**: Users belong to an account with roles (member, administrator)
- **Notifications**: Activity feed, @mentions, inbox
- **Integrations**: Bot users via invite codes, Slack import

## Docs

- [Documentation](${siteUrl("/docs/llms.txt")}): guides for self-hosting, apps and features
- [README](https://github.com/sabha-co/sabha/blob/main/README.md)
- [Changelog](${siteUrl("/changelog")})
`;

export const GET: APIRoute = () => new Response(BODY, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
