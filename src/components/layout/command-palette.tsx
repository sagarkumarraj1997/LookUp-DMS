"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { FileText, FolderOpen, LayoutDashboard, Settings, BarChart3, Search } from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { useAppStore } from "@/store/use-app-store"

const quickLinks = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Repositories", href: "/repositories", icon: FolderOpen },
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
]

export function CommandPalette() {
  const router = useRouter()
  const { commandPaletteOpen, setCommandPaletteOpen } = useAppStore()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setCommandPaletteOpen(!commandPaletteOpen)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [commandPaletteOpen, setCommandPaletteOpen])

  const handleSelect = (href: string) => {
    router.push(href)
    setCommandPaletteOpen(false)
  }

  return (
    <CommandDialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <CommandInput placeholder="Search documents, repositories, or navigate..." />
      <CommandList>
        <CommandEmpty>
          <div className="flex flex-col items-center gap-2 py-6">
            <Search className="w-8 h-8 text-[rgb(var(--muted-foreground))]" />
            <p className="text-sm text-[rgb(var(--muted-foreground))]">No results found</p>
          </div>
        </CommandEmpty>
        <CommandGroup heading="Navigation">
          {quickLinks.map((link) => (
            <CommandItem
              key={link.href}
              value={link.label}
              onSelect={() => handleSelect(link.href)}
            >
              <link.icon className="mr-2 h-4 w-4" />
              {link.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick Actions">
          <CommandItem value="new repository" onSelect={() => handleSelect("/repositories/new")}>
            <FolderOpen className="mr-2 h-4 w-4" />
            Create new repository
          </CommandItem>
          <CommandItem value="upload document" onSelect={() => handleSelect("/documents")}>
            <FileText className="mr-2 h-4 w-4" />
            Upload document
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
