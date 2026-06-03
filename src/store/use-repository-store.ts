import { create } from "zustand"
import type { Repository, Folder, Document } from "@/types"

interface RepositoryState {
  repositories: Repository[]
  currentRepository: Repository | null
  currentFolder: Folder | null
  selectedDocuments: string[]
  viewMode: "grid" | "list"
  sortBy: "name" | "date" | "size" | "type"
  sortOrder: "asc" | "desc"
  searchQuery: string
  setRepositories: (repos: Repository[]) => void
  setCurrentRepository: (repo: Repository | null) => void
  setCurrentFolder: (folder: Folder | null) => void
  toggleDocumentSelection: (id: string) => void
  clearSelection: () => void
  setViewMode: (mode: "grid" | "list") => void
  setSortBy: (sort: "name" | "date" | "size" | "type") => void
  setSortOrder: (order: "asc" | "desc") => void
  setSearchQuery: (query: string) => void
}

export const useRepositoryStore = create<RepositoryState>((set) => ({
  repositories: [],
  currentRepository: null,
  currentFolder: null,
  selectedDocuments: [],
  viewMode: "list",
  sortBy: "date",
  sortOrder: "desc",
  searchQuery: "",
  setRepositories: (repos) => set({ repositories: repos }),
  setCurrentRepository: (repo) => set({ currentRepository: repo }),
  setCurrentFolder: (folder) => set({ currentFolder: folder }),
  toggleDocumentSelection: (id) =>
    set((s) => ({
      selectedDocuments: s.selectedDocuments.includes(id)
        ? s.selectedDocuments.filter((d) => d !== id)
        : [...s.selectedDocuments, id],
    })),
  clearSelection: () => set({ selectedDocuments: [] }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setSortOrder: (order) => set({ sortOrder: order }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}))
