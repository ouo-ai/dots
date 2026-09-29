import { ConversationView } from "@/components/app/conversation-view"

export default async function ThreadPage({ params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = await params

  return <ConversationView threadId={threadId} />
}
