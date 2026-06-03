"use client"

import { FolderOpen, Plus } from "lucide-react"
import Link from "next/link"

export function EmptyRepositories() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mb-6">
        <FolderOpen className="w-10 h-10 text-slate-500" />
      </div>
      <h3 className="text-white text-xl font-semibold mb-2">No repositories yet</h3>
      <p className="text-slate-400 max-w-sm mb-8">
        Repositories help you organize documents by project, department, or team. Create your first one to get started.
      </p>
      <Link
        href="/repositories/new"
        className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
      >
        <Plus className="w-4 h-4" />
        Create Repository
      </Link>
    </div>
  )
}
