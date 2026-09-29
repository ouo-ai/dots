import { ListTodo } from "lucide-react"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { TaskStatusBadge } from "@/components/app/task-status-badge"
import { BackendSetupNotice } from "@/components/app/backend-setup-notice"
import type { DotsApiError, Task } from "@/lib/dots/types"

interface TaskPanelProps {
  tasks?: Task[]
  isLoading?: boolean
  error?: DotsApiError | null
}

export function TaskPanel({ tasks, isLoading, error }: TaskPanelProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
        <ListTodo className="h-4 w-4 text-white/50" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-white/80">Task activity</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex flex-col gap-3" aria-hidden="true">
            {[0, 1].map((i) => (
              <div key={i} className="h-20 w-full animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        ) : error ? (
          <BackendSetupNotice error={error} compact />
        ) : !tasks || tasks.length === 0 ? (
          <Empty className="p-2">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ListTodo />
              </EmptyMedia>
              <EmptyTitle>No tasks yet</EmptyTitle>
              <EmptyDescription>Tasks created from your requests will show their progress here.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="flex flex-col gap-3">
            {tasks.map((task) => (
              <li key={task.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-white/90 leading-snug">{task.title}</p>
                  <TaskStatusBadge status={task.status} />
                </div>
                {task.status === "completed" && task.result && (
                  <p className="text-xs leading-relaxed text-white/50">{task.result}</p>
                )}
                {task.status === "failed" && task.error && (
                  <p className="text-xs leading-relaxed text-red-300/80">{task.error}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
