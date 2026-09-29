import { callDotsBackend, dotsResponse } from "../../_config"

type Params = { params: Promise<{ threadId: string }> }

function validId(id: string) {
  return /^[0-9a-f-]{36}$/i.test(id)
}

export async function GET(_request: Request, { params }: Params) {
  const { threadId } = await params
  if (!validId(threadId)) return Response.json({ code: "NOT_FOUND", message: "Conversation not found." }, { status: 404 })
  const result = await callDotsBackend("/v1/threads/" + threadId)
  if (result.status !== 200) return dotsResponse(result)
  const thread = result.body.thread as Record<string, unknown>
  const messages = Array.isArray(result.body.messages) ? result.body.messages : []
  const rawTasks = Array.isArray(result.body.tasks) ? result.body.tasks as Record<string, unknown>[] : []
  return dotsResponse(result, {
    thread: {
      id: thread.id,
      title: thread.title,
      lastMessagePreview: null,
      updatedAt: thread.updatedAt,
      unresolvedTaskCount: rawTasks.filter((task) => task.status === "queued" || task.status === "running").length,
    },
    messages,
    tasks: rawTasks.map((task) => ({
      id: task.id,
      threadId: task.threadId,
      messageId: task.userMessageId,
      title: task.title,
      status: task.status,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      result: task.result,
      error: task.error,
    })),
  })
}

export async function DELETE(_request: Request, { params }: Params) {
  const { threadId } = await params
  if (!validId(threadId)) return Response.json({ code: "NOT_FOUND", message: "Conversation not found." }, { status: 404 })
  const result = await callDotsBackend("/v1/threads/" + threadId, "DELETE")
  return dotsResponse(result)
}
