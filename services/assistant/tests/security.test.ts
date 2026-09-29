import assert from "node:assert/strict";
import { after, test } from "node:test";

import { authorizedUserId } from "../src/auth.js";
import { boundedHistory, classifyModelError, ProviderError } from "../src/provider.js";
import { buildServer } from "../src/server.js";

const app = buildServer("server-only-secret");
after(async () => { await app.close(); });

test("private routes reject absent, invalid, or incomplete server identity", async () => {
  for (const headers of [
    {},
    { authorization: "Bearer wrong", "x-dots-user-id": "user-1" },
    { authorization: "Bearer server-only-secret" },
    { authorization: "Bearer server-only-secret", "x-dots-user-id": "../../other-user" },
  ]) {
    const response = await app.inject({ method: "GET", url: "/v1/threads", headers });
    assert.equal(response.statusCode, 401);
  }
});

test("trusted bearer and user id pass authentication without accepting duplicate headers", async () => {
  assert.equal(
    authorizedUserId({ authorization: "Bearer server-only-secret", "x-dots-user-id": "user-1" }, "server-only-secret"),
    "user-1",
  );
  assert.equal(
    authorizedUserId({ authorization: ["Bearer server-only-secret", "Bearer attacker"], "x-dots-user-id": "user-1" }, "server-only-secret"),
    null,
  );
});

test("model errors are classified without exposing upstream response text", () => {
  const rejected = classifyModelError({ name: "AI_APICallError", statusCode: 401, message: "upstream secret" });
  assert.ok(rejected instanceof ProviderError);
  assert.equal(rejected.code, "provider_rejected");
  assert.equal(rejected.retryable, false);
  assert.equal(rejected.publicMessage.includes("upstream secret"), false);

  const busy = classifyModelError({ name: "AI_APICallError", statusCode: 429, message: "upstream secret" });
  assert.equal(busy.code, "provider_busy");
  assert.equal(busy.retryable, true);
  assert.equal(busy.publicMessage.includes("upstream secret"), false);
});

test("Mastra receives only a bounded window of persisted conversation", () => {
  const history = Array.from({ length: 40 }, (_, index) => ({
    role: index % 2 ? "assistant" as const : "user" as const,
    content: `message-${index} ` + "x".repeat(7_990),
  }));
  const selected = boundedHistory(history);
  assert.equal(selected.at(-1)?.content, history.at(-1)?.content);
  assert.ok(selected.length <= 30);
  assert.ok(selected.reduce((total, message) => total + message.content.length, 0) <= 64_000);
});
