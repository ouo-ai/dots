"use client"

import { DotsApiError, type DotsApiErrorCode, type SendMessageResult, type ThreadDetail, type ThreadSummary } from "./types"

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  let response: Response

  try {
    response = await fetch(input, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    })
  } catch {
    throw new DotsApiError("NETWORK_ERROR", "Could not reach the Dots API. Check your connection and try again.")
  }

  if (!response.ok) {
    let code: DotsApiErrorCode = "SERVER_ERROR"
    let message = "Something went wrong talking to the Dots API."

    try {
      const body = await response.json()
      if (body?.code) code = body.code
      if (body?.message) message = body.message
    } catch {
      // ignore body parse failure, fall back to defaults
    }

    throw new DotsApiError(code, message)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export function fetchThreads(): Promise<ThreadSummary[]> {
  return request<ThreadSummary[]>("/api/dots/threads")
}

export function fetchThread(threadId: string): Promise<ThreadDetail> {
  return request<ThreadDetail>(`/api/dots/threads/${threadId}`)
}

export function createThread(title?: string): Promise<ThreadSummary> {
  return request<ThreadSummary>("/api/dots/threads", {
    method: "POST",
    body: JSON.stringify({ title }),
  })
}

export function sendMessage(threadId: string, content: string): Promise<SendMessageResult> {
  return request<SendMessageResult>(`/api/dots/threads/${threadId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content, clientMessageId: crypto.randomUUID() }),
  })
}

export function deleteThread(threadId: string): Promise<void> {
  return request<void>(`/api/dots/threads/${threadId}`, { method: "DELETE" })
}

export function deleteAllData(): Promise<void> {
  return request<void>("/api/dots/me/data", { method: "DELETE" })
}
