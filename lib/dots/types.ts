/**
 * Typed domain model for the Dots client app.
 *
 * This boundary is intentionally provider-agnostic: the UI only ever talks
 * to these shapes. The route handlers under app/api/dots/* are a thin,
 * swappable adapter — once a real backend (auth, database, queue worker,
 * live task events) is connected, only the adapter needs to change.
 */

export type TaskStatus = "queued" | "running" | "completed" | "failed"

export type MessageRole = "user" | "assistant" | "system"

export interface Message {
  id: string
  threadId: string
  role: MessageRole
  content: string
  createdAt: string
}

export interface Task {
  id: string
  threadId: string
  messageId: string
  title: string
  status: TaskStatus
  createdAt: string
  updatedAt: string
  result?: string
  error?: string
}

export interface ThreadSummary {
  id: string
  title: string
  lastMessagePreview: string | null
  updatedAt: string
  unresolvedTaskCount: number
}

export interface ThreadDetail {
  thread: ThreadSummary
  messages: Message[]
  tasks: Task[]
}

export interface SendMessageResult {
  message: Message
  task: Task
}

/** Discriminated error shape returned by every Dots API route. */
export type DotsApiErrorCode =
  | "NOT_CONFIGURED"
  | "NOT_FOUND"
  | "SERVER_ERROR"
  | "NETWORK_ERROR"
  | "RATE_LIMIT"
  | "INVALID_REQUEST"

export class DotsApiError extends Error {
  code: DotsApiErrorCode

  constructor(code: DotsApiErrorCode, message: string) {
    super(message)
    this.name = "DotsApiError"
    this.code = code
  }
}
