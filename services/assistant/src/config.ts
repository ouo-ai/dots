function positiveInteger(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isSafeInteger(value) && value > 0 ? value : fallback;
}

export const config = {
  port: positiveInteger("PORT", 10000),
  databaseUrl: process.env.DATABASE_URL || "",
  redisUrl: process.env.REDIS_URL || "",
  internalToken: process.env.DOTS_INTERNAL_API_TOKEN || "",
  openRouterKey: process.env.OPENROUTER_API_KEY || "",
  openRouterModel: process.env.OPENROUTER_MODEL || "",
  openRouterSiteUrl: process.env.OPENROUTER_SITE_URL || "https://dotsai.bot",
  openRouterTimeoutMs: positiveInteger("OPENROUTER_TIMEOUT_MS", 90_000),
  workerConcurrency: positiveInteger("WORKER_CONCURRENCY", 2),
  dailyTaskLimit: positiveInteger("DOTS_DAILY_TASK_LIMIT", 20),
  globalDailyTaskLimit: positiveInteger("DOTS_GLOBAL_DAILY_TASK_LIMIT", 200),
};

export function requireApiConfig() {
  for (const [name, value] of [
    ["DATABASE_URL", config.databaseUrl],
    ["REDIS_URL", config.redisUrl],
    ["DOTS_INTERNAL_API_TOKEN", config.internalToken],
  ]) {
    if (!value) throw new Error(`${name} is required.`);
  }
}

export function requireWorkerConfig() {
  for (const [name, value] of [
    ["DATABASE_URL", config.databaseUrl],
    ["REDIS_URL", config.redisUrl],
    ["OPENROUTER_API_KEY", config.openRouterKey],
    ["OPENROUTER_MODEL", config.openRouterModel],
  ]) {
    if (!value) throw new Error(`${name} is required.`);
  }
}
