"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { WhiteboardCanvas } from "@/components/whiteboard/canvas"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

export default function WhiteboardDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const [name, setName] = useState("")

  const { data: whiteboard, isLoading } = useQuery({
    queryKey: ["whiteboard", id],
    queryFn: async () => {
      const res = await fetch(`/api/whiteboards?id=${id}`)
      if (!res.ok) throw new Error("Not found")
      const data = await res.json()
      const wb = data.whiteboards?.find((w: { id: string }) => w.id === id)
      if (wb) setName(wb.title ?? wb.name ?? "")
      return wb
    },
  })

  const saveMutation = useMutation({
    mutationFn: async (content: { elements: unknown[] }) => {
      const res = await fetch("/api/whiteboards", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, content, name }),
      })
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
    onSuccess: () => toast({ title: "Whiteboard saved" }),
  })

  if (isLoading) return <Skeleton className="h-[calc(100vh-8rem)] w-full" />
  if (!whiteboard) return <p className="text-slate-500">Whiteboard not found</p>

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-[calc(100vh-6rem)] flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-48 h-8 text-sm font-semibold border-0 shadow-none focus-visible:ring-0 p-0 bg-transparent"
          />
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => saveMutation.mutate({ elements: [] })}
          disabled={saveMutation.isPending}
        >
          <Save className="w-4 h-4 mr-1" />
          {saveMutation.isPending ? "Saving..." : "Save"}
        </Button>
      </div>
      <div className="flex-1 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
        <WhiteboardCanvas
          initialContent={whiteboard.content as { elements: [] }}
          onSave={(content) => saveMutation.mutate(content)}
        />
      </div>
    </motion.div>
  )
}
