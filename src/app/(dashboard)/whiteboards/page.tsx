"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { PenTool, Plus, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function WhiteboardsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["whiteboards"],
    queryFn: async () => {
      const res = await fetch("/api/whiteboards")
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/whiteboards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Untitled Whiteboard" }),
      })
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
    onSuccess: (wb) => router.push(`/whiteboards/${wb.id}`),
  })

  const whiteboards = data?.whiteboards ?? []

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <PenTool className="w-7 h-7 text-emerald-500" /> Whiteboards
          </h1>
          <p className="text-slate-500 text-sm mt-1">Collaborative visual workspaces for your team</p>
        </div>
        <Button
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
          className="bg-emerald-500 hover:bg-emerald-600 gap-2"
        >
          <Plus className="w-4 h-4" /> New Whiteboard
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      ) : whiteboards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <PenTool className="w-12 h-12 text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No whiteboards yet</p>
          <Button
            onClick={() => createMutation.mutate()}
            size="sm"
            className="mt-4 bg-emerald-500 hover:bg-emerald-600"
          >
            <Plus className="w-4 h-4 mr-1" /> Create Whiteboard
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {whiteboards.map((wb: {
            id: string
            title: string
            updatedAt: string
          }) => (
            <Card
              key={wb.id}
              className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden"
              onClick={() => router.push(`/whiteboards/${wb.id}`)}
            >
              <div className="h-36 bg-gradient-to-br from-emerald-50 via-cyan-50 to-violet-50 relative overflow-hidden">
                {/* Placeholder thumbnail */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <PenTool className="w-12 h-12 text-slate-200" />
                </div>
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all" />
              </div>
              <CardContent className="p-3">
                <p className="font-medium text-sm text-slate-800 truncate">{wb.title}</p>
                <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(new Date(wb.updatedAt), { addSuffix: true })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  )
}
