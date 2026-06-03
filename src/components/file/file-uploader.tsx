"use client"

import { useState, type ReactNode } from "react"
import { useDropzone } from "react-dropzone"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useUpload } from "@/hooks/use-upload"
import { formatBytes } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { FileIcon } from "@/components/file/file-icon"

interface FileUploaderProps {
  repositoryId: string
  folderId?: string
  children?: ReactNode
  onSuccess?: () => void
}

export function FileUploader({ repositoryId, folderId, children, onSuccess }: FileUploaderProps) {
  const [open, setOpen] = useState(false)
  const { uploads, isUploading, uploadFiles, clearUploads } = useUpload({
    repositoryId,
    folderId,
    onSuccess: () => {
      onSuccess?.()
      setTimeout(() => {
        setOpen(false)
        clearUploads()
      }, 1500)
    },
  })

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => {
      uploadFiles(files)
    },
    multiple: true,
    maxSize: 100 * 1024 * 1024, // 100MB
  })

  return (
    <>
      <div onClick={() => setOpen(true)} style={{ display: "contents" }}>
        {children}
      </div>

      <Dialog open={open} onOpenChange={(val) => {
        if (!isUploading) {
          setOpen(val)
          if (!val) clearUploads()
        }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
          </DialogHeader>

          {/* Drop Zone */}
          {uploads.length === 0 && (
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all",
                isDragActive
                  ? "border-[rgb(var(--accent))] bg-[rgb(var(--accent))]/5"
                  : "border-[rgb(var(--border))] hover:border-[rgb(var(--accent))]/50 hover:bg-[rgb(var(--muted))]/50"
              )}
            >
              <input {...getInputProps()} />
              <motion.div
                animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
                className="flex flex-col items-center gap-3"
              >
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
                  isDragActive ? "bg-[rgb(var(--accent))]/20" : "bg-[rgb(var(--muted))]"
                )}>
                  <Upload className={cn("w-7 h-7 transition-colors", isDragActive ? "text-[rgb(var(--accent))]" : "text-[rgb(var(--muted-foreground))]")} />
                </div>
                <div>
                  <p className="font-semibold text-sm">
                    {isDragActive ? "Drop files here" : "Drag & drop files"}
                  </p>
                  <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                    or click to browse — max 100MB per file
                  </p>
                </div>
              </motion.div>
            </div>
          )}

          {/* Upload Progress */}
          <AnimatePresence>
            {uploads.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3 max-h-64 overflow-y-auto"
              >
                {uploads.map((upload, idx) => (
                  <motion.div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-lg bg-[rgb(var(--muted))]/50"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <FileIcon mimeType={upload.file.type} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{upload.file.name}</p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">{formatBytes(upload.file.size)}</p>
                      {upload.status === "uploading" && (
                        <Progress value={upload.progress} className="h-1 mt-1" />
                      )}
                      {upload.error && (
                        <p className="text-xs text-red-500 mt-0.5">{upload.error}</p>
                      )}
                    </div>
                    <div className="shrink-0">
                      {upload.status === "pending" && (
                        <div className="w-4 h-4 rounded-full bg-[rgb(var(--muted-foreground))]/20" />
                      )}
                      {upload.status === "uploading" && (
                        <Loader2 className="w-4 h-4 animate-spin text-[rgb(var(--accent))]" />
                      )}
                      {upload.status === "success" && (
                        <CheckCircle className="w-4 h-4 text-[rgb(var(--success))]" />
                      )}
                      {upload.status === "error" && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {!isUploading && uploads.length === 0 && (
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
