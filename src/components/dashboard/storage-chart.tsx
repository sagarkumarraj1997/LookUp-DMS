"use client"

import { motion } from "framer-motion"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const storageData = [
  { month: "Jan", documents: 120, storage: 2.1 },
  { month: "Feb", documents: 145, storage: 2.8 },
  { month: "Mar", documents: 189, storage: 3.5 },
  { month: "Apr", documents: 210, storage: 4.2 },
  { month: "May", documents: 267, storage: 5.1 },
  { month: "Jun", documents: 312, storage: 6.3 },
]

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number; name: string }>
  label?: string
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-xs text-[rgb(var(--muted-foreground))]">
            {p.name}: <span className="font-semibold text-[rgb(var(--foreground))]">{p.value}</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function StorageChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Document Growth</CardTitle>
          <CardDescription>Document uploads and storage usage over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={storageData}>
                <defs>
                  <linearGradient id="documentsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgb(6, 182, 212)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="rgb(6, 182, 212)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="storageGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgb(139, 92, 246)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="rgb(139, 92, 246)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" strokeOpacity={0.5} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "rgb(100, 116, 139)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "rgb(100, 116, 139)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="documents"
                  name="Documents"
                  stroke="rgb(6, 182, 212)"
                  strokeWidth={2}
                  fill="url(#documentsGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="storage"
                  name="Storage (GB)"
                  stroke="rgb(139, 92, 246)"
                  strokeWidth={2}
                  fill="url(#storageGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function RepositoryDistributionChart() {
  const data = [
    { name: "Finance", value: 45 },
    { name: "Legal", value: 32 },
    { name: "HR", value: 28 },
    { name: "IT", value: 19 },
    { name: "Marketing", value: 15 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Repository Activity</CardTitle>
          <CardDescription>Documents per repository this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" strokeOpacity={0.5} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: "rgb(100, 116, 139)" }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: "rgb(100, 116, 139)" }} axisLine={false} tickLine={false} width={70} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Documents" fill="rgb(6, 182, 212)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
