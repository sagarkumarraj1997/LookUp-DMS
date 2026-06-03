"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

const pathLabels: Record<string, string> = {
  dashboard: "Dashboard",
  repositories: "Repositories",
  documents: "Documents",
  notes: "Notes",
  whiteboard: "Whiteboard",
  signatures: "Signatures",
  workflows: "Workflows",
  analytics: "Analytics",
  settings: "Settings",
  organization: "Organization",
  new: "New",
}

export function Breadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  if (segments.length === 0 || (segments.length === 1 && segments[0] === "dashboard")) {
    return null
  }

  const crumbs = segments.map((segment, idx) => {
    const href = "/" + segments.slice(0, idx + 1).join("/")
    const label = pathLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
    const isLast = idx === segments.length - 1
    return { href, label, isLast }
  })

  return (
    <nav className="flex items-center gap-1 text-sm mb-6">
      <Link href="/dashboard" className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors">
        <Home className="w-4 h-4" />
      </Link>
      {crumbs.map((crumb) => (
        <div key={crumb.href} className="flex items-center gap-1">
          <ChevronRight className="w-3.5 h-3.5 text-[rgb(var(--muted-foreground))]" />
          {crumb.isLast ? (
            <span className="text-[rgb(var(--foreground))] font-medium">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className={cn("text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors")}
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}
