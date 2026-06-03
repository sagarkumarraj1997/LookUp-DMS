"use client"

import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  trend?: number
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  index?: number
}

export function StatsCard({
  title,
  value,
  description,
  trend,
  icon: Icon,
  iconColor = "text-[rgb(var(--accent))]",
  iconBg = "bg-[rgb(var(--accent))]/10",
  index = 0,
}: StatsCardProps) {
  const trendIsPositive = trend !== undefined && trend > 0
  const trendIsNeutral = trend === 0 || trend === undefined

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Card className="relative overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-[rgb(var(--muted-foreground))] mb-1">{title}</p>
              <p className="text-3xl font-bold tracking-tight">{value}</p>
              {description && (
                <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">{description}</p>
              )}
              {trend !== undefined && (
                <div className={cn(
                  "flex items-center gap-1 mt-2 text-xs font-medium",
                  trendIsPositive ? "text-[rgb(var(--success))]" : trendIsNeutral ? "text-[rgb(var(--muted-foreground))]" : "text-[rgb(var(--destructive))]"
                )}>
                  {trendIsPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : trendIsNeutral ? (
                    <Minus className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>{Math.abs(trend)}% from last month</span>
                </div>
              )}
            </div>
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", iconBg)}>
              <Icon className={cn("w-6 h-6", iconColor)} />
            </div>
          </div>
        </CardContent>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--highlight))] opacity-20" />
      </Card>
    </motion.div>
  )
}
