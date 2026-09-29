"use client"

import useSWR from "swr"
import { useCallback, useState } from "react"
import { createThread, fetchThread, fetchThreads, sendMessage } from "./client"
import { DotsApiError, type ThreadDetail, type ThreadSummary } from "./types"

/**
 * List of conversation threads for the sidebar. Backed by SWR so the list
 * stays in sync across the app shell without manual refetch wiring.
 */
export function useThreads() {
  const { data, error, isLoading, mutate } = useSWR<ThreadSummary[], DotsApiError>(
    "/api/dots/threads",
    fetchThreads,
    { refreshInterval: 10_000 },
  )

  return {
    threads: data ?? [],
    error,
    isLoading,
    refresh: mutate,
  }
}

/** A single thread's messages and tasks. */
export function useThread(threadId: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR<ThreadDetail, DotsApiError>(
    threadId ? `/api/dots/threads/${threadId}` : null,
    () => fetchThread(threadId as string),
    {
      refreshInterval: (current) =>
        current?.tasks.some((task) => task.status === "queued" || task.status === "running") ? 2_500 : 0,
    },
  )

  return {
    thread: data,
    error,
    isLoading,
    refresh: mutate,
  }
}

/** Creates a new thread and reports a typed pending/error state. */
export function useCreateThread() {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<DotsApiError | null>(null)
  const { refresh } = useThreads()

  const create = useCallback(
    async (title?: string) => {
      setIsPending(true)
      setError(null)
      try {
        const thread = await createThread(title)
        await refresh()
        return thread
      } catch (err) {
        const apiError =
          err instanceof DotsApiError ? err : new DotsApiError("SERVER_ERROR", "Could not create a new conversation.")
        setError(apiError)
        return null
      } finally {
        setIsPending(false)
      }
    },
    [refresh],
  )

  return { create, isPending, error }
}

/** Sends a message and reports a typed pending/error state for the composer. */
export function useSendMessage(threadId: string | undefined) {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<DotsApiError | null>(null)
  const { refresh } = useThread(threadId)

  const send = useCallback(
    async (content: string) => {
      if (!threadId) return null
      setIsPending(true)
      setError(null)
      try {
        const result = await sendMessage(threadId, content)
        await refresh()
        return result
      } catch (err) {
        const apiError =
          err instanceof DotsApiError ? err : new DotsApiError("SERVER_ERROR", "Could not send that message.")
        setError(apiError)
        return null
      } finally {
        setIsPending(false)
      }
    },
    [threadId, refresh],
  )

  return { send, isPending, error }
}
