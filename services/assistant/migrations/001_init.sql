CREATE TABLE IF NOT EXISTS dots_threads (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'New conversation',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (id, user_id)
);

CREATE INDEX IF NOT EXISTS dots_threads_user_updated_idx
  ON dots_threads (user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS dots_messages (
  id UUID PRIMARY KEY,
  seq BIGINT GENERATED ALWAYS AS IDENTITY UNIQUE,
  thread_id UUID NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  client_message_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY (thread_id, user_id) REFERENCES dots_threads (id, user_id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS dots_messages_client_id_idx
  ON dots_messages (user_id, client_message_id)
  WHERE client_message_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS dots_messages_thread_seq_idx
  ON dots_messages (thread_id, seq DESC);

CREATE TABLE IF NOT EXISTS dots_tasks (
  id UUID PRIMARY KEY,
  thread_id UUID NOT NULL,
  user_id TEXT NOT NULL,
  user_message_id UUID NOT NULL UNIQUE REFERENCES dots_messages (id) ON DELETE CASCADE,
  assistant_message_id UUID UNIQUE REFERENCES dots_messages (id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed')),
  attempt_count INTEGER NOT NULL DEFAULT 0,
  error_code TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  FOREIGN KEY (thread_id, user_id) REFERENCES dots_threads (id, user_id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS dots_tasks_one_active_per_thread_idx
  ON dots_tasks (thread_id) WHERE status IN ('queued', 'running');

CREATE INDEX IF NOT EXISTS dots_tasks_reconcile_idx
  ON dots_tasks (status, updated_at) WHERE status IN ('queued', 'running');

CREATE INDEX IF NOT EXISTS dots_tasks_user_created_idx
  ON dots_tasks (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS dots_tasks_created_idx
  ON dots_tasks (created_at DESC);
