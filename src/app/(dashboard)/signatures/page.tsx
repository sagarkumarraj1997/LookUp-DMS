"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import Link from "next/link"
import { format } from "date-fns"
import {
  FileSignature, Plus, Clock, CheckCircle, AlertTriangle,
  Filter, Eye, Send, XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const statusBadge = {
  PENDING: { label: "Pending", className: "bg-amber-100 text-amber-700 border-amber-200" },
  COMPLETED: { label: "Completed", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-700 border-red-200" },
  DRAFT: { label: "Draft", className: "bg-slate-100 text-slate-600 border-slate-200" },
  ACTIVE: { label: "Active", className: "bg-blue-100 text-blue-700 border-blue-200" },
  PAUSED: { label: "Paused", className: "bg-orange-100 text-orange-700 border-orange-200" },
}

export default function SignaturesPage() {
  const [statusFilter, setStatusFilter] = useState("all")

  const { data, isLoading } = useQuery({
    queryKey: ["signatures", statusFilter],
    queryFn: async () => {
      const url = new URL("/api/signatures", window.location.origin)
      if (statusFilter !== "all") url.searchParams.set("status", statusFilter)
      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })

  const requests = data?.requests ?? []

  const stats = {
    pending: requests.filter((r: { status: string }) => r.status === "PENDING").length,
    completed: requests.filter((r: { status: string }) => r.status === "COMPLETED").length,
    overdue: requests.filter((r: { status: string; dueDate?: string }) =>
      r.status === "PENDING" && r.dueDate && new Date(r.dueDate) < new Date()
    ).length,
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileSignature className="w-7 h-7 text-cyan-500" />
            E-Signatures
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage signature requests and track signing status</p>
        </div>
        <Link href="/signatures/new">
          <Button className="bg-cyan-500 hover:bg-cyan-600 text-white gap-2">
            <Plus className="w-4 h-4" /> New Request
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending", value: stats.pending, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
          { label: "Completed", value: stats.completed, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: "Overdue", value: stats.overdue, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50" },
        ].map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {isLoading ? <Skeleton className="h-7 w-8" /> : stat.value}
                </p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Signature Requests</CardTitle>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileSignature className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">No signature requests yet</p>
              <p className="text-slate-400 text-sm mt-1">Create your first signature request to get started</p>
              <Link href="/signatures/new" className="mt-4">
                <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600">
                  <Plus className="w-4 h-4 mr-1" /> New Request
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Signers</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req: {
                  id: string
                  title: string
                  status: string
                  dueDate?: string
                  createdAt: string
                  document: { name: string }
                  signatures: Array<{ signer: { name?: string; image?: string } }>
                }) => (
                  <TableRow key={req.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm text-slate-800">{req.title}</p>
                        <p className="text-xs text-slate-400">{req.document?.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex -space-x-2">
                        {req.signatures?.slice(0, 4).map((sig, i) => (
                          <Avatar key={i} className="w-7 h-7 border-2 border-white">
                            <AvatarImage src={sig.signer?.image ?? undefined} />
                            <AvatarFallback className="text-xs bg-violet-500 text-white">
                              {sig.signer?.name?.[0] ?? "?"}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {(req.signatures?.length ?? 0) > 4 && (
                          <div className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs text-slate-600">
                            +{req.signatures.length - 4}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusBadge[req.status as keyof typeof statusBadge]?.className ?? ""}
                      >
                        {statusBadge[req.status as keyof typeof statusBadge]?.label ?? req.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {req.dueDate ? (
                        <span className={`text-sm ${new Date(req.dueDate) < new Date() && req.status === "PENDING" ? "text-red-500 font-medium" : "text-slate-600"}`}>
                          {format(new Date(req.dueDate), "MMM d, yyyy")}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {format(new Date(req.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Link href={`/signatures/${req.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        {req.status === "PENDING" && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-cyan-500">
                            <Send className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
