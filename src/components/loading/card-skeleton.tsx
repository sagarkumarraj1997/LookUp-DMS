interface CardSkeletonProps {
  count?: number
  cols?: number
}

export function CardSkeleton({ count = 6, cols = 3 }: CardSkeletonProps) {
  const colClass = cols === 2 ? "grid-cols-1 md:grid-cols-2" : cols === 4 ? "grid-cols-2 md:grid-cols-4" : "grid-cols-1 md:grid-cols-3"
  return (
    <div className={`grid ${colClass} gap-6 animate-pulse`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-slate-700 rounded-lg" />
            <div className="h-5 bg-slate-700 rounded w-32" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-slate-700/70 rounded w-full" />
            <div className="h-4 bg-slate-700/50 rounded w-3/4" />
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between">
            <div className="h-3 bg-slate-700/50 rounded w-20" />
            <div className="h-3 bg-slate-700/50 rounded w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}
