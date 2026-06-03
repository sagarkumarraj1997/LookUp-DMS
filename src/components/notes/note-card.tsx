"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Pin, MoreHorizontal, Trash2, Edit2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const NOTE_COLORS: Record<string, string> = {
  yellow: "bg-yellow-50 border-yellow-200",
  blue: "bg-blue-50 border-blue-200",
  green: "bg-emerald-50 border-emerald-200",
  pink: "bg-pink-50 border-pink-200",
  purple: "bg-violet-50 border-violet-200",
  default: "bg-white border-slate-200",
}

interface NoteCardProps {
  note: {
    id: string
    title: string
    content: string | Record<string, unknown>
    tags: string[]
    isPinned?: boolean
    color?: string | null
    updatedAt: string
    author?: { name?: string | null; image?: string | null }
  }
  onDelete?: (id: string) => void
}

export function NoteCard({ note, onDelete }: NoteCardProps) {
  const colorClass = NOTE_COLORS[note.color ?? "default"] ?? NOTE_COLORS.default
  const rawContent = typeof note.content === "string" ? note.content : ((note.content as { text?: string })?.text ?? "")
  const excerpt = rawContent.replace(/#+ /g, "").slice(0, 150)

  return (
    <div className={cn("rounded-xl border p-4 hover:shadow-md transition-all group relative", colorClass)}>
      {note.isPinned === true && (
        <Pin className="absolute top-3 right-8 w-3.5 h-3.5 text-amber-500 fill-amber-500" />
      )}

      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/notes/${note.id}`} className="flex items-center gap-2">
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={() => onDelete?.(note.id)}
            >
              <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Link href={`/notes/${note.id}`}>
        <h3 className="font-semibold text-slate-800 text-sm mb-2 pr-6 line-clamp-2 hover:text-cyan-600">
          {note.title || "Untitled"}
        </h3>
        {excerpt && (
          <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-3">{excerpt}</p>
        )}
      </Link>

      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {note.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs py-0 h-5">{tag}</Badge>
          ))}
          {note.tags.length > 3 && <span className="text-xs text-slate-400">+{note.tags.length - 3}</span>}
        </div>
      )}

      <p className="text-xs text-slate-400">
        {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
      </p>
    </div>
  )
}
