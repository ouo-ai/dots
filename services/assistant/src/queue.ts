import { Queue } from "bullmq";
import { Redis } from "ioredis";

import { config } from "./config.js";

export const QUEUE_NAME = "dots-assistant-messages";
export type TaskJob = { taskId: string };

export function redisConnection(worker = true) {
  return new Redis(config.redisUrl, {
    maxRetriesPerRequest: worker ? null : 1,
    enableReadyCheck: false,
    enableOfflineQueue: worker,
    connectTimeout: 5_000,
  });
}

let queue: Queue<TaskJob> | undefined;

export function taskQueue() {
  if (!queue) {
    queue = new Queue<TaskJob>(QUEUE_NAME, {
      connection: redisConnection(false),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 5_000 },
        removeOnComplete: { age: 86_400, count: 5_000 },
        removeOnFail: { age: 604_800, count: 10_000 },
      },
    });
  }
  return queue;
}

export async function enqueueTask(taskId: string) {
  await taskQueue().add("answer", { taskId }, { jobId: taskId });
}

export async function closeQueue() {
  if (queue) {
    const client = await queue.client as unknown as Redis;
    await queue.close();
    if (client.status !== "end") await client.quit();
    queue = undefined;
  }
}
