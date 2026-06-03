"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { Bell, X, Check, FileText, FileSignature, GitBranch, Share2, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { NotificationType } from "@/types"

const typeConfig: Record<NotificationType, { icon: React.ElementType; color: string }> = {
  FILE_SHARED: { icon: Share2, color: "bg-cyan-100 text-cyan-600" },
  COMMENT_MENTION: { icon: MessageSquare, color: "bg-violet-100 text-violet-600" },
  APPROVAL_REQUEST: { icon: Check, color: "bg-amber-100 text-amber-600" },
  SIGNATURE_REQUEST: { icon: FileSignature, color: "bg-emerald-100 text-emerald-600" },
  WORKFLOW_COMPLETE: { icon: GitBranch, color: "bg-blue-100 text-blue-600" },
  FILE_UPLOAD: { icon: FileText, color: "bg-slate-100 text-slate-600" },
  SYSTEM_ALERT: { icon: Bell, color: "bg-red-100 text-red-600" },
}

interface NotificationsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const queryClient = useQueryClient()

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications")
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
    enabled: isOpen,
    refetchInterval: isOpen ? 30000 : false,
  })

  const markReadMutation = useMutation({
    mutationFn: async (payload: { id?: string; markAllRead?: boolean }) => {
      const res = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  })

  const notifications = data?.notifications ?? []
  const unreadCount = notifications.filter((n: { isRead: boolean }) => !n.isRead).length

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed top-14 right-4 z-50 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-slate-600" />
                <span className="font-semibold text-slate-800 text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <Badge className="bg-red-500 text-white text-xs px-1.5 py-0 h-5">{unreadCount}</Badge>
                )}
              </div>
              <div className="flex gap-1">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => markReadMutation.mutate({ markAllRead: true })}
                  >
                    Mark all read
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <ScrollArea className="max-h-[480px]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="w-8 h-8 text-slate-200 mb-2" />
                  <p className="text-slate-400 text-sm">No notifications yet</p>
                </div>
              ) : (
                <div>
                  {notifications.map((n: {
                    id: string
                    type: NotificationType
                    title: string
                    message: string
                    isRead: boolean
                    createdAt: string
                  }) => {
                    const cfg = typeConfig[n.type] ?? { icon: Bell, color: "bg-slate-100 text-slate-600" }
                    const Icon = cfg.icon
                    return (
                      <div
                        key={n.id}
                        onClick={() => !n.isRead && markReadMutation.mutate({ id: n.id })}
                        className={cn(
                          "flex gap-3 px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors",
                          !n.isRead ? "bg-cyan-50/30" : ""
                        )}
                      >
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5", cfg.color)}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-slate-800 truncate">{n.title}</p>
                            {!n.isRead && <div className="w-2 h-2 rounded-full bg-cyan-500 shrink-0" />}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
