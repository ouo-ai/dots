# Dots assistant service

This is Dots's on-demand chat backend. A Fastify API records conversations and
tasks in Postgres. A BullMQ worker reads tasks from Redis, calls a configured
OpenRouter model, and stores each reply in Postgres. It does not schedule
reminders, send notifications, or run in the background on a user's behalf.

## Render setup

Create these resources in the same Oregon region and private network:

1. Render Postgres database.
2. Render Key Value instance (Redis-compatible).
3. Node web service for the API, with repository root directory `services/assistant`.
4. Node background worker service using that same root directory.

For both Node services, use Node 22, build command
`pnpm install --frozen-lockfile && pnpm build`, and set `DATABASE_URL` and
`REDIS_URL` to the internal connection strings. Run `pnpm db:migrate` once
before starting the services, or set it as the API's pre-deploy command.

| Service | Start command | Additional environment |
| --- | --- | --- |
| API | `pnpm start` | `DOTS_INTERNAL_API_TOKEN`, `PORT` (Render supplies it), optional `DOTS_DAILY_TASK_LIMIT` (default 20) and `DOTS_GLOBAL_DAILY_TASK_LIMIT` (default 200) |
| Worker | `pnpm worker` | `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, optional `OPENROUTER_SITE_URL` |

The API token must only be held by the Next.js server proxy and the Render
API. Never expose it through a `NEXT_PUBLIC_*` variable. The proxy must verify
the site's authenticated session before forwarding the stable user id as
`x-dots-user-id`. The worker holds the provider key; the API does not need it.

`GET /health` is a liveness check. `GET /ready` checks Postgres and Redis.
The API does not allow browser CORS calls; use the Next.js server proxy.

## API

All `/v1/*` routes require:

```text
Authorization: Bearer <DOTS_INTERNAL_API_TOKEN>
x-dots-user-id: <authenticated stable user id>
```

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/v1/threads` | Up to 50 recent threads (`?limit=30` default). |
| POST | `/v1/threads` | Create a thread; optional JSON `{ "title": "..." }`. |
| GET | `/v1/threads/:threadId` | Thread, latest 100 messages, and latest 100 task summaries. |
| DELETE | `/v1/threads/:threadId` | Delete one owned thread and its messages/tasks. |
| POST | `/v1/threads/:threadId/messages` | Submit `{ "content": "...", "clientMessageId": "stable-id" }`. Returns HTTP 202 with `{message, task, delivery}`. |
| GET | `/v1/tasks/:taskId` | Poll status; completed tasks include `assistantMessageId` and `assistantContent`. |
| DELETE | `/v1/me/data` | Delete all threads, messages, and tasks for the authenticated user. |

`clientMessageId` is optional but recommended. Repeating the same id for the
same user and thread returns the original task. Only one queued or running
task is accepted per thread. The API enforces a Postgres-backed limit of 20 new
tasks per user per UTC day by default; an exhausted user receives HTTP 429.
It also enforces a global 200-task daily cap by default, so resetting a guest
cookie cannot bypass the site's total task budget. Both caps are checked in a
serialized Postgres transaction.
Daily usage lives in a separate table keyed by the UTC day and a digest of the
guest ID. Deleting conversations does not refund today's quota. Old counter
rows can be pruned after their UTC day has ended.
The thread list includes a latest-message `preview` and `pendingCount`. Each
thread's task summaries include `title`, `status`, `result`, and `error`.
The durable task record remains in Postgres if
Redis is temporarily unavailable; the worker re-enqueues it. Jobs have three
attempts with exponential backoff. Final failures have a safe, human-readable
`errorMessage` and `errorCode` in the task response. Provider response bodies
are not logged or returned.

## Local checks

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm test
```

With local Postgres/Redis and environment variables from `.env.example`, run
`pnpm db:migrate`, `pnpm dev`, and `pnpm worker:dev` in separate terminals.
