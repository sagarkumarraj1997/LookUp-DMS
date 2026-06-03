"use client"

import { motion } from "framer-motion"
import { FileText, Upload, Share2, Eye, Trash2, FolderPlus, UserPlus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getInitials, timeAgo } from "@/lib/utils"

const activities = [
  { action: "uploaded", file: "Q4 Financial Report.pdf", user: "Alice Johnson", avatar: null, time: new Date(Date.now() - 2 * 60000), type: "upload" },
  { action: "shared", file: "Board Meeting Notes.docx", user: "Bob Smith", avatar: null, time: new Date(Date.now() - 15 * 60000), type: "share" },
  { action: "viewed", file: "Employee Handbook v3.pdf", user: "Carol White", avatar: null, time: new Date(Date.now() - 45 * 60000), type: "view" },
  { action: "created folder", file: "2024 Legal Documents", user: "David Brown", avatar: null, time: new Date(Date.now() - 2 * 3600000), type: "folder" },
  { action: "deleted", file: "Draft_v1.docx", user: "Eve Wilson", avatar: null, time: new Date(Date.now() - 5 * 3600000), type: "delete" },
  { action: "uploaded", file: "Contract_Template.pdf", user: "Frank Davis", avatar: null, time: new Date(Date.now() - 24 * 3600000), type: "upload" },
]

const actionIcons: Record<string, typeof FileText> = {
  upload: Upload,
  share: Share2,
  view: Eye,
  delete: Trash2,
  folder: FolderPlus,
}

const actionColors: Record<string, string> = {
  upload: "text-[rgb(var(--success))] bg-[rgb(var(--success))]/10",
  share: "text-[rgb(var(--accent))] bg-[rgb(var(--accent))]/10",
  view: "text-[rgb(var(--highlight))] bg-[rgb(var(--highlight))]/10",
  delete: "text-red-500 bg-red-500/10",
  folder: "text-orange-500 bg-orange-500/10",
}

export function RecentActivity() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {activities.map((activity, idx) => {
            const ActionIcon = actionIcons[activity.type] ?? FileText
            const colorClass = actionColors[activity.type] ?? "text-[rgb(var(--muted-foreground))] bg-[rgb(var(--muted))]"

            return (
              <motion.div
                key={idx}
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx }}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                  <ActionIcon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user}</span>
                    {" "}<span className="text-[rgb(var(--muted-foreground))]">{activity.action}</span>{" "}
                    <span className="font-medium truncate">{activity.file}</span>
                  </p>
                  <p className="text-xs text-[rgb(var(--muted-foreground))] mt-0.5">{timeAgo(activity.time)}</p>
                </div>
                <Avatar className="w-6 h-6 shrink-0">
                  <AvatarImage src={activity.avatar ?? undefined} />
                  <AvatarFallback className="text-[9px] bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                    {getInitials(activity.user)}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
            )
          })}
        </CardContent>
      </Card>
    </motion.div>
  )
}
