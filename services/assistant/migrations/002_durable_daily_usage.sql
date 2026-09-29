-- Daily usage is independent of conversation rows so deleting a thread never
-- restores model capacity already spent today.
CREATE TABLE IF NOT EXISTS dots_daily_usage (
  usage_day DATE NOT NULL,
  scope TEXT NOT NULL CHECK (scope IN ('global', 'user')),
  subject_key TEXT NOT NULL,
  task_count INTEGER NOT NULL CHECK (task_count >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (usage_day, scope, subject_key)
);
