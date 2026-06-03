"use client"

import { Search } from "lucide-react"

export function EmptySearch({ query }: { query?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mb-6">
        <Search className="w-10 h-10 text-slate-500" />
      </div>
      <h3 className="text-white text-xl font-semibold mb-2">No results found</h3>
      <p className="text-slate-400 max-w-sm">
        {query
          ? `No results found for "${query}". Try different keywords or check the spelling.`
          : "Enter a search term to find documents, notes, and more."}
      </p>
    </div>
  )
}
