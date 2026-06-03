"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { Activity, Search, Download, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-emerald-100 text-emerald-700",
  UPDATE: "bg-blue-100 text-blue-700",
  DELETE: "bg-red-100 text-red-700",
  LOGIN: "bg-violet-100 text-violet-700",
  DOWNLOAD: "bg-amber-100 text-amber-700",
  SHARE: "bg-cyan-100 text-cyan-700",
}

export default function AuditPage() {
  const [search, setSearch] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ["admin-audit", search, dateFrom, dateTo, page],
    queryFn: async () => {
      const url = new URL("/api/admin/audit", window.location.origin)
      if (search) url.searchParams.set("action", search)
      if (dateFrom) url.searchParams.set("dateFrom", dateFrom)
      if (dateTo) url.searchParams.set("dateTo", dateTo)
      url.searchParams.set("page", String(page))
      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  })

  const exportCSV = () => {
    const logs = data?.logs ?? []
    const csv = [
      "Timestamp,Action,User,Resource,IP",
      ...logs.map((l: {
        createdAt: string; action: string;
        user?: { name?: string | null; email?: string }; resourceType?: string; ipAddress?: string | null
      }) =>
        `${l.createdAt},${l.action},${l.user?.name ?? l.user?.email ?? "System"},${l.resourceType ?? ""},${l.ipAddress ?? ""}`
      ),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "audit-log.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const logs = data?.logs ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / 50)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-7 h-7 text-emerald-500" /> Audit Log
          </h1>
          <p className="text-slate-500 text-sm mt-1">Complete audit trail of all system events</p>
        </div>
        <Button variant="outline" onClick={exportCSV}>
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <Input placeholder="Filter by action..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-36 h-9 text-sm" />
              <span className="text-slate-400 text-sm">to</span>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-36 h-9 text-sm" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log: {
                    id: string
                    createdAt: string
                    action: string
                    resourceType?: string | null
                    resourceId?: string | null
                    ipAddress?: string | null
                    details: Record<string, unknown>
                    user?: { name?: string | null; email?: string; image?: string | null }
                  }) => {
                    const actionType = log.action.split("_")[0]
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs text-slate-500 font-mono">
                          {format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={log.user?.image ?? undefined} />
                              <AvatarFallback className="text-xs bg-slate-300">
                                {log.user?.name?.[0] ?? "S"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-slate-700">{log.user?.name ?? "System"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${ACTION_COLORS[actionType] ?? "bg-slate-100 text-slate-700"} text-xs`}>
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">{log.resourceType ?? "—"}</TableCell>
                        <TableCell className="text-xs text-slate-500 font-mono">{log.ipAddress ?? "—"}</TableCell>
                        <TableCell className="text-xs text-slate-400 max-w-[200px] truncate">
                          {Object.keys(log.details).length > 0 ? JSON.stringify(log.details).slice(0, 60) : "—"}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
