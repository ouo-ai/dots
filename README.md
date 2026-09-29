# Dots

Dots is an on-demand AI personal assistant at https://dotsai.bot. The Next.js
site uses a signed browser session and a server-side proxy. The assistant API
and worker live in [services/assistant](services/assistant/README.md), with
Postgres for conversation history and Redis for the queue.

This version answers text requests and tracks task status. It does not browse
the web, connect to other apps, schedule reminders, or send notifications.

## Local site

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm build
pnpm dev
```

Set `DOTS_BACKEND_URL`, `DOTS_INTERNAL_API_TOKEN`, and a random
`DOTS_SESSION_SECRET` of at least 32 characters in a local `.env.local`.
The server sends the internal token to the Render API; it is never exposed to
the browser. A signed HttpOnly cookie gives each browser profile a stable
identity. Clearing the cookie loses access to prior history.

The site is generated from v0 template `cbQ1carSbPX` and customized for Dots.
