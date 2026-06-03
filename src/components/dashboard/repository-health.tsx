"use client"

import { motion } from "framer-motion"
import { FolderOpen, FileText, Users, TrendingUp, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const repos = [
  { name: "Finance Q4", docs: 47, capacity: 78, users: 8, status: "healthy", growth: 12 },
  { name: "Legal Contracts", docs: 132, capacity: 55, users: 15, status: "healthy", growth: 5 },
  { name: "HR Policies", docs: 23, capacity: 23, users: 5, status: "warning", growth: -2 },
  { name: "IT Documentation", docs: 89, capacity: 89, users: 12, status: "critical", growth: 31 },
]

const statusColors = {
  healthy: "success",
  warning: "highlight",
  critical: "destructive",
} as const

const statusLabels = { healthy: "Healthy", warning: "Near Limit", critical: "At Limit" }

export function RepositoryHealth() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Repository Health</CardTitle>
            <CardDescription>Storage and activity overview</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/repositories">
              View all <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {repos.map((repo, idx) => (
            <motion.div
              key={repo.name}
              className="space-y-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * idx }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                  <span className="text-sm font-medium">{repo.name}</span>
                </div>
                <Badge variant={statusColors[repo.status as keyof typeof statusColors]}>
                  {statusLabels[repo.status as keyof typeof statusLabels]}
                </Badge>
              </div>
              <Progress value={repo.capacity} className="h-1.5" />
              <div className="flex items-center gap-4 text-xs text-[rgb(var(--muted-foreground))]">
                <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{repo.docs} docs</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{repo.users} users</span>
                <span className="flex items-center gap-1 ml-auto">
                  <TrendingUp className="w-3 h-3" />
                  {repo.growth > 0 ? "+" : ""}{repo.growth}%
                </span>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  )
}
