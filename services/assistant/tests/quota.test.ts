import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

test("deleting conversation data does not refund user or global daily quota", {
  skip: !process.env.TEST_DATABASE_URL || !process.env.TEST_REDIS_URL,
}, async () => {
  // TEST_DATABASE_URL must point to an isolated, disposable database.
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
  process.env.REDIS_URL = process.env.TEST_REDIS_URL;
  process.env.DOTS_DAILY_TASK_LIMIT = "1";
  process.env.DOTS_GLOBAL_DAILY_TASK_LIMIT = "2";

  const { buildServer } = await import("../src/server.js");
  const { pool } = await import("../src/db.js");
  const { closeQueue } = await import("../src/queue.js");
  const app = buildServer("test-token");
  const primaryUser = randomUUID();
  const secondUser = randomUUID();
  const thirdUser = randomUUID();

  async function call(method: "POST" | "DELETE", path: string, userId: string, payload?: object) {
    return app.inject({
      method,
      url: path,
      headers: { authorization: "Bearer test-token", "x-dots-user-id": userId },
      payload,
    });
  }

  try {
    for (const file of ["001_init.sql", "002_durable_daily_usage.sql"]) {
      await pool.query(await readFile(new URL(`../migrations/${file}`, import.meta.url), "utf8"));
    }

    const first = await call("POST", "/v1/threads", primaryUser, {});
    assert.equal(first.statusCode, 201);
    const firstThreadId = first.json().thread.id as string;
    assert.equal((await call("POST", `/v1/threads/${firstThreadId}/messages`, primaryUser, {
      content: "First message", clientMessageId: randomUUID(),
    })).statusCode, 202);
    assert.equal((await call("DELETE", `/v1/threads/${firstThreadId}`, primaryUser)).statusCode, 204);

    const next = await call("POST", "/v1/threads", primaryUser, {});
    assert.equal(next.statusCode, 201);
    assert.equal((await call("POST", `/v1/threads/${next.json().thread.id}/messages`, primaryUser, {
      content: "After deletion", clientMessageId: randomUUID(),
    })).statusCode, 429);

    const second = await call("POST", "/v1/threads", secondUser, {});
    assert.equal(second.statusCode, 201);
    assert.equal((await call("POST", `/v1/threads/${second.json().thread.id}/messages`, secondUser, {
      content: "Second user", clientMessageId: randomUUID(),
    })).statusCode, 202);
    assert.equal((await call("DELETE", "/v1/me/data", secondUser)).statusCode, 204);

    const third = await call("POST", "/v1/threads", thirdUser, {});
    assert.equal(third.statusCode, 201);
    assert.equal((await call("POST", `/v1/threads/${third.json().thread.id}/messages`, thirdUser, {
      content: "Global cap should remain", clientMessageId: randomUUID(),
    })).statusCode, 429);

    const counter = await pool.query<{ task_count: number }>(
      `SELECT task_count FROM dots_daily_usage
       WHERE usage_day = (NOW() AT TIME ZONE 'UTC')::date
         AND scope = 'global' AND subject_key = 'site'`,
    );
    assert.equal(counter.rows[0]?.task_count, 2);
  } finally {
    await app.close();
    await closeQueue();
    await pool.end();
  }
});
