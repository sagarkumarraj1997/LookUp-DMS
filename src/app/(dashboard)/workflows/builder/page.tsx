"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { ArrowLeft, Save, Play, GitBranch, FileUp, CheckSquare, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { WorkflowBuilder } from "@/components/workflows/workflow-builder"
import { useToast } from "@/hooks/use-toast"

const schema = z.object({
  name: z.string().min(1, "Name required"),
  description: z.string().optional(),
  repositoryId: z.string().min(1, "Repository required"),
  triggerType: z.string().min(1),
})

type FormData = z.infer<typeof schema>

interface WorkflowStep {
  id: string
  type: "EMAIL" | "APPROVAL" | "MOVE_FILE" | "ARCHIVE" | "TAG" | "WEBHOOK"
  config: Record<string, unknown>
}

const triggerOptions = [
  { value: "FILE_UPLOAD", label: "File Upload", icon: FileUp, description: "Runs when a file is uploaded to the repository" },
  { value: "APPROVAL_REQUEST", label: "Approval Request", icon: CheckSquare, description: "Runs when an approval is requested" },
  { value: "MANUAL", label: "Manual", icon: Play, description: "Run manually by a user" },
  { value: "SCHEDULE", label: "Scheduled", icon: Clock, description: "Run on a schedule" },
]

function WorkflowBuilderPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const workflowId = searchParams.get("id")

  const [steps, setSteps] = useState<WorkflowStep[]>([])

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "", repositoryId: "", triggerType: "FILE_UPLOAD" },
  })

  const { data: repos } = useQuery({
    queryKey: ["repositories-for-workflow"],
    queryFn: async () => {
      const res = await fetch("/api/repositories")
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  })

  const { data: existingWorkflow } = useQuery({
    queryKey: ["workflow", workflowId],
    queryFn: async () => {
      const res = await fetch(`/api/workflows/${workflowId}`)
      if (!res.ok) throw new Error("Not found")
      return res.json()
    },
    enabled: !!workflowId,
  })

  useEffect(() => {
    if (existingWorkflow) {
      setValue("name", existingWorkflow.name)
      setValue("description", existingWorkflow.description ?? "")
      setValue("repositoryId", existingWorkflow.repositoryId)
      const trigger = existingWorkflow.trigger as { type?: string }
      setValue("triggerType", trigger.type ?? "MANUAL")
      setSteps((existingWorkflow.steps as WorkflowStep[]) ?? [])
    }
  }, [existingWorkflow, setValue])

  const saveMutation = useMutation({
    mutationFn: async (data: FormData & { status: string }) => {
      const payload = {
        name: data.name,
        description: data.description,
        repositoryId: data.repositoryId,
        trigger: { type: data.triggerType },
        steps,
        status: data.status,
      }
      const url = workflowId ? `/api/workflows/${workflowId}` : "/api/workflows"
      const method = workflowId ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Failed to save")
      return res.json()
    },
    onSuccess: (data) => {
      toast({ title: workflowId ? "Workflow updated" : "Workflow created" })
      router.push(`/workflows`)
    },
    onError: () => toast({ title: "Failed to save workflow", variant: "destructive" }),
  })

  const triggerType = watch("triggerType")
  const selectedTrigger = triggerOptions.find((t) => t.value === triggerType)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {workflowId ? "Edit Workflow" : "Create Workflow"}
            </h1>
            <p className="text-sm text-slate-500">Build an automated document workflow</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSubmit((d) => saveMutation.mutate({ ...d, status: "DRAFT" }))}
            disabled={saveMutation.isPending}
          >
            <Save className="w-4 h-4 mr-1" /> Save Draft
          </Button>
          <Button
            className="bg-violet-500 hover:bg-violet-600"
            onClick={handleSubmit((d) => saveMutation.mutate({ ...d, status: "ACTIVE" }))}
            disabled={saveMutation.isPending}
          >
            <Play className="w-4 h-4 mr-1" /> Save & Activate
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Settings */}
        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Workflow Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Name *</Label>
                <Input {...register("name")} placeholder="Workflow name" className="mt-1.5" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label>Description</Label>
                <Textarea {...register("description")} placeholder="What does this workflow do?" rows={2} className="mt-1.5" />
              </div>
              <div>
                <Label>Repository *</Label>
                <Select onValueChange={(v) => setValue("repositoryId", v)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select repository" />
                  </SelectTrigger>
                  <SelectContent>
                    {repos?.repositories?.map((r: { id: string; name: string }) => (
                      <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.repositoryId && <p className="text-red-500 text-xs mt-1">{errors.repositoryId.message}</p>}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Trigger</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {triggerOptions.map(({ value, label, icon: Icon, description }) => (
                <div
                  key={value}
                  onClick={() => setValue("triggerType", value)}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    triggerType === value ? "border-violet-400 bg-violet-50" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <Icon className={`w-4 h-4 mt-0.5 ${triggerType === value ? "text-violet-600" : "text-slate-400"}`} />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{label}</p>
                    <p className="text-xs text-slate-400">{description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right: Builder */}
        <div className="col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-violet-500" /> Workflow Steps
                </CardTitle>
                <div className="flex items-center gap-2">
                  {selectedTrigger && (
                    <Badge variant="outline" className="text-xs">
                      Trigger: {selectedTrigger.label}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {steps.length} step{steps.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <WorkflowBuilder steps={steps} onChange={setSteps} />
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}

export default function WorkflowBuilderPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" /></div>}>
      <WorkflowBuilderPageInner />
    </Suspense>
  )
}
