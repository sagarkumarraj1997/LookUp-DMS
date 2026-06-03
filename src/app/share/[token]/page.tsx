"use client"

import { useParams } from "next/navigation"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { motion } from "framer-motion"
import { FileText, Download, Eye, Lock, Calendar, User, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"

export default function SharedLinkPage() {
  const { token } = useParams<{ token: string }>()
  const [password, setPassword] = useState("")
  const [unlockedData, setUnlockedData] = useState<Record<string, unknown> | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ["share", token],
    queryFn: async () => {
      const res = await fetch(`/api/share/${token}`)
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed")
      }
      return res.json()
    },
  })

  const unlockMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/share/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) throw new Error("Incorrect password")
      return res.json()
    },
    onSuccess: (d) => setUnlockedData(d),
  })

  const displayData = unlockedData ?? data

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-full max-w-2xl space-y-4">
          <Skeleton className="h-12 w-48 mx-auto" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    const msg = (error as Error).message
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">Link Unavailable</h2>
            <p className="text-slate-500">{msg}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (data?.requiresPassword && !unlockedData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <CardContent className="p-8 text-center space-y-4">
            <Lock className="w-12 h-12 text-cyan-500 mx-auto" />
            <h2 className="text-xl font-bold text-slate-800">Password Protected</h2>
            <p className="text-slate-500">This document requires a password to view.</p>
            <p className="text-sm font-medium text-slate-600">{data.documentName}</p>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && unlockMutation.mutate()}
              />
              <Button
                onClick={() => unlockMutation.mutate()}
                disabled={unlockMutation.isPending || !password}
                className="bg-cyan-500 hover:bg-cyan-600"
              >
                Unlock
              </Button>
            </div>
            {unlockMutation.isError && (
              <p className="text-red-500 text-sm">Incorrect password. Please try again.</p>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  const doc = displayData?.document
  if (!doc) return null

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 py-4 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Shared via LookUp DMS</p>
              <p className="font-semibold text-slate-800 text-sm">{doc.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {displayData?.expiresAt && (
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                Expires {format(new Date(displayData.expiresAt as string), "MMM d, yyyy")}
              </div>
            )}
            {displayData?.createdBy && (
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <User className="w-3.5 h-3.5" />
                Shared by {(displayData.createdBy as { name?: string }).name}
              </div>
            )}
            {displayData?.allowDownload && doc.driveDownloadLink && (
              <Button
                size="sm"
                className="bg-cyan-500 hover:bg-cyan-600"
                onClick={() => window.open(doc.driveDownloadLink as string, "_blank")}
              >
                <Download className="w-4 h-4 mr-1" /> Download
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Document Preview */}
      <div className="max-w-5xl mx-auto py-6 px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
        >
          {doc.driveWebViewLink && displayData?.allowView ? (
            <iframe
              src={doc.driveWebViewLink as string}
              className="w-full h-[80vh]"
              title={doc.name}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-96">
              <FileText className="w-16 h-16 text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium">{doc.name}</p>
              <p className="text-slate-400 text-sm mt-1">Preview not available</p>
              {displayData?.allowDownload && doc.driveDownloadLink && (
                <Button
                  className="mt-4 bg-cyan-500 hover:bg-cyan-600"
                  onClick={() => window.open(doc.driveDownloadLink as string, "_blank")}
                >
                  <Download className="w-4 h-4 mr-1" /> Download File
                </Button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
