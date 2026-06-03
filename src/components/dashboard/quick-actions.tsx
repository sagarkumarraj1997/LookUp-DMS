"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Upload, FolderPlus, FileSignature, GitBranch, Users, BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const actions = [
  { label: "Upload Document", icon: Upload, href: "/documents", color: "text-[rgb(var(--accent))] bg-[rgb(var(--accent))]/10 hover:bg-[rgb(var(--accent))]/20" },
  { label: "New Repository", icon: FolderPlus, href: "/repositories/new", color: "text-[rgb(var(--highlight))] bg-[rgb(var(--highlight))]/10 hover:bg-[rgb(var(--highlight))]/20" },
  { label: "Request Signature", icon: FileSignature, href: "/signatures", color: "text-green-500 bg-green-500/10 hover:bg-green-500/20" },
  { label: "Create Workflow", icon: GitBranch, href: "/workflows", color: "text-orange-500 bg-orange-500/10 hover:bg-orange-500/20" },
  { label: "Invite User", icon: Users, href: "/organization", color: "text-purple-500 bg-purple-500/10 hover:bg-purple-500/20" },
  { label: "View Analytics", icon: BarChart3, href: "/analytics", color: "text-blue-500 bg-blue-500/10 hover:bg-blue-500/20" },
]

export function QuickActions() {
  const router = useRouter()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {actions.map((action, idx) => (
              <motion.button
                key={action.label}
                className={cn(
                  "flex items-center gap-2.5 p-3 rounded-xl text-left transition-all",
                  action.color
                )}
                onClick={() => router.push(action.href)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * idx }}
              >
                <action.icon className="w-4 h-4 shrink-0" />
                <span className="text-sm font-medium">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
