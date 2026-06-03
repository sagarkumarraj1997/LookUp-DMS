"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import Link from "next/link"
import { GitBranch, Plus, Zap, Clock, CheckSquare, FileUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { WorkflowCard } from "@/components/workflows/workflow-card"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"

const TEMPLATES = [
  {
    name: "File Upload → Email",
    description: "Notify team when a file is uploaded",
    trigger: { type: "FILE_UPLOAD" },
    steps: [{ id: "t1", type: "EMAIL", config: { subject: "New File Uploaded" } }],
    icon: FileUp,
  },
  {
    name: "Document Approval Flow",
    description: "Request approval before archiving",
    trigger: { type: "MANUAL" },
    steps: [
      { id: "t1", type: "APPROVAL", config: { deadlineDays: 3 } },
      { id: "t2", type: "ARCHIVE", config: {} },
    ],
    icon: CheckSquare,
  },
  {
    name: "Scheduled Cleanup",
    description: "Archive old documents on schedule",
    trigger: { type: "SCHEDULE" },
    steps: [
      { id: "t1", type: "TAG", config: { tags: ["archived"] } },
      { id: "t2", type: "ARCHIVE", config: {} },
    ],
    icon: Clock,
  },
]

export default function WorkflowsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["workflows", activeTab],
    queryFn: async () => {
      const url = new URL("/api/workflows", window.location.origin)
      if (activeTab !== "all") url.searchParams.set("status", activeTab.toUpperCase())
      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  })

  const toggleMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/workflows/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workflows"] }),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/workflows/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed")
    },
    onSuccess: () => {
      toast({ title: "Workflow deleted" })
      queryClient.invalidateQueries({ queryKey: ["workflows"] })
    },
  })

  const workflows = data?.workflows ?? []

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <GitBranch className="w-7 h-7 text-violet-500" /> Workflows
          </h1>
          <p className="text-slate-500 text-sm mt-1">Automate document processes with visual workflows</p>
        </div>
        <Link href="/workflows/builder">
          <Button className="bg-violet-500 hover:bg-violet-600 gap-2">
            <Plus className="w-4 h-4" /> New Workflow
          </Button>
        </Link>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="paused">Paused</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
      ) : workflows.length === 0 ? (
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <GitBranch className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">No workflows yet</p>
            <p className="text-slate-400 text-sm mt-1">Create a workflow to automate document tasks</p>
          </div>

          {/* Template gallery */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-amber-500" />
              <h2 className="font-semibold text-slate-700">Template Gallery</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {TEMPLATES.map((tmpl) => (
                <Card key={tmpl.name} className="border border-slate-200 hover:border-violet-300 cursor-pointer transition-all hover:shadow-md">
                  <CardContent className="p-5">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center mb-3">
                      <tmpl.icon className="w-5 h-5 text-violet-600" />
                    </div>
                    <h3 className="font-semibold text-sm text-slate-800">{tmpl.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{tmpl.description}</p>
                    <div className="mt-3 flex items-center gap-1">
                      {tmpl.steps.map((s, i) => (
                        <span key={i} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {s.type}
                        </span>
                      ))}
                    </div>
                    <Link href={`/workflows/builder?template=${tmpl.name}`}>
                      <Button size="sm" variant="outline" className="w-full mt-3 text-xs">
                        Use Template
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflows.map((workflow: {
            id: string
            name: string
            description?: string | null
            status: string
            trigger: Record<string, unknown>
            steps: unknown[]
            updatedAt: string
            _count?: { instances: number }
          }) => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              onToggle={(id, status) => toggleMutation.mutate({ id, status })}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}
