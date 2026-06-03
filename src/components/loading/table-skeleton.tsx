interface TableSkeletonProps {
  rows?: number
  cols?: number
}

export function TableSkeleton({ rows = 5, cols = 4 }: TableSkeletonProps) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden animate-pulse">
      <div className="border-b border-slate-700 px-6 py-4">
        <div className="flex gap-6">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-4 bg-slate-700 rounded w-24" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-slate-700/50">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-6 py-4 flex gap-6 items-center">
            <div className="w-8 h-8 bg-slate-700 rounded-lg flex-shrink-0" />
            {Array.from({ length: cols - 1 }).map((_, j) => (
              <div key={j} className="h-4 bg-slate-700/70 rounded" style={{ width: `${60 + Math.random() * 40}px` }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
