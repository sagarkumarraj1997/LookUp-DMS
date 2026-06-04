"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Search, FileText, StickyNote, FolderOpen, Filter, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

function SearchPageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [query, setQuery] = useState(searchParams.get("q") ?? "")
  const [typeFilter, setTypeFilter] = useState("all")
  const [sortBy, setSortBy] = useState("relevance")

  const { data, isLoading } = useQuery({
    queryKey: ["search", query, typeFilter, sortBy],
    queryFn: async () => {
      if (!query.trim()) return { results: {} }
      const url = new URL("/api/search", window.location.origin)
      url.searchParams.set("q", query)
      if (typeFilter !== "all") url.searchParams.set("type", typeFilter)
      url.searchParams.set("sortBy", sortBy)
      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
    enabled: !!query.trim(),
  })

  const highlight = (text: string, query: string) => {
    if (!query || !text) return text
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
    return text.replace(regex, "**$1**")
  }

  const docs = data?.results?.documents ?? []
  const notes = data?.results?.notes ?? []
  const repos = data?.results?.repositories ?? []
  const total = docs.length + notes.length + repos.length

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Search className="w-7 h-7 text-slate-600" /> Search
        </h1>
      </div>

      {/* Search input */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents, notes, repositories..."
            className="pl-9 h-11"
          />
        </div>
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-36 h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="documents">Documents</SelectItem>
              <SelectItem value="notes">Notes</SelectItem>
              <SelectItem value="repositories">Repositories</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-36 h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="date">Date</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" className="h-11 bg-slate-800 hover:bg-slate-700">
            Search
          </Button>
        </div>
      </form>

      {/* Results */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : query && data ? (
        <div className="space-y-6">
          <p className="text-sm text-slate-500">
            {total > 0 ? `${total} results for "${query}"` : `No results for "${query}"`}
          </p>

          {/* Documents */}
          {(typeFilter === "all" || typeFilter === "documents") && docs.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-slate-500" />
                <h2 className="font-semibold text-slate-700 text-sm">Documents ({docs.length})</h2>
              </div>
              <div className="space-y-2">
                {docs.map((doc: {
                  id: string
                  name: string
                  description?: string | null
                  tags: string[]
                  updatedAt: string
                  repository: { id: string; name: string }
                  uploadedBy: { name?: string | null }
                }) => (
                  <Link key={doc.id} href={`/documents/${doc.id}`}>
                    <Card className="border-0 shadow-sm hover:shadow-md transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-slate-800 text-sm">{doc.name}</p>
                            {doc.description && (
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{doc.description}</p>
                            )}
                            <div className="flex items-center gap-3 mt-1">
                              <Badge variant="outline" className="text-xs">{doc.repository?.name}</Badge>
                              {doc.tags?.slice(0, 2).map((t: string) => (
                                <Badge key={t} variant="outline" className="text-xs text-cyan-600 border-cyan-200">{t}</Badge>
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-slate-400 shrink-0">
                            {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {(typeFilter === "all" || typeFilter === "notes") && notes.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <StickyNote className="w-4 h-4 text-amber-500" />
                <h2 className="font-semibold text-slate-700 text-sm">Notes ({notes.length})</h2>
              </div>
              <div className="space-y-2">
                {notes.map((note: { id: string; title: string; content: string; updatedAt: string }) => (
                  <Link key={note.id} href={`/notes/${note.id}`}>
                    <Card className="border-0 shadow-sm hover:shadow-md transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-slate-800 text-sm">{note.title || "Untitled"}</p>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                              {note.content.replace(/[#\n-]/g, " ").slice(0, 100)}
                            </p>
                          </div>
                          <span className="text-xs text-slate-400 shrink-0">
                            {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Repositories */}
          {(typeFilter === "all" || typeFilter === "repositories") && repos.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FolderOpen className="w-4 h-4 text-violet-500" />
                <h2 className="font-semibold text-slate-700 text-sm">Repositories ({repos.length})</h2>
              </div>
              <div className="space-y-2">
                {repos.map((repo: { id: string; name: string; description?: string | null; _count: { documents: number } }) => (
                  <Link key={repo.id} href={`/repositories/${repo.id}`}>
                    <Card className="border-0 shadow-sm hover:shadow-md transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-slate-800 text-sm">{repo.name}</p>
                            {repo.description && (
                              <p className="text-xs text-slate-500 mt-0.5">{repo.description}</p>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {repo._count?.documents} docs
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {total === 0 && (
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No results found</p>
              <p className="text-slate-400 text-sm mt-1">Try different keywords or remove filters</p>
            </div>
          )}
        </div>
      ) : !query ? (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Search across your workspace</p>
          <p className="text-slate-400 text-sm mt-1">Find documents, notes, and repositories</p>
        </div>
      ) : null}
    </motion.div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" /></div>}>
      <SearchPageInner />
    </Suspense>
  )
}
