"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { Users, Search, UserX, Edit2, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "bg-red-100 text-red-700 border-red-200",
  ORG_ADMIN: "bg-violet-100 text-violet-700 border-violet-200",
  MANAGER: "bg-blue-100 text-blue-700 border-blue-200",
  CONTRIBUTOR: "bg-emerald-100 text-emerald-700 border-emerald-200",
  VIEWER: "bg-slate-100 text-slate-600 border-slate-200",
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState("")
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", search],
    queryFn: async () => {
      const url = new URL("/api/admin/users", window.location.origin)
      if (search) url.searchParams.set("search", search)
      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, isActive, role }: { id: string; isActive?: boolean; role?: string }) => {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive, role }),
      })
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
    onSuccess: () => {
      toast({ title: "User updated" })
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
    },
  })

  const users = data?.users ?? []

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-cyan-500" /> User Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage users across all organizations</p>
        </div>
        <Badge variant="outline" className="text-slate-600">
          {data?.total ?? 0} total users
        </Badge>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>MFA</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user: {
                  id: string
                  name?: string | null
                  email: string
                  image?: string | null
                  role: string
                  isActive: boolean
                  mfaEnabled: boolean
                  lastLogin?: string | null
                  organizations: Array<{ organization: { name: string } }>
                }) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user.image ?? undefined} />
                          <AvatarFallback className="text-xs bg-violet-500 text-white">
                            {user.name?.[0] ?? user.email[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{user.name ?? "—"}</p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={ROLE_COLORS[user.role] ?? ""}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {user.organizations[0]?.organization?.name ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={user.mfaEnabled ? "border-emerald-300 text-emerald-700" : "border-slate-200 text-slate-400"}>
                        {user.mfaEnabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={user.isActive ? "border-emerald-300 text-emerald-700" : "border-red-300 text-red-700"}>
                        {user.isActive ? "Active" : "Disabled"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {user.lastLogin ? format(new Date(user.lastLogin), "MMM d") : "Never"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => updateMutation.mutate({ id: user.id, role: "ORG_ADMIN" })}>
                            <Shield className="w-3.5 h-3.5 mr-2" /> Make Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateMutation.mutate({ id: user.id, isActive: !user.isActive })}>
                            <UserX className="w-3.5 h-3.5 mr-2" />
                            {user.isActive ? "Disable" : "Enable"} User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
