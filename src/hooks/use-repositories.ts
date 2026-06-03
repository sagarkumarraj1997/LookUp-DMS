"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { Repository } from "@/types"

async function fetchRepositories(): Promise<Repository[]> {
  const res = await fetch("/api/repositories")
  if (!res.ok) throw new Error("Failed to fetch repositories")
  return res.json()
}

async function fetchRepository(id: string): Promise<Repository> {
  const res = await fetch(`/api/repositories/${id}`)
  if (!res.ok) throw new Error("Failed to fetch repository")
  return res.json()
}

async function createRepository(data: Partial<Repository>): Promise<Repository> {
  const res = await fetch("/api/repositories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to create repository")
  return res.json()
}

async function updateRepository(id: string, data: Partial<Repository>): Promise<Repository> {
  const res = await fetch(`/api/repositories/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to update repository")
  return res.json()
}

async function deleteRepository(id: string): Promise<void> {
  const res = await fetch(`/api/repositories/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Failed to delete repository")
}

export function useRepositories() {
  return useQuery({
    queryKey: ["repositories"],
    queryFn: fetchRepositories,
  })
}

export function useRepository(id: string) {
  return useQuery({
    queryKey: ["repositories", id],
    queryFn: () => fetchRepository(id),
    enabled: !!id,
  })
}

export function useCreateRepository() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createRepository,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repositories"] })
    },
  })
}

export function useUpdateRepository() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Repository> }) =>
      updateRepository(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["repositories"] })
      queryClient.invalidateQueries({ queryKey: ["repositories", id] })
    },
  })
}

export function useDeleteRepository() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteRepository,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repositories"] })
    },
  })
}
