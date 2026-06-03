"use client"

import { RepositoryCard } from "@/components/repository/repository-card"
import { Skeleton } from "@/components/ui/skeleton"
import type { Repository } from "@/types"

interface RepositoryGridProps {
  repositories: (Repository & { _count?: { documents: number; folders: number } })[]
  loading?: boolean
  onDelete?: (id: string) => void
  onArchive?: (id: string) => void
}

export function RepositoryGrid({ repositories, loading, onDelete, onArchive }: RepositoryGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="rounded-xl border border-[rgb(var(--border))] p-5 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <div className="flex gap-4">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (repositories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[rgb(var(--muted))] flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-[rgb(var(--muted-foreground))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-1">No repositories yet</h3>
        <p className="text-[rgb(var(--muted-foreground))] text-sm max-w-xs">
          Create your first repository to start organizing and managing your documents.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {repositories.map((repo, idx) => (
        <RepositoryCard
          key={repo.id}
          repository={repo}
          index={idx}
          onDelete={onDelete}
          onArchive={onArchive}
        />
      ))}
    </div>
  )
}
