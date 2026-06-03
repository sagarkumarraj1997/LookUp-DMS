"use client"

import { StickyNote, Plus } from "lucide-react"
import Link from "next/link"

export function EmptyNotes() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mb-6">
        <StickyNote className="w-10 h-10 text-slate-500" />
      </div>
      <h3 className="text-white text-xl font-semibold mb-2">No notes yet</h3>
      <p className="text-slate-400 max-w-sm mb-8">
        Notes let you capture ideas, meeting minutes, and documentation. Start writing your first note.
      </p>
      <Link
        href="/notes/new"
        className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
      >
        <Plus className="w-4 h-4" />
        New Note
      </Link>
    </div>
  )
}
