"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { GitBranch, Mail, CheckSquare, MoveRight, Archive, Tag, Webhook, Play, Pause, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const triggerIcons: Record<string, React.ElementType> = {
  FILE_UPLOAD: GitBranch,
  APPROVAL_REQUEST: CheckSquare,
  SCHEDULE: Play,
  MANUAL: Play,
}

const stepIcons: Record<string, React.ElementType> = {
  EMAIL: Mail,
  APPROVAL: CheckSquare,
  MOVE_FILE: MoveRight,
  ARCHIVE: Archive,
  TAG: Tag,
  WEBHOOK: Webhook,
}

interface WorkflowCardProps {
  workflow: {
    id: string
    name: string
    description?: string | null
    status: string
    trigger: Record<string, unknown>
    steps: unknown[]
    updatedAt: string
    _count?: { instances: number }
  }
  onToggle?: (id: string, status: string) => void
  onDelete?: (id: string) => void
}

export function WorkflowCard({ workflow, onToggle, onDelete }: WorkflowCardProps) {
  const isActive = workflow.status === "ACTIVE"
  const triggerType = (workflow.trigger as { type?: string }).type ?? "MANUAL"
  const TriggerIcon = triggerIcons[triggerType] ?? GitBranch
  const steps = (workflow.steps as Array<{ type: string }>) ?? []

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
              isActive ? "bg-cyan-100" : "bg-slate-100"
            )}>
              <TriggerIcon className={cn("w-5 h-5", isActive ? "text-cyan-600" : "text-slate-500")} />
            </div>
            <div>
              <Link href={`/workflows/${workflow.id}`} className="hover:text-cyan-600">
                <h3 className="font-semibold text-slate-900 text-sm">{workflow.name}</h3>
              </Link>
              {workflow.description && (
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{workflow.description}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs py-0">
                  Trigger: {triggerType.replace("_", " ")}
                </Badge>
                <span className="text-xs text-slate-400">{steps.length} step{steps.length !== 1 ? "s" : ""}</span>
                {workflow._count?.instances !== undefined && (
                  <span className="text-xs text-slate-400">{workflow._count.instances} runs</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Switch
              checked={isActive}
              onCheckedChange={(checked) => onToggle?.(workflow.id, checked ? "ACTIVE" : "PAUSED")}
              className="scale-90"
            />
          </div>
        </div>

        {/* Step preview */}
        {steps.length > 0 && (
          <div className="mt-3 flex items-center gap-1 flex-wrap">
            {steps.slice(0, 5).map((step, i) => {
              const StepIcon = stepIcons[step.type] ?? GitBranch
              return (
                <div key={i} className="flex items-center gap-1">
                  <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center">
                    <StepIcon className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  {i < steps.length - 1 && i < 4 && <div className="w-3 h-0.5 bg-slate-200" />}
                </div>
              )
            })}
            {steps.length > 5 && <span className="text-xs text-slate-400">+{steps.length - 5} more</span>}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Updated {formatDistanceToNow(new Date(workflow.updatedAt), { addSuffix: true })}
          </span>
          <div className="flex gap-1">
            <Link href={`/workflows/builder?id=${workflow.id}`}>
              <Button variant="ghost" size="sm" className="h-7 text-xs">Edit</Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
              onClick={() => onDelete?.(workflow.id)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
