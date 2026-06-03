"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { StickyNote, Plus, Search, FileText, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { NoteCard } from "@/components/notes/note-card"
import { useToast } from "@/hooks/use-toast"

const TEMPLATES = [
  { name: "Meeting Notes", content: "## Meeting Notes\n\n**Date:** \n**Attendees:** \n\n### Agenda\n- \n\n### Action Items\n- [ ] " },
  { name: "Project Brief", content: "# Project Brief\n\n## Overview\n\n## Goals\n\n## Timeline\n\n## Resources\n" },
  { name: "Daily Standup", content: "## Daily Standup\n\n**Yesterday:**\n- \n\n**Today:**\n- \n\n**Blockers:**\n- " },
]

export default function NotesPage() {
  const [search, setSearch] = useState("")
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["notes", search],
    queryFn: async () => {
      const url = new URL("/api/notes", window.location.origin)
      if (search) url.searchParams.set("search", search)
      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  })

  const createMutation = useMutation({
    mutationFn: async (content?: string) => {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled Note", content: content ?? "" }),
      })
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
    onSuccess: (note) => router.push(`/notes/${note.id}`),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed")
    },
    onSuccess: () => {
      toast({ title: "Note deleted" })
      queryClient.invalidateQueries({ queryKey: ["notes"] })
    },
  })

  const notes = data?.notes ?? []
  const pinned: typeof notes = []
  const unpinned = notes

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <StickyNote className="w-7 h-7 text-amber-500" /> Notes
          </h1>
          <p className="text-slate-500 text-sm mt-1">Create and manage your notes and documents</p>
        </div>
        <Button
          onClick={() => createMutation.mutate(undefined)}
          disabled={createMutation.isPending}
          className="bg-amber-500 hover:bg-amber-600 gap-2"
        >
          <Plus className="w-4 h-4" /> New Note
        </Button>
      </div>

      <div className="flex gap-6">
        {/* Main content */}
        <div className="flex-1 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
            </div>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <StickyNote className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">No notes yet</p>
              <p className="text-slate-400 text-sm mt-1">Create your first note to get started</p>
              <Button
                onClick={() => createMutation.mutate(undefined)}
                size="sm"
                className="mt-4 bg-amber-500 hover:bg-amber-600"
              >
                <Plus className="w-4 h-4 mr-1" /> Create Note
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {pinned.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <h2 className="text-sm font-semibold text-slate-600">Pinned</h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {pinned.map((note: {
                      id: string; title: string; content: string | Record<string, unknown>; tags: string[];
                      isPinned?: boolean; updatedAt: string;
                    }) => (
                      <NoteCard key={note.id} note={note} onDelete={(id) => deleteMutation.mutate(id)} />
                    ))}
                  </div>
                </div>
              )}
              {unpinned.length > 0 && (
                <div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {unpinned.map((note: {
                      id: string; title: string; content: string | Record<string, unknown>; tags: string[];
                      isPinned?: boolean; updatedAt: string;
                    }) => (
                      <NoteCard key={note.id} note={note} onDelete={(id) => deleteMutation.mutate(id)} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Templates sidebar */}
        <div className="w-56 shrink-0 space-y-3">
          <p className="text-sm font-semibold text-slate-600">Templates</p>
          {TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.name}
              onClick={() => createMutation.mutate(tmpl.content)}
              className="p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-amber-300 hover:bg-amber-50 transition-all"
            >
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-amber-500" />
                <p className="text-sm font-medium text-slate-700">{tmpl.name}</p>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2">
                {tmpl.content.replace(/[#\n-]/g, " ").slice(0, 60)}...
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
