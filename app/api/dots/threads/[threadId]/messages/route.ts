import { callDotsBackend, dotsResponse } from "../../../_config"

type Params = { params: Promise<{ threadId: string }> }

export async function POST(request: Request, { params }: Params) {
  const { threadId } = await params
  if (!/^[0-9a-f-]{36}$/i.test(threadId)) return Response.json({ code: "NOT_FOUND", message: "Conversation not found." }, { status: 404 })
  const payload = await request.json().catch(() => ({}))
  if (typeof payload?.content !== "string" || !payload.content.trim()) {
    return Response.json({ code: "INVALID_REQUEST", message: "Write a request before sending it." }, { status: 400 })
  }
  const result = await callDotsBackend("/v1/threads/" + threadId + "/messages", "POST", {
    content: payload.content,
    clientMessageId: typeof payload.clientMessageId === "string" ? payload.clientMessageId : undefined,
  })
  if (result.status !== 202) return dotsResponse(result)
  const task = result.body.task as Record<string, unknown>
  return dotsResponse(result, {
    message: result.body.message,
    task: {
      id: task.id,
      threadId: task.threadId,
      messageId: task.userMessageId,
      title: payload.content.slice(0, 80),
      status: task.status,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    },
  })
}
