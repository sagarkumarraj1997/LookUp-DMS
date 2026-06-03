"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Grid, List, Filter, FolderPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RepositoryGrid } from "@/components/repository/repository-grid"
import { CreateRepositoryDialog } from "@/components/repository/create-repository-dialog"
import { useRepositories, useDeleteRepository } from "@/hooks/use-repositories"
import { toast } from "@/hooks/use-toast"

const DEFAULT_ORG_ID = "default-org"

export default function RepositoriesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [search, setSearch] = useState("")
  const { data: repositories = [], isLoading } = useRepositories()
  const deleteRepo = useDeleteRepository()

  const filtered = repositories.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this repository?")) return
    try {
      await deleteRepo.mutateAsync(id)
      toast({ title: "Repository deleted", variant: "success" as const })
    } catch {
      toast({ title: "Failed to delete repository", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Repositories</h1>
          <p className="text-[rgb(var(--muted-foreground))] text-sm mt-0.5">
            {filtered.length} repositor{filtered.length === 1 ? "y" : "ies"}
          </p>
        </div>
        <CreateRepositoryDialog organizationId={DEFAULT_ORG_ID} />
      </motion.div>

      {/* Toolbar */}
      <motion.div
        className="flex flex-col sm:flex-row gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--muted-foreground))]" />
          <Input
            placeholder="Search repositories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
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
        </div>
      </motion.div>

      {/* Grid */}
      <RepositoryGrid
        repositories={filtered}
        loading={isLoading}
        onDelete={handleDelete}
      />
    </div>
  )
}
