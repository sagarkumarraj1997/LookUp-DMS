"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity } from "lucide-react"
import { cn } from "@/lib/utils"

interface ActivityHeatmapProps {
  data: Array<{ date: string; count: number }>
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function getColor(count: number): string {
  if (count === 0) return "bg-slate-100"
  if (count < 3) return "bg-cyan-200"
  if (count < 6) return "bg-cyan-400"
  if (count < 10) return "bg-cyan-600"
  return "bg-cyan-800"
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  // Build a 52-week grid
  const today = new Date()
  const grid: Array<Array<{ date: Date; count: number }>> = []

  // Get start of grid (52 weeks ago, aligned to Sunday)
  const start = new Date(today)
  start.setDate(start.getDate() - 52 * 7)
  start.setDate(start.getDate() - start.getDay())

  const dataMap = new Map(data.map((d) => [d.date, d.count]))

  for (let week = 0; week < 53; week++) {
    const weekData = []
    for (let day = 0; day < 7; day++) {
      const d = new Date(start)
      d.setDate(d.getDate() + week * 7 + day)
      const key = d.toISOString().split("T")[0]
      weekData.push({ date: d, count: dataMap.get(key) ?? 0 })
    }
    grid.push(weekData)
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-500" /> Activity Heatmap (Last Year)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="flex gap-0.5">
            {/* Day labels */}
            <div className="flex flex-col gap-0.5 mr-1">
              <div className="h-3" />
              {DAYS.map((d, i) => (
                <div key={d} className={cn("h-3 text-xs text-slate-400 leading-3", i % 2 === 0 ? "opacity-0" : "")}>
                  {d.slice(0, 1)}
                </div>
              ))}
            </div>
            {/* Grid */}
            {grid.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                <div className="h-3 text-xs text-slate-400 leading-3 whitespace-nowrap">
                  {week[0].date.getDate() <= 7 ? MONTHS[week[0].date.getMonth()].slice(0, 3) : ""}
                </div>
                {week.map((cell, di) => (
                  <div
                    key={di}
                    className={cn("w-3 h-3 rounded-sm cursor-default", getColor(cell.count))}
                    title={`${cell.date.toLocaleDateString()}: ${cell.count} events`}
                  />
                ))}
              </div>
            ))}
          </div>
          {/* Legend */}
          <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
            <span>Less</span>
            {[0, 2, 5, 8, 12].map((c) => (
              <div key={c} className={cn("w-3 h-3 rounded-sm", getColor(c))} />
            ))}
            <span>More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
