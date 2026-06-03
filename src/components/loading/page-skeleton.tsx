export function PageSkeleton() {
  return (
    <div className="p-6 animate-pulse">
      <div className="h-8 bg-slate-700 rounded-lg w-48 mb-2" />
      <div className="h-4 bg-slate-700/50 rounded w-96 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="h-4 bg-slate-700 rounded w-24 mb-4" />
            <div className="h-8 bg-slate-700 rounded w-16 mb-2" />
            <div className="h-3 bg-slate-700/50 rounded w-32" />
          </div>
        ))}
      </div>
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <div className="h-5 bg-slate-700 rounded w-32 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-8 h-8 bg-slate-700 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-700 rounded w-64" />
                <div className="h-3 bg-slate-700/50 rounded w-32" />
              </div>
              <div className="h-4 bg-slate-700 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
