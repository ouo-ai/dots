import { randomUUID } from "node:crypto";

import { UnrecoverableError, Worker, type Job } from "bullmq";

import { requireWorkerConfig, config } from "./config.js";
import { pool, transaction } from "./db.js";
import { generateReply, ProviderError } from "./provider.js";
import { closeQueue, enqueueTask, QUEUE_NAME, redisConnection, taskQueue, type TaskJob } from "./queue.js";

requireWorkerConfig();

async function processTask(job: Job<TaskJob>) {
  const taskId = job.data.taskId;
  const claim = await pool.query<{ id: string; thread_id: string; user_id: string; user_message_id: string }>(
    `UPDATE dots_tasks SET status = 'running', attempt_count = attempt_count + 1,
       started_at = COALESCE(started_at, NOW()), updated_at = NOW(),
       error_code = NULL, error_message = NULL
     WHERE id = $1 AND status IN ('queued', 'running')
     RETURNING id, thread_id, user_id, user_message_id`,
    [taskId],
  );
  const task = claim.rows[0];
  if (!task) return;

  try {
    const historyResult = await pool.query<{ role: "user" | "assistant"; content: string }>(
      `SELECT role, content FROM (
         SELECT m.seq, m.role, m.content FROM dots_messages m
         WHERE m.thread_id = $1 AND m.user_id = $2
           AND m.seq <= (SELECT seq FROM dots_messages WHERE id = $3 AND user_id = $2)
         ORDER BY m.seq DESC LIMIT 30
       ) recent ORDER BY seq ASC`,
      [task.thread_id, task.user_id, task.user_message_id],
    );
    if (historyResult.rows.length === 0) {
      throw new ProviderError("message_missing", false, "Dots could not find the message to answer.");
    }

    const content = await generateReply(historyResult.rows);
    await transaction(async (client) => {
      const current = await client.query<{ status: string }>(
        "SELECT status FROM dots_tasks WHERE id = $1 FOR UPDATE",
        [taskId],
      );
      if (current.rows[0]?.status !== "running") return;
      const messageId = randomUUID();
      await client.query(
        `INSERT INTO dots_messages (id, thread_id, user_id, role, content)
         VALUES ($1, $2, $3, 'assistant', $4)`,
        [messageId, task.thread_id, task.user_id, content],
      );
      await client.query(
        `UPDATE dots_tasks SET status = 'completed', assistant_message_id = $2,
           updated_at = NOW(), completed_at = NOW(), error_code = NULL, error_message = NULL
         WHERE id = $1`,
        [taskId, messageId],
      );
      await client.query(
        "UPDATE dots_threads SET updated_at = NOW() WHERE id = $1 AND user_id = $2",
        [task.thread_id, task.user_id],
      );
    });
  } catch (error) {
    const providerError = error instanceof ProviderError ? error : null;
    const retryable = providerError?.retryable ?? true;
    const exhausted = job.attemptsMade + 1 >= (job.opts.attempts ?? 3);
    const failed = !retryable || exhausted;
    const code = providerError?.code || "processing_error";
    const message = providerError?.publicMessage || "Dots could not finish this reply. Please try again.";
    await pool.query(
      `UPDATE dots_tasks SET status = $2, error_code = $3, error_message = $4,
         updated_at = NOW(), completed_at = CASE WHEN $2 = 'failed' THEN NOW() ELSE NULL END
       WHERE id = $1 AND status = 'running'`,
      [taskId, failed ? "failed" : "queued", code, message],
    );
    if (!retryable) throw new UnrecoverableError(`${code}: ${message}`);
    throw new Error(`${code}: ${message}`);
  }
}

async function reconcileTasks() {
  const result = await pool.query<{ id: string }>(
    `SELECT id FROM dots_tasks
     WHERE status IN ('queued', 'running') AND updated_at < NOW() - INTERVAL '30 seconds'
     ORDER BY updated_at ASC LIMIT 100`,
  );
  for (const task of result.rows) {
    const job = await taskQueue().getJob(task.id);
    if (!job) {
      await enqueueTask(task.id);
      continue;
    }
    const state = await job.getState();
    if (state === "failed" || state === "completed") {
      await pool.query(
        `UPDATE dots_tasks SET status = 'failed', error_code = 'queue_interrupted',
           error_message = 'Dots could not finish this reply. Please try again.',
           updated_at = NOW(), completed_at = NOW()
         WHERE id = $1 AND status IN ('queued', 'running')`,
        [task.id],
      );
    }
  }
}

const connection = redisConnection();
const worker = new Worker<TaskJob>(QUEUE_NAME, processTask, {
  connection,
  concurrency: config.workerConcurrency,
  lockDuration: config.openRouterTimeoutMs + 30_000,
});

worker.on("failed", (job) => {
  console.error(`Dots task ${job?.id || "unknown"} failed.`);
});
worker.on("error", () => {
  console.error("Dots worker queue connection error.");
});

let reconciling = false;
const timer = setInterval(() => {
  if (reconciling) return;
  reconciling = true;
  void reconcileTasks()
    .catch(() => console.error("Dots task reconciliation failed."))
    .finally(() => { reconciling = false; });
}, 15_000);
void reconcileTasks().catch(() => console.error("Dots initial task reconciliation failed."));

async function shutdown() {
  clearInterval(timer);
  await worker.close();
  await connection.quit();
  await closeQueue();
  await pool.end();
}
process.once("SIGINT", () => void shutdown());
process.once("SIGTERM", () => void shutdown());
