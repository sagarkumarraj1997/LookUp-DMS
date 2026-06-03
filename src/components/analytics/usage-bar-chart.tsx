"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"

interface UsageBarChartProps {
  data: Array<{ name: string; documents: number; downloads: number }>
  title?: string
}

export function UsageBarChart({ data, title = "Repository Usage" }: UsageBarChartProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-emerald-500" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} barSize={12}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <Tooltip contentStyle={{ fontSize: 12, border: "1px solid #e2e8f0", borderRadius: 8 }} />
            <Bar dataKey="documents" fill="#06B6D4" radius={[3, 3, 0, 0]} name="Documents" />
            <Bar dataKey="downloads" fill="#8B5CF6" radius={[3, 3, 0, 0]} name="Downloads" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
