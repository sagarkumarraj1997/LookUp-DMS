"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { format } from "date-fns"
import {
  ArrowLeft, Download, Send, XCircle, CheckCircle,
  Clock, FileText, Users, Activity,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { SignerCard } from "@/components/signatures/signer-card"
import { useToast } from "@/hooks/use-toast"

export default function SignatureDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: request, isLoading } = useQuery({
    queryKey: ["signature", id],
    queryFn: async () => {
      const res = await fetch(`/api/signatures/${id}`)
      if (!res.ok) throw new Error("Not found")
      return res.json()
    },
  })

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/signatures/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to cancel")
      return res.json()
    },
    onSuccess: () => {
      toast({ title: "Request cancelled" })
      queryClient.invalidateQueries({ queryKey: ["signature", id] })
    },
  })

  const remindMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/signatures/${id}/remind`, { method: "POST" })
      if (!res.ok) throw new Error("Failed to send reminder")
      return res.json()
    },
    onSuccess: () => toast({ title: "Reminder sent to pending signers" }),
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <Skeleton className="h-96 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!request) return <p className="text-slate-500">Request not found</p>

  const pendingSigners = request.signatures?.filter((s: { status: string }) => s.status === "PENDING") ?? []
  const currentSignerIdx = request.signatures?.findIndex((s: { status: string }) => s.status === "PENDING")

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{request.title}</h1>
            <p className="text-sm text-slate-500">{request.document?.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {request.status === "PENDING" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => remindMutation.mutate()}
                disabled={remindMutation.isPending}
              >
                <Send className="w-4 h-4 mr-1" /> Send Reminder
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-500 border-red-200 hover:bg-red-50"
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
              >
                <XCircle className="w-4 h-4 mr-1" /> Cancel
              </Button>
            </>
          )}
          {request.status === "COMPLETED" && (
            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600">
              <Download className="w-4 h-4 mr-1" /> Download Signed
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Document Preview */}
        <div className="col-span-2 space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-500" /> Document Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {request.document?.driveWebViewLink ? (
                <iframe
                  src={request.document.driveWebViewLink}
                  className="w-full h-[500px] rounded-lg border border-slate-200"
                  title="Document Preview"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-64 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                  <FileText className="w-12 h-12 text-slate-300 mb-2" />
                  <p className="text-slate-400 text-sm">Preview not available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4 text-violet-500" /> Signing Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-cyan-600" />
                    </div>
                    {request.signatures?.length > 0 && <div className="w-0.5 h-6 bg-slate-200 mt-1" />}
                  </div>
                  <div className="pt-1">
                    <p className="text-sm font-medium text-slate-800">Request Created</p>
                    <p className="text-xs text-slate-400">
                      by {request.requestedBy?.name} · {format(new Date(request.createdAt), "MMM d, yyyy h:mm a")}
                    </p>
                  </div>
                </div>
                {request.signatures?.map((sig: {
                  id: string
                  status: string
                  signedAt?: string
                  signer: { name?: string }
                  order: number
                }, i: number) => (
                  <div key={sig.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        sig.status === "SIGNED" ? "bg-emerald-100" :
                        sig.status === "DECLINED" ? "bg-red-100" : "bg-slate-100"
                      }`}>
                        {sig.status === "SIGNED" ? <CheckCircle className="w-4 h-4 text-emerald-600" /> :
                         sig.status === "DECLINED" ? <XCircle className="w-4 h-4 text-red-500" /> :
                         <Clock className="w-4 h-4 text-slate-400" />}
                      </div>
                      {i < request.signatures.length - 1 && <div className="w-0.5 h-6 bg-slate-200 mt-1" />}
                    </div>
                    <div className="pt-1">
                      <p className="text-sm font-medium text-slate-800">
                        {sig.status === "SIGNED" ? "Signed" :
                         sig.status === "DECLINED" ? "Declined" : "Awaiting signature"} — {sig.signer?.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {sig.signedAt ? format(new Date(sig.signedAt), "MMM d, yyyy h:mm a") : "Pending"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status Card */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-600">Status</p>
                <Badge className={
                  request.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" :
                  request.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                  "bg-red-100 text-red-700"
                }>
                  {request.status}
                </Badge>
              </div>
              {request.dueDate && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600">Due Date</p>
                  <p className="text-sm font-medium text-slate-800">
                    {format(new Date(request.dueDate), "MMM d, yyyy")}
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">Progress</p>
                <p className="text-sm font-medium text-slate-800">
                  {request.signatures?.filter((s: { status: string }) => s.status === "SIGNED").length ?? 0} / {request.signatures?.length ?? 0} signed
                </p>
              </div>
              {request.message && (
                <div>
                  <p className="text-sm text-slate-600 mb-1">Message</p>
                  <p className="text-sm text-slate-700 bg-slate-50 rounded p-2">{request.message}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Signers */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users className="w-4 h-4 text-violet-500" /> Signers ({request.signatures?.length ?? 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {request.signatures?.map((sig: {
                id: string
                order: number
                status: "PENDING" | "SIGNED" | "DECLINED" | "EXPIRED"
                signedAt?: Date
                signer: { id: string; name?: string | null; email: string; image?: string | null }
              }, i: number) => (
                <SignerCard
                  key={sig.id}
                  signer={sig}
                  isActive={i === currentSignerIdx}
                />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
