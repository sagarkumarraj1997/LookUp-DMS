"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { NoteEditor } from "@/components/notes/note-editor"

export default function NoteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const { data: note, isLoading } = useQuery({
    queryKey: ["note", id],
    queryFn: async () => {
      const res = await fetch(`/api/notes/${id}`)
      if (!res.ok) throw new Error("Not found")
      return res.json()
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-[calc(100vh-12rem)] w-full" />
      </div>
    )
  }

  if (!note) return <p className="text-slate-500">Note not found</p>

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 h-[calc(100vh-8rem)]"
    >
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <p className="text-sm text-slate-500">Notes / {note.title}</p>
      </div>
      <div className="h-[calc(100%-3rem)]">
        <NoteEditor note={note} />
      </div>
    </motion.div>
  )
}
