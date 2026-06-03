"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FolderOpen, FileText, Search, Grid, List, SortAsc, Upload } from "lucide-react"
import { useDocuments } from "@/hooks/use-documents"
import { FileCard } from "@/components/file/file-card"
import { FileUploader } from "@/components/file/file-uploader"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatBytes, formatDateTime } from "@/lib/utils"
import { FileIcon } from "@/components/file/file-icon"
import type { Document } from "@/types"

interface FileBrowserProps {
  repositoryId: string
  folderId?: string
}

export function FileBrowser({ repositoryId, folderId }: FileBrowserProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [search, setSearch] = useState("")
  const { data, isLoading } = useDocuments(repositoryId, folderId)
  const documents: Document[] = data ? (Array.isArray(data) ? data : (data as { documents?: Document[] }).documents ?? []) : []

  const filtered = documents.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--muted-foreground))]" />
          <Input
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="icon">
          <SortAsc className="w-4 h-4" />
        </Button>
        <div className="flex rounded-lg border border-[rgb(var(--border))] overflow-hidden">
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-none h-9 w-9 ${viewMode === "grid" ? "bg-[rgb(var(--muted))]" : ""}`}
            onClick={() => setViewMode("grid")}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-none h-9 w-9 ${viewMode === "list" ? "bg-[rgb(var(--muted))]" : ""}`}
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
        <FileUploader repositoryId={repositoryId} folderId={folderId}>
          <Button variant="accent" size="sm">
            <Upload className="w-4 h-4 mr-2" />Upload
          </Button>
        </FileUploader>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[rgb(var(--muted))] flex items-center justify-center mb-4">
            <FileText className="w-7 h-7 text-[rgb(var(--muted-foreground))]" />
          </div>
          <h3 className="font-semibold mb-1">No files yet</h3>
          <p className="text-sm text-[rgb(var(--muted-foreground))] max-w-xs mb-4">
            Upload your first file to get started
          </p>
          <FileUploader repositoryId={repositoryId} folderId={folderId}>
            <Button variant="accent" size="sm">
              <Upload className="w-4 h-4 mr-2" />Upload Files
            </Button>
          </FileUploader>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((doc, idx) => (
            <FileCard key={doc.id} document={doc} index={idx} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-[rgb(var(--border))] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Modified</TableHead>
                <TableHead>Uploaded by</TableHead>
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((doc) => (
                <TableRow key={doc.id} className="cursor-pointer">
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <FileIcon mimeType={doc.mimeType} extension={doc.extension ?? undefined} />
                      <span className="text-sm font-medium line-clamp-1">{doc.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {doc.extension?.toUpperCase() ?? "—"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-[rgb(var(--muted-foreground))]">
                    {formatBytes(Number(doc.fileSize))}
                  </TableCell>
                  <TableCell className="text-sm text-[rgb(var(--muted-foreground))]">
                    {formatDateTime(doc.updatedAt)}
                  </TableCell>
                  <TableCell className="text-sm text-[rgb(var(--muted-foreground))]">
                    {(doc as { uploadedBy?: { name?: string | null } }).uploadedBy?.name ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={doc.driveWebViewLink ?? "#"} target="_blank" rel="noreferrer">
                        View
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
