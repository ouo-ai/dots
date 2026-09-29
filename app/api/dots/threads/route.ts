import { callDotsBackend, dotsResponse } from "../_config"

type RawThread = { id: string; title: string; updatedAt: string; preview?: string | null; pendingCount?: number }

function toSummary(thread: RawThread) {
  return {
    id: thread.id,
    title: thread.title,
    lastMessagePreview: thread.preview ?? null,
    updatedAt: thread.updatedAt,
    unresolvedTaskCount: thread.pendingCount ?? 0,
  }
}

export async function GET() {
  const result = await callDotsBackend("/v1/threads")
  if (result.status !== 200) return dotsResponse(result)
  const threads = Array.isArray(result.body.threads) ? (result.body.threads as RawThread[]) : []
  return dotsResponse(result, threads.map(toSummary))
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}))
  const title = typeof payload?.title === "string" ? payload.title : undefined
  const result = await callDotsBackend("/v1/threads", "POST", { title })
  if (result.status !== 201) return dotsResponse(result)
  return dotsResponse(result, toSummary(result.body.thread as RawThread))
}
