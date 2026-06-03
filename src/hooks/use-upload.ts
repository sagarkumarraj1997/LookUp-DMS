"use client"
import { useState, useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "@/hooks/use-toast"

interface UploadOptions {
  repositoryId: string
  folderId?: string
  onSuccess?: () => void
  onError?: (error: Error) => void
}

interface UploadProgress {
  file: File
  progress: number
  status: "pending" | "uploading" | "success" | "error"
  error?: string
}

export function useUpload({ repositoryId, folderId, onSuccess, onError }: UploadOptions) {
  const [uploads, setUploads] = useState<UploadProgress[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const queryClient = useQueryClient()

  const uploadFile = useCallback(
    async (file: File) => {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("repositoryId", repositoryId)
      if (folderId) formData.append("folderId", folderId)

      setUploads((prev) =>
        prev.map((u) =>
          u.file === file ? { ...u, status: "uploading", progress: 0 } : u
        )
      )

      try {
        const res = await fetch("/api/documents", {
          method: "POST",
          body: formData,
        })

        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.message || "Upload failed")
        }

        setUploads((prev) =>
          prev.map((u) =>
            u.file === file ? { ...u, status: "success", progress: 100 } : u
          )
        )
        return await res.json()
      } catch (error) {
        const err = error instanceof Error ? error : new Error("Upload failed")
        setUploads((prev) =>
          prev.map((u) =>
            u.file === file ? { ...u, status: "error", error: err.message } : u
          )
        )
        throw err
      }
    },
    [repositoryId, folderId]
  )

  const uploadFiles = useCallback(
    async (files: File[]) => {
      setIsUploading(true)
      setUploads(
        files.map((file) => ({ file, progress: 0, status: "pending" as const }))
      )

      let successCount = 0
      let errorCount = 0

      await Promise.allSettled(
        files.map(async (file) => {
          try {
            await uploadFile(file)
            successCount++
          } catch {
            errorCount++
          }
        })
      )

      setIsUploading(false)
      await queryClient.invalidateQueries({ queryKey: ["documents"] })

      if (successCount > 0) {
        toast({
          title: "Upload complete",
          description: `${successCount} file${successCount > 1 ? "s" : ""} uploaded successfully`,
          variant: "success" as const,
        })
        onSuccess?.()
      }

      if (errorCount > 0) {
        const err = new Error(`${errorCount} file${errorCount > 1 ? "s" : ""} failed to upload`)
        toast({ title: "Upload errors", description: err.message, variant: "destructive" })
        onError?.(err)
      }
    },
    [uploadFile, queryClient, onSuccess, onError]
  )

  const clearUploads = useCallback(() => setUploads([]), [])

  return { uploads, isUploading, uploadFiles, clearUploads }
}
