"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { ArrowLeft, Tag, Clock, User } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { DocumentViewer } from "@/components/document/document-viewer"
import { DocumentAnalyzer } from "@/components/ai/document-analyzer"

export default function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const { data: document, isLoading } = useQuery({
    queryKey: ["document", id],
    queryFn: async () => {
      const res = await fetch(`/api/documents/${id}`)
      if (!res.ok) throw new Error("Not found")
      return res.json()
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-4 h-[calc(100vh-8rem)]">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-6 w-64" />
        </div>
        <Skeleton className="h-[calc(100%-4rem)] w-full" />
      </div>
    )
  }

  if (!document) return <p className="text-slate-500">Document not found</p>

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-[calc(100vh-6rem)] flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-slate-900">{document.name}</h1>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {document.uploadedBy?.name}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {format(new Date(document.createdAt), "MMM d, yyyy")}
              </span>
              {document.tags?.length > 0 && (
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {document.tags.slice(0, 3).map((t: string) => (
                    <Badge key={t} variant="outline" className="text-xs py-0 h-4">{t}</Badge>
                  ))}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-4 gap-4 min-h-0">
        {/* Document Viewer */}
        <div className="col-span-3 rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <DocumentViewer document={document} />
        </div>

        {/* AI Analysis sidebar */}
        <div className="overflow-y-auto">
          <DocumentAnalyzer documentId={id} documentName={document.name} />
        </div>
      </div>
    </motion.div>
  )
}
