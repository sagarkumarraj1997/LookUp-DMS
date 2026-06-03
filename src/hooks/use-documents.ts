"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { Document } from "@/types"

async function fetchDocuments(repositoryId?: string, folderId?: string): Promise<Document[]> {
  const params = new URLSearchParams()
  if (repositoryId) params.set("repositoryId", repositoryId)
  if (folderId) params.set("folderId", folderId)
  const res = await fetch(`/api/documents?${params}`)
  if (!res.ok) throw new Error("Failed to fetch documents")
  return res.json()
}

async function fetchDocument(id: string): Promise<Document> {
  const res = await fetch(`/api/documents/${id}`)
  if (!res.ok) throw new Error("Failed to fetch document")
  return res.json()
}

async function deleteDocument(id: string): Promise<void> {
  const res = await fetch(`/api/documents/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Failed to delete document")
}

export function useDocuments(repositoryId?: string, folderId?: string) {
  return useQuery({
    queryKey: ["documents", repositoryId, folderId],
    queryFn: () => fetchDocuments(repositoryId, folderId),
  })
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: ["documents", id],
    queryFn: () => fetchDocument(id),
    enabled: !!id,
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] })
    },
  })
}
