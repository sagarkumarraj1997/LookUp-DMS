"use client"

import { useState } from "react"
import { Plus, GripVertical, Trash2, Mail, CheckSquare, MoveRight, Archive, Tag, Webhook, GitBranch } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { StepEditor } from "./step-editor"

interface WorkflowStep {
  id: string
  type: "EMAIL" | "APPROVAL" | "MOVE_FILE" | "ARCHIVE" | "TAG" | "WEBHOOK"
  config: Record<string, unknown>
}

interface WorkflowBuilderProps {
  steps: WorkflowStep[]
  onChange: (steps: WorkflowStep[]) => void
}

const stepTypes: Array<{ type: WorkflowStep["type"]; label: string; icon: React.ElementType; color: string }> = [
  { type: "EMAIL", label: "Send Email", icon: Mail, color: "text-blue-500 bg-blue-50" },
  { type: "APPROVAL", label: "Request Approval", icon: CheckSquare, color: "text-violet-500 bg-violet-50" },
  { type: "MOVE_FILE", label: "Move File", icon: MoveRight, color: "text-cyan-500 bg-cyan-50" },
  { type: "ARCHIVE", label: "Archive", icon: Archive, color: "text-slate-500 bg-slate-100" },
  { type: "TAG", label: "Add Tags", icon: Tag, color: "text-amber-500 bg-amber-50" },
  { type: "WEBHOOK", label: "Webhook", icon: Webhook, color: "text-emerald-500 bg-emerald-50" },
]

export function WorkflowBuilder({ steps, onChange }: WorkflowBuilderProps) {
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null)
  const [dragIdx, setDragIdx] = useState<number | null>(null)

  const addStep = (type: WorkflowStep["type"]) => {
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      type,
      config: {},
    }
    onChange([...steps, newStep])
    setSelectedStepId(newStep.id)
  }

  const removeStep = (id: string) => {
    onChange(steps.filter((s) => s.id !== id))
    if (selectedStepId === id) setSelectedStepId(null)
  }

  const updateStep = (updated: WorkflowStep) => {
    onChange(steps.map((s) => (s.id === updated.id ? updated : s)))
  }

  const handleDragStart = (idx: number) => setDragIdx(idx)
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault()
    if (dragIdx === null || dragIdx === idx) return
    const newSteps = [...steps]
    const [removed] = newSteps.splice(dragIdx, 1)
    newSteps.splice(idx, 0, removed)
    onChange(newSteps)
    setDragIdx(idx)
  }
  const handleDragEnd = () => setDragIdx(null)

  const selectedStep = steps.find((s) => s.id === selectedStepId)

  return (
    <div className="flex gap-4">
      <div className="flex-1 space-y-4">
        {/* Step list */}
        {steps.length === 0 ? (
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
            <GitBranch className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No steps yet</p>
            <p className="text-slate-400 text-sm mt-1">Add steps from the panel below</p>
          </div>
        ) : (
          <div className="space-y-2">
            {steps.map((step, idx) => {
              const meta = stepTypes.find((t) => t.type === step.type)
              const Icon = meta?.icon ?? GitBranch
              return (
                <div key={step.id}>
                  <div
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setSelectedStepId(step.id === selectedStepId ? null : step.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                      step.id === selectedStepId ? "border-cyan-400 bg-cyan-50/50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300",
                      dragIdx === idx ? "opacity-50" : "opacity-100"
                    )}
                  >
                    <GripVertical className="w-4 h-4 text-slate-300 cursor-grab" />
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", meta?.color ?? "bg-slate-100")}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">{meta?.label ?? step.type}</p>
                      <p className="text-xs text-slate-400">Step {idx + 1}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{step.type}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
                      onClick={(e) => { e.stopPropagation(); removeStep(step.id) }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="flex justify-center my-1">
                      <div className="w-0.5 h-4 bg-slate-200" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Add step buttons */}
        <div>
          <p className="text-xs font-medium text-slate-500 mb-2">Add Step</p>
          <div className="grid grid-cols-3 gap-2">
            {stepTypes.map(({ type, label, icon: Icon, color }) => (
              <Button
                key={type}
                variant="outline"
                size="sm"
                className="justify-start gap-2 h-9 text-xs"
                onClick={() => addStep(type)}
              >
                <div className={cn("w-5 h-5 rounded flex items-center justify-center", color)}>
                  <Icon className="w-3 h-3" />
                </div>
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Step config panel */}
      {selectedStep && (
        <StepEditor
          step={selectedStep}
          onChange={updateStep}
          onClose={() => setSelectedStepId(null)}
        />
      )}
    </div>
  )
}
