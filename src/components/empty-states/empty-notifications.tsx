"use client"

import { Bell } from "lucide-react"

export function EmptyNotifications() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
        <Bell className="w-8 h-8 text-slate-500" />
      </div>
      <h3 className="text-white font-semibold mb-1">All caught up!</h3>
      <p className="text-slate-400 text-sm">No new notifications right now.</p>
    </div>
  )
}
