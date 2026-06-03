"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { BarChart3, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { StorageTrendChart } from "@/components/analytics/storage-trend-chart"
import { FileTypeChart } from "@/components/analytics/file-type-chart"
import { UsageBarChart } from "@/components/analytics/usage-bar-chart"
import { ActivityHeatmap } from "@/components/analytics/activity-heatmap"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const DATE_RANGES = [
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
]

// Generate mock analytics data
function generateStorageData(days: number) {
  const data = []
  const now = new Date()
  for (let i = days; i >= 0; i -= Math.max(1, Math.floor(days / 20))) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    data.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      used: Math.floor(Math.random() * 30 + 10 + (days - i) * 0.5),
      total: 100,
    })
  }
  return data
}

function generateHeatmapData() {
  const data = []
  const now = new Date()
  for (let i = 365; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    data.push({
      date: d.toISOString().split("T")[0],
      count: Math.random() < 0.6 ? Math.floor(Math.random() * 12) : 0,
    })
  }
  return data
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState(30)

  const { data: repos } = useQuery({
    queryKey: ["repos-for-analytics"],
    queryFn: async () => {
      const res = await fetch("/api/repositories")
      if (!res.ok) return { repositories: [] }
      return res.json()
    },
  })

  const { data: users } = useQuery({
    queryKey: ["users-for-analytics"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users?limit=5")
      if (!res.ok) return { users: [] }
      return res.json()
    },
  })

  const storageData = generateStorageData(dateRange)
  const heatmapData = generateHeatmapData()

  const repoUsage = (repos?.repositories ?? []).slice(0, 8).map((r: { name: string; _count?: { documents: number } }) => ({
    name: r.name.slice(0, 12),
    documents: r._count?.documents ?? Math.floor(Math.random() * 100),
    downloads: Math.floor(Math.random() * 50),
  }))

  const fileTypes = [
    { name: "PDF", value: 42 },
    { name: "DOCX", value: 28 },
    { name: "XLSX", value: 18 },
    { name: "Images", value: 8 },
    { name: "Other", value: 4 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-violet-500" /> Analytics
          </h1>
          <p className="text-slate-500 text-sm mt-1">Insights into your document management activity</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <div className="flex gap-1">
            {DATE_RANGES.map(({ label, value }) => (
              <Button
                key={value}
                variant={dateRange === value ? "default" : "outline"}
                size="sm"
                onClick={() => setDateRange(value)}
                className={dateRange === value ? "bg-violet-500 hover:bg-violet-600" : ""}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <StorageTrendChart data={storageData} />
        </div>
        <FileTypeChart data={fileTypes} />
      </div>

      {/* Heatmap */}
      <ActivityHeatmap data={heatmapData} />

      {/* Charts row 2 */}
      <div className="grid grid-cols-2 gap-4">
        <UsageBarChart data={repoUsage} title="Repository Activity" />

        {/* Top Users */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Top Users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(users?.users ?? []).slice(0, 5).map((user: {
              id: string
              name?: string | null
              email: string
              image?: string | null
            }, i: number) => (
              <div key={user.id} className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 w-5">{i + 1}</span>
                <Avatar className="w-7 h-7">
                  <AvatarImage src={user.image ?? undefined} />
                  <AvatarFallback className="text-xs bg-violet-500 text-white">
                    {user.name?.[0] ?? user.email[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">{user.name ?? user.email}</p>
                  <div className="mt-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 rounded-full"
                      style={{ width: `${100 - i * 15}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-slate-400">{Math.floor(Math.random() * 200 + 50)} actions</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
