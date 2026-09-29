import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import Fastify from "fastify";
import { z } from "zod";

import { authorizedUserId } from "./auth.js";
import { config, requireApiConfig } from "./config.js";
import { pool, transaction } from "./db.js";
import { closeQueue, enqueueTask, taskQueue } from "./queue.js";
import { quotaSubjectKey } from "./quota.js";

const uuid = z.string().uuid();
const createThreadBody = z.object({ title: z.string().trim().min(1).max(120).optional() }).strict();
const createMessageBody = z.object({
  content: z.string().trim().min(1).max(8_000),
  clientMessageId: z.string().regex(/^[A-Za-z0-9_-]{8,100}$/).optional(),
}).strict();

type ThreadRow = { id: string; title: string; createdAt: Date; updatedAt: Date };
type MessageRow = { id: string; threadId: string; role: "user" | "assistant"; content: string; createdAt: Date };
type TaskRow = {
  id: string;
  threadId: string;
  userMessageId: string;
  status: "queued" | "running" | "completed" | "failed";
  attemptCount: number;
  errorCode: string | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  assistantMessageId?: string | null;
  assistantContent?: string | null;
};

class HttpError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

const threadFields = 'id, title, created_at AS "createdAt", updated_at AS "updatedAt"';
const messageFields = 'id, thread_id AS "threadId", role, content, created_at AS "createdAt"';
const taskFields = `id, thread_id AS "threadId", user_message_id AS "userMessageId",
  status, attempt_count AS "attemptCount", error_code AS "errorCode",
  error_message AS "errorMessage", created_at AS "createdAt",
  updated_at AS "updatedAt", completed_at AS "completedAt"`;

export function buildServer(token = config.internalToken) {
  const app = Fastify({
    logger: { redact: ["req.headers.authorization", "req.headers.x-dots-user-id"] },
    bodyLimit: 64 * 1024,
    trustProxy: false,
  });

  app.addHook("onRequest", async (request, reply) => {
    if (!request.url.startsWith("/v1/")) return;
    const userId = authorizedUserId(request.headers, token);
    if (!userId) {
      return reply.code(401).send({ error: "Unauthorized." });
    }
    request.dotsUserId = userId;
  });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof HttpError) return reply.code(error.status).send({ error: error.message });
    if (error instanceof SyntaxError || (typeof error === "object" && error !== null && "statusCode" in error && error.statusCode === 400)) {
      return reply.code(400).send({ error: "Invalid request." });
    }
    request.log.error({ route: request.routeOptions.url, code: (error as { code?: string }).code }, "Request failed");
    return reply.code(500).send({ error: "Dots could not complete this request." });
  });

  app.get("/health", async () => ({ ok: true, service: "dots-assistant-api" }));

  app.get("/ready", async (_request, reply) => {
    try {
      await pool.query("SELECT 1");
      await Promise.race([
        taskQueue().getJobCounts("waiting"),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Redis readiness timed out.")), 3_000)),
      ]);
      return { ok: true };
    } catch {
      return reply.code(503).send({ ok: false });
    }
  });

  app.get("/v1/threads", async (request) => {
    const userId = request.dotsUserId!;
    const requestedLimit = Number((request.query as { limit?: string }).limit);
    const limit = Number.isSafeInteger(requestedLimit) ? Math.max(1, Math.min(50, requestedLimit)) : 30;
    const result = await pool.query<ThreadRow & { preview: string | null; pendingCount: number }>(
      `SELECT ${threadFields},
        (SELECT LEFT(m.content, 160) FROM dots_messages m
         WHERE m.thread_id = dots_threads.id AND m.user_id = $1
         ORDER BY m.seq DESC LIMIT 1) AS preview,
        (SELECT COUNT(*)::int FROM dots_tasks t
         WHERE t.thread_id = dots_threads.id AND t.user_id = $1
           AND t.status IN ('queued', 'running')) AS "pendingCount"
       FROM dots_threads WHERE user_id = $1 ORDER BY updated_at DESC LIMIT $2`,
      [userId, limit],
    );
    return { threads: result.rows };
  });

  app.post("/v1/threads", async (request, reply) => {
    const parsed = createThreadBody.safeParse(request.body ?? {});
    if (!parsed.success) return reply.code(400).send({ error: "Invalid thread title." });
    const result = await pool.query<ThreadRow>(
      `INSERT INTO dots_threads (id, user_id, title) VALUES ($1, $2, $3) RETURNING ${threadFields}`,
      [randomUUID(), request.dotsUserId!, parsed.data.title || "New conversation"],
    );
    return reply.code(201).send({ thread: result.rows[0] });
  });

  app.get("/v1/threads/:threadId", async (request, reply) => {
    const parsed = uuid.safeParse((request.params as { threadId: string }).threadId);
    if (!parsed.success) return reply.code(400).send({ error: "Invalid thread id." });
    const userId = request.dotsUserId!;
    const thread = await pool.query<ThreadRow>(
      `SELECT ${threadFields} FROM dots_threads WHERE id = $1 AND user_id = $2`,
      [parsed.data, userId],
    );
    if (!thread.rows[0]) return reply.code(404).send({ error: "Thread not found." });
    const messages = await pool.query<MessageRow>(
      `SELECT ${messageFields} FROM (
        SELECT id, thread_id, role, content, created_at, seq FROM dots_messages
        WHERE thread_id = $1 AND user_id = $2 ORDER BY seq DESC LIMIT 100
      ) recent ORDER BY seq ASC`,
      [parsed.data, userId],
    );
    const tasks = await pool.query<{
      id: string;
      threadId: string;
      userMessageId: string;
      title: string;
      status: TaskRow["status"];
      result: string | null;
      error: string | null;
      createdAt: Date;
      updatedAt: Date;
    }>(
      `SELECT t.id, t.thread_id AS "threadId", t.user_message_id AS "userMessageId",
        LEFT(u.content, 80) AS title,
        t.status, a.content AS result, t.error_message AS error,
        t.created_at AS "createdAt", t.updated_at AS "updatedAt"
       FROM dots_tasks t
       JOIN dots_messages u ON u.id = t.user_message_id
       LEFT JOIN dots_messages a ON a.id = t.assistant_message_id
       WHERE t.thread_id = $1 AND t.user_id = $2
       ORDER BY t.created_at DESC LIMIT 100`,
      [parsed.data, userId],
    );
    return { thread: thread.rows[0], messages: messages.rows, tasks: tasks.rows };
  });

  app.delete("/v1/threads/:threadId", async (request, reply) => {
    const parsed = uuid.safeParse((request.params as { threadId: string }).threadId);
    if (!parsed.success) return reply.code(400).send({ error: "Invalid thread id." });
    const userId = request.dotsUserId!;
    const deleted = await transaction(async (client) => {
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1), 1104)", [userId]);
      return client.query("DELETE FROM dots_threads WHERE id = $1 AND user_id = $2 RETURNING id", [parsed.data, userId]);
    });
    if (!deleted.rows[0]) return reply.code(404).send({ error: "Thread not found." });
    return reply.code(204).send();
  });

  app.delete("/v1/me/data", async (request, reply) => {
    const userId = request.dotsUserId!;
    await transaction(async (client) => {
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1), 1104)", [userId]);
      await client.query("DELETE FROM dots_threads WHERE user_id = $1", [userId]);
    });
    return reply.code(204).send();
  });

  app.post("/v1/threads/:threadId/messages", async (request, reply) => {
    const threadId = uuid.safeParse((request.params as { threadId: string }).threadId);
    const body = createMessageBody.safeParse(request.body);
    if (!threadId.success || !body.success) {
      return reply.code(400).send({ error: "Invalid message." });
    }
    const userId = request.dotsUserId!;

    const created = await transaction(async (client) => {
      // Serialize every submission before checking global and per-user UTC-day quotas.
      await client.query("SELECT pg_advisory_xact_lock(1104, 0)");
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1), 1104)", [userId]);
      const owner = await client.query(
        "SELECT id FROM dots_threads WHERE id = $1 AND user_id = $2 FOR UPDATE",
        [threadId.data, userId],
      );
      if (!owner.rows[0]) throw new HttpError(404, "Thread not found.");

      if (body.data.clientMessageId) {
        const duplicate = await client.query<MessageRow & { taskId: string }>(
          `SELECT m.id, m.thread_id AS "threadId", m.role, m.content,
                  m.created_at AS "createdAt", t.id AS "taskId"
           FROM dots_messages m JOIN dots_tasks t ON t.user_message_id = m.id
           WHERE m.user_id = $1 AND m.client_message_id = $2`,
          [userId, body.data.clientMessageId],
        );
        if (duplicate.rows[0]) {
          if (duplicate.rows[0].threadId !== threadId.data) {
            throw new HttpError(409, "clientMessageId already belongs to another thread.");
          }
          const task = await client.query<TaskRow>(
            `SELECT ${taskFields} FROM dots_tasks WHERE id = $1 AND user_id = $2`,
            [duplicate.rows[0].taskId, userId],
          );
          return {
            message: duplicate.rows[0],
            task: task.rows[0],
            duplicate: true,
          };
        }
      }

      const active = await client.query(
        "SELECT id FROM dots_tasks WHERE thread_id = $1 AND user_id = $2 AND status IN ('queued', 'running')",
        [threadId.data, userId],
      );
      if (active.rows[0]) throw new HttpError(409, "Wait for the current reply before sending another message.");

      const globalUsage = await client.query<{ task_count: number }>(
        `INSERT INTO dots_daily_usage (usage_day, scope, subject_key, task_count)
         VALUES ((NOW() AT TIME ZONE 'UTC')::date, 'global', 'site', 1)
         ON CONFLICT (usage_day, scope, subject_key) DO UPDATE
           SET task_count = dots_daily_usage.task_count + 1, updated_at = NOW()
           WHERE dots_daily_usage.task_count < $1
         RETURNING task_count`,
        [config.globalDailyTaskLimit],
      );
      if (!globalUsage.rows[0]) {
        throw new HttpError(429, "Dots is at daily capacity. Try again after midnight UTC.");
      }
      const userUsage = await client.query<{ task_count: number }>(
        `INSERT INTO dots_daily_usage (usage_day, scope, subject_key, task_count)
         VALUES ((NOW() AT TIME ZONE 'UTC')::date, 'user', $1, 1)
         ON CONFLICT (usage_day, scope, subject_key) DO UPDATE
           SET task_count = dots_daily_usage.task_count + 1, updated_at = NOW()
           WHERE dots_daily_usage.task_count < $2
         RETURNING task_count`,
        [quotaSubjectKey(userId), config.dailyTaskLimit],
      );
      if (!userUsage.rows[0]) {
        throw new HttpError(429, "Daily Dots limit reached. Try again after midnight UTC.");
      }

      const message = await client.query<MessageRow>(
        `INSERT INTO dots_messages (id, thread_id, user_id, role, content, client_message_id)
         VALUES ($1, $2, $3, 'user', $4, $5) RETURNING ${messageFields}`,
        [randomUUID(), threadId.data, userId, body.data.content, body.data.clientMessageId || null],
      );
      const task = await client.query<TaskRow>(
        `INSERT INTO dots_tasks (id, thread_id, user_id, user_message_id)
         VALUES ($1, $2, $3, $4) RETURNING ${taskFields}`,
        [randomUUID(), threadId.data, userId, message.rows[0].id],
      );
      await client.query(
        `UPDATE dots_threads SET
           title = CASE WHEN title = 'New conversation' THEN LEFT($3, 80) ELSE title END,
           updated_at = NOW()
         WHERE id = $1 AND user_id = $2`,
        [threadId.data, userId, body.data.content],
      );
      return { message: message.rows[0], task: task.rows[0], duplicate: false };
    });

    let delivery: "queued" | "recovering" = "queued";
    if (!created.duplicate || created.task.status === "queued") {
      try {
        await enqueueTask(created.task.id);
      } catch {
        // The worker's database reconciliation will enqueue this durable task.
        delivery = "recovering";
        request.log.warn({ taskId: created.task.id }, "Queue unavailable; task remains in Postgres");
      }
    }
    return reply.code(202).send({ message: created.message, task: created.task, delivery });
  });

  app.get("/v1/tasks/:taskId", async (request, reply) => {
    const parsed = uuid.safeParse((request.params as { taskId: string }).taskId);
    if (!parsed.success) return reply.code(400).send({ error: "Invalid task id." });
    const result = await pool.query<TaskRow>(
      `SELECT t.id, t.thread_id AS "threadId", t.user_message_id AS "userMessageId",
        t.status, t.attempt_count AS "attemptCount", t.error_code AS "errorCode",
        t.error_message AS "errorMessage", t.created_at AS "createdAt",
        t.updated_at AS "updatedAt", t.completed_at AS "completedAt",
        a.id AS "assistantMessageId", a.content AS "assistantContent",
        LEFT(u.content, 80) AS title, a.content AS result, t.error_message AS error
       FROM dots_tasks t LEFT JOIN dots_messages a ON a.id = t.assistant_message_id
       JOIN dots_messages u ON u.id = t.user_message_id
       WHERE t.id = $1 AND t.user_id = $2`,
      [parsed.data, request.dotsUserId!],
    );
    if (!result.rows[0]) return reply.code(404).send({ error: "Task not found." });
    return { task: result.rows[0] };
  });

  return app;
}

async function main() {
  requireApiConfig();
  const app = buildServer();
  const shutdown = async () => {
    await app.close();
    await closeQueue();
    await pool.end();
  };
  process.once("SIGINT", () => void shutdown());
  process.once("SIGTERM", () => void shutdown());
  await app.listen({ host: "0.0.0.0", port: config.port });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main().catch(() => {
    console.error("Dots assistant API could not start. Check required environment and database migration.");
    process.exitCode = 1;
  });
}
