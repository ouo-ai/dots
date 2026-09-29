import { readFile } from "node:fs/promises";

import { config } from "./config.js";
import { pool } from "./db.js";
import { quotaSubjectKey } from "./quota.js";

if (!config.databaseUrl) throw new Error("DATABASE_URL is required.");

const initialSql = await readFile(new URL("../migrations/001_init.sql", import.meta.url), "utf8");
const quotaSql = await readFile(new URL("../migrations/002_durable_daily_usage.sql", import.meta.url), "utf8");
const client = await pool.connect();
try {
  await client.query("BEGIN");
  await client.query("SELECT pg_advisory_xact_lock(1104, 0)");
  await client.query(initialSql);
  await client.query(quotaSql);

  // Backfill today's counters when upgrading an installation that already
  // has task rows. GREATEST makes rerunning this migration idempotent.
  const global = await client.query<{ count: number }>(
    `SELECT COUNT(*)::int AS count FROM dots_tasks
     WHERE created_at >= (date_trunc('day', NOW() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')`,
  );
  if (global.rows[0]?.count) {
    await client.query(
      `INSERT INTO dots_daily_usage (usage_day, scope, subject_key, task_count)
       VALUES ((NOW() AT TIME ZONE 'UTC')::date, 'global', 'site', $1)
       ON CONFLICT (usage_day, scope, subject_key) DO UPDATE
         SET task_count = GREATEST(dots_daily_usage.task_count, EXCLUDED.task_count), updated_at = NOW()`,
      [global.rows[0].count],
    );
  }
  const users = await client.query<{ user_id: string; count: number }>(
    `SELECT user_id, COUNT(*)::int AS count FROM dots_tasks
     WHERE created_at >= (date_trunc('day', NOW() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')
     GROUP BY user_id`,
  );
  for (const row of users.rows) {
    await client.query(
      `INSERT INTO dots_daily_usage (usage_day, scope, subject_key, task_count)
       VALUES ((NOW() AT TIME ZONE 'UTC')::date, 'user', $1, $2)
       ON CONFLICT (usage_day, scope, subject_key) DO UPDATE
         SET task_count = GREATEST(dots_daily_usage.task_count, EXCLUDED.task_count), updated_at = NOW()`,
      [quotaSubjectKey(row.user_id), row.count],
    );
  }
  await client.query("COMMIT");
  console.log("Dots assistant schema is ready.");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
  await pool.end();
}
