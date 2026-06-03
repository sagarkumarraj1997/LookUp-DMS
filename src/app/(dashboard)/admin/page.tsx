"use client"

import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import Link from "next/link"
import { format } from "date-fns"
import { Shield, Building2, Users, Activity, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function AdminPage() {
  const { data: orgs, isLoading: orgsLoading } = useQuery({
    queryKey: ["admin-orgs"],
    queryFn: async () => {
      const res = await fetch("/api/admin/organizations?limit=5")
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  })

  const { data: audit, isLoading: auditLoading } = useQuery({
    queryKey: ["admin-audit-recent"],
    queryFn: async () => {
      const res = await fetch("/api/admin/audit?limit=10")
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  })

  const { data: users } = useQuery({
    queryKey: ["admin-users-count"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users?limit=1")
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  })

  const stats = [
    { label: "Organizations", value: orgs?.total ?? 0, icon: Building2, color: "text-violet-500 bg-violet-50", href: "/admin/organizations" },
    { label: "Total Users", value: users?.total ?? 0, icon: Users, color: "text-cyan-500 bg-cyan-50", href: "/admin/users" },
    { label: "Audit Events (24h)", value: audit?.total ?? 0, icon: Activity, color: "text-emerald-500 bg-emerald-50", href: "/admin/audit" },
    { label: "Security Alerts", value: 0, icon: AlertTriangle, color: "text-red-500 bg-red-50", href: "/admin/audit" },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-7 h-7 text-violet-500" /> Admin Panel
        </h1>
        <p className="text-slate-500 text-sm mt-1">Manage organizations, users, and system settings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                  <p className="text-sm text-slate-500">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Organizations */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold">Recent Organizations</CardTitle>
            <Link href="/admin/organizations">
              <Button variant="ghost" size="sm" className="text-xs">View All</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {orgsLoading ? (
              [...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
            ) : (
              orgs?.organizations?.map((org: {
                id: string
                name: string
                plan: string
                isActive: boolean
                _count: { users: number; repositories: number }
                createdAt: string
              }) => (
                <div key={org.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-400 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">
                      {org.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{org.name}</p>
                      <p className="text-xs text-slate-400">{org._count.users} members · {org._count.repositories} repos</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={org.isActive ? "border-emerald-300 text-emerald-700" : "border-red-300 text-red-700"}>
                    {org.plan}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Audit Log */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold">Recent Audit Events</CardTitle>
            <Link href="/admin/audit">
              <Button variant="ghost" size="sm" className="text-xs">View All</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {auditLoading ? (
              [...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
            ) : (
              audit?.logs?.map((log: {
                id: string
                action: string
                createdAt: string
                user?: { name?: string | null; image?: string | null }
              }) => (
                <div key={log.id} className="flex items-center gap-3 py-1.5">
                  <Avatar className="w-6 h-6 shrink-0">
                    <AvatarImage src={log.user?.image ?? undefined} />
                    <AvatarFallback className="text-xs bg-slate-300">{log.user?.name?.[0] ?? "?"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-700 truncate">
                      <span className="font-medium">{log.user?.name ?? "System"}</span> · {log.action}
                    </p>
                    <p className="text-xs text-slate-400">{format(new Date(log.createdAt), "MMM d, h:mm a")}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
