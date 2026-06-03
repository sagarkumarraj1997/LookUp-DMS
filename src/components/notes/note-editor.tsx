"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useMutation } from "@tanstack/react-query"
import {
  Bold, Italic, Code, Link2, Heading1, Heading2, Heading3,
  List, ListOrdered, CheckSquare, Table, Minus, Save, Download,
  Hash, Type,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface Note {
  id: string
  title: string
  content: string | Record<string, unknown>
  tags: string[]
  color?: string | null
}

interface NoteEditorProps {
  note: Note
  onSave?: (note: Note) => void
}

const NOTE_COLORS = [
  { name: "default", class: "bg-white" },
  { name: "yellow", class: "bg-yellow-100" },
  { name: "blue", class: "bg-blue-100" },
  { name: "green", class: "bg-emerald-100" },
  { name: "pink", class: "bg-pink-100" },
  { name: "purple", class: "bg-violet-100" },
]

export function NoteEditor({ note, onSave }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title)
  const rawContent = typeof note.content === "string" ? note.content : ((note.content as { text?: string })?.text ?? "")
  const [content, setContent] = useState(rawContent)
  const [tags, setTags] = useState<string[]>(note.tags)
  const [tagInput, setTagInput] = useState("")
  const [color, setColor] = useState(note.color ?? "default")
  const [wordCount, setWordCount] = useState(0)
  const [isDirty, setIsDirty] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(Boolean).length
    setWordCount(words)
  }, [content])

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/notes/${note.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, tags, color }),
      })
      if (!res.ok) throw new Error("Failed to save")
      return res.json()
    },
    onSuccess: (data) => {
      setIsDirty(false)
      setLastSaved(new Date())
      onSave?.({ ...note, title, content, tags, color })
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  })

  // Autosave with debounce
  useEffect(() => {
    if (!isDirty) return
    const timeout = setTimeout(() => {
      saveMutation.mutate()
    }, 2000)
    return () => clearTimeout(timeout)
  }, [title, content, tags, color, isDirty])

  const markDirty = () => setIsDirty(true)

  const insertAtCursor = (before: string, after = "") => {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const selected = content.slice(start, end)
    const newContent =
      content.slice(0, start) + before + selected + after + content.slice(end)
    setContent(newContent)
    markDirty()
    setTimeout(() => {
      ta.focus()
      ta.setSelectionRange(start + before.length, start + before.length + selected.length)
    }, 0)
  }

  const toolbarActions = [
    { icon: Bold, label: "Bold", action: () => insertAtCursor("**", "**") },
    { icon: Italic, label: "Italic", action: () => insertAtCursor("*", "*") },
    { icon: Code, label: "Code", action: () => insertAtCursor("`", "`") },
    { icon: Link2, label: "Link", action: () => insertAtCursor("[", "](url)") },
    { separator: true },
    { icon: Heading1, label: "H1", action: () => insertAtCursor("# ") },
    { icon: Heading2, label: "H2", action: () => insertAtCursor("## ") },
    { icon: Heading3, label: "H3", action: () => insertAtCursor("### ") },
    { separator: true },
    { icon: List, label: "Bullet List", action: () => insertAtCursor("- ") },
    { icon: ListOrdered, label: "Numbered List", action: () => insertAtCursor("1. ") },
    { icon: CheckSquare, label: "Task", action: () => insertAtCursor("- [ ] ") },
    { separator: true },
    { icon: Minus, label: "Divider", action: () => insertAtCursor("\n---\n") },
    { icon: Table, label: "Table", action: () => insertAtCursor("\n| Column 1 | Column 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |\n") },
  ]

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault()
      insertAtCursor("  ")
    }
    // Markdown shortcuts
    if (e.key === "b" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      insertAtCursor("**", "**")
    }
    if (e.key === "i" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      insertAtCursor("*", "*")
    }
    if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      saveMutation.mutate()
    }
  }

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
      setTagInput("")
      markDirty()
    }
  }

  const exportMarkdown = () => {
    const blob = new Blob([`# ${title}\n\n${content}`], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${title || "note"}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-slate-200 flex-wrap">
        {toolbarActions.map((action, i) => {
          if ("separator" in action) {
            return <div key={`sep-${i}`} className="w-px h-5 bg-slate-200 mx-1" />
          }
          const Icon = action.icon
          return (
            <Button
              key={action.label}
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-500 hover:text-slate-800"
              title={action.label}
              onClick={action.action}
            >
              <Icon className="w-3.5 h-3.5" />
            </Button>
          )
        })}
        <div className="ml-auto flex items-center gap-2">
          {/* Color picker */}
          <div className="flex gap-1">
            {NOTE_COLORS.map(({ name, class: cls }) => (
              <button
                key={name}
                onClick={() => { setColor(name); markDirty() }}
                className={cn(
                  "w-4 h-4 rounded-full border-2 transition-all",
                  cls,
                  color === name ? "border-cyan-500 scale-110" : "border-transparent hover:scale-105"
                )}
              />
            ))}
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={exportMarkdown} title="Export Markdown">
            <Download className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            title="Save (Ctrl+S)"
          >
            <Save className={cn("w-3.5 h-3.5", isDirty ? "text-amber-500" : "text-slate-400")} />
          </Button>
        </div>
      </div>

      {/* Title */}
      <div className="px-6 pt-5">
        <Input
          value={title}
          onChange={(e) => { setTitle(e.target.value); markDirty() }}
          placeholder="Note title..."
          className="text-xl font-bold border-0 shadow-none focus-visible:ring-0 p-0 text-slate-900 placeholder:text-slate-300"
        />
      </div>

      {/* Tags */}
      <div className="px-6 pt-2 flex items-center gap-2 flex-wrap">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="outline"
            className="text-xs cursor-pointer hover:bg-red-50 hover:border-red-300"
            onClick={() => { setTags(tags.filter((t) => t !== tag)); markDirty() }}
          >
            {tag} ×
          </Badge>
        ))}
        <Input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTag()}
          placeholder="Add tag..."
          className="w-24 h-5 border-0 shadow-none focus-visible:ring-0 p-0 text-xs text-slate-500"
        />
      </div>

      {/* Editor */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => { setContent(e.target.value); markDirty() }}
        onKeyDown={handleKeyDown}
        className="flex-1 resize-none outline-none px-6 py-4 text-slate-700 text-sm leading-relaxed font-mono placeholder:text-slate-300 placeholder:font-sans"
        placeholder="Start writing... (Markdown supported)&#10;&#10;Use / to insert blocks"
        spellCheck
      />

      {/* Status bar */}
      <div className="flex items-center justify-between px-6 py-2 border-t border-slate-100 text-xs text-slate-400">
        <span>{wordCount} words</span>
        <span>
          {saveMutation.isPending ? "Saving..." :
           lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` :
           isDirty ? "Unsaved changes" : "Up to date"}
        </span>
        <span>Markdown</span>
      </div>
    </div>
  )
}
