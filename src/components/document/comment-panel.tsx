"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { MessageSquare, Send, Check, X, Reply } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface Comment {
  id: string
  content: string
  isResolved: boolean
  createdAt: string
  author: { id: string; name?: string | null; image?: string | null }
  replies?: Comment[]
}

interface CommentPanelProps {
  documentId: string
}

export function CommentPanel({ documentId }: CommentPanelProps) {
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [showResolved, setShowResolved] = useState(false)
  const queryClient = useQueryClient()

  const { data } = useQuery({
    queryKey: ["comments", documentId],
    queryFn: async () => {
      const res = await fetch(`/api/documents/${documentId}/comments`)
      if (!res.ok) return { comments: [] }
      return res.json()
    },
  })

  const addMutation = useMutation({
    mutationFn: async (payload: { content: string; parentId?: string }) => {
      const res = await fetch(`/api/documents/${documentId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
    onSuccess: () => {
      setNewComment("")
      setReplyingTo(null)
      queryClient.invalidateQueries({ queryKey: ["comments", documentId] })
    },
  })

  const resolveMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const res = await fetch(`/api/documents/${documentId}/comments/${commentId}/resolve`, { method: "PUT" })
      if (!res.ok) throw new Error("Failed")
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["comments", documentId] }),
  })

  const comments: Comment[] = data?.comments ?? []
  const filtered = showResolved ? comments : comments.filter((c) => !c.isResolved)

  return (
    <div className="flex flex-col h-full border-l border-slate-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-slate-600" />
          <span className="font-semibold text-sm text-slate-800">Comments</span>
          <Badge variant="outline" className="text-xs">{filtered.length}</Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={() => setShowResolved(!showResolved)}
        >
          {showResolved ? "Hide resolved" : "Show resolved"}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-4 py-3">
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-8 h-8 text-slate-200 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No comments yet</p>
            </div>
          ) : (
            filtered.map((comment) => (
              <div key={comment.id} className={cn("space-y-2", comment.isResolved ? "opacity-60" : "")}>
                <div className="flex gap-2.5">
                  <Avatar className="w-7 h-7 shrink-0">
                    <AvatarImage src={comment.author.image ?? undefined} />
                    <AvatarFallback className="text-xs bg-violet-500 text-white">
                      {comment.author.name?.[0] ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-slate-50 rounded-lg p-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-700">{comment.author.name}</span>
                      <div className="flex items-center gap-1">
                        {comment.isResolved && <Badge className="text-xs bg-emerald-100 text-emerald-700 border-emerald-200 py-0">Resolved</Badge>}
                        <span className="text-xs text-slate-400">{format(new Date(comment.createdAt), "MMM d")}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{comment.content}</p>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs text-slate-400 hover:text-slate-600 px-1"
                        onClick={() => setReplyingTo(comment.id)}
                      >
                        <Reply className="w-3 h-3 mr-1" /> Reply
                      </Button>
                      {!comment.isResolved && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs text-emerald-500 hover:text-emerald-700 px-1"
                          onClick={() => resolveMutation.mutate(comment.id)}
                        >
                          <Check className="w-3 h-3 mr-1" /> Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Replies */}
                {comment.replies?.map((reply) => (
                  <div key={reply.id} className="flex gap-2 ml-8">
                    <Avatar className="w-6 h-6 shrink-0">
                      <AvatarImage src={reply.author.image ?? undefined} />
                      <AvatarFallback className="text-xs bg-cyan-500 text-white">
                        {reply.author.name?.[0] ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-slate-50 rounded-lg p-2">
                      <span className="text-xs font-semibold text-slate-700 mr-2">{reply.author.name}</span>
                      <p className="text-xs text-slate-600">{reply.content}</p>
                    </div>
                  </div>
                ))}

                {replyingTo === comment.id && (
                  <div className="flex gap-2 ml-8">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a reply..."
                      rows={2}
                      className="text-xs resize-none"
                    />
                    <div className="flex flex-col gap-1">
                      <Button
                        size="icon"
                        className="h-7 w-7 bg-cyan-500 hover:bg-cyan-600"
                        onClick={() => addMutation.mutate({ content: newComment, parentId: comment.id })}
                        disabled={!newComment.trim()}
                      >
                        <Send className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setReplyingTo(null); setNewComment("") }}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Add comment */}
      {!replyingTo && (
        <div className="px-4 py-3 border-t border-slate-100 space-y-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows={3}
            className="text-sm resize-none"
          />
          <Button
            className="w-full bg-cyan-500 hover:bg-cyan-600 h-8 text-sm"
            onClick={() => addMutation.mutate({ content: newComment })}
            disabled={!newComment.trim() || addMutation.isPending}
          >
            <Send className="w-3.5 h-3.5 mr-1" /> Comment
          </Button>
        </div>
      )}
    </div>
  )
}
