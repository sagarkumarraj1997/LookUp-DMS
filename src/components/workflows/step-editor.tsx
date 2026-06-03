"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface WorkflowStep {
  id: string
  type: "EMAIL" | "APPROVAL" | "MOVE_FILE" | "ARCHIVE" | "TAG" | "WEBHOOK"
  config: Record<string, unknown>
}

interface StepEditorProps {
  step: WorkflowStep
  onChange: (step: WorkflowStep) => void
  onClose: () => void
}

export function StepEditor({ step, onChange, onClose }: StepEditorProps) {
  const updateConfig = (key: string, value: unknown) => {
    onChange({ ...step, config: { ...step.config, [key]: value } })
  }

  const config = step.config

  return (
    <div className="bg-white border-l border-slate-200 w-80 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">Configure: {step.type.replace("_", " ")}</h3>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {step.type === "EMAIL" && (
        <div className="space-y-3">
          <div>
            <Label>To (email)</Label>
            <Input
              value={(config.to as string) ?? ""}
              onChange={(e) => updateConfig("to", e.target.value)}
              placeholder="user@example.com"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Subject</Label>
            <Input
              value={(config.subject as string) ?? ""}
              onChange={(e) => updateConfig("subject", e.target.value)}
              placeholder="Email subject"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Message</Label>
            <Textarea
              value={(config.message as string) ?? ""}
              onChange={(e) => updateConfig("message", e.target.value)}
              placeholder="Email body..."
              rows={4}
              className="mt-1"
            />
          </div>
        </div>
      )}

      {step.type === "APPROVAL" && (
        <div className="space-y-3">
          <div>
            <Label>Approver User ID</Label>
            <Input
              value={(config.approverUserId as string) ?? ""}
              onChange={(e) => updateConfig("approverUserId", e.target.value)}
              placeholder="User ID"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Approval Deadline (days)</Label>
            <Input
              type="number"
              value={(config.deadlineDays as number) ?? 3}
              onChange={(e) => updateConfig("deadlineDays", parseInt(e.target.value))}
              className="mt-1"
            />
          </div>
        </div>
      )}

      {step.type === "MOVE_FILE" && (
        <div>
          <Label>Target Folder ID</Label>
          <Input
            value={(config.targetFolderId as string) ?? ""}
            onChange={(e) => updateConfig("targetFolderId", e.target.value)}
            placeholder="Folder ID"
            className="mt-1"
          />
        </div>
      )}

      {step.type === "TAG" && (
        <div>
          <Label>Tags (comma separated)</Label>
          <Input
            value={((config.tags as string[]) ?? []).join(", ")}
            onChange={(e) => updateConfig("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
            placeholder="tag1, tag2, tag3"
            className="mt-1"
          />
        </div>
      )}

      {step.type === "WEBHOOK" && (
        <div className="space-y-3">
          <div>
            <Label>Webhook URL</Label>
            <Input
              value={(config.url as string) ?? ""}
              onChange={(e) => updateConfig("url", e.target.value)}
              placeholder="https://your-webhook.com/hook"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Method</Label>
            <Select
              value={(config.method as string) ?? "POST"}
              onValueChange={(v) => updateConfig("method", v)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {step.type === "ARCHIVE" && (
        <p className="text-sm text-slate-500">This step will archive the document. No additional configuration needed.</p>
      )}
    </div>
  )
}
