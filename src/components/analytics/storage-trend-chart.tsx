"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HardDrive } from "lucide-react"

interface StorageTrendChartProps {
  data: Array<{ date: string; used: number; total: number }>
}

export function StorageTrendChart({ data }: StorageTrendChartProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-cyan-500" /> Storage Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="storageGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => `${v}GB`} />
            <Tooltip
              contentStyle={{ fontSize: 12, border: "1px solid #e2e8f0", borderRadius: 8 }}
              formatter={(v) => [`${v} GB`, "Storage"]}
            />
            <Area
              type="monotone"
              dataKey="used"
              stroke="#06B6D4"
              strokeWidth={2}
              fill="url(#storageGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
