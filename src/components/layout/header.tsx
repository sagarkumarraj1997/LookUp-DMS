"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { Bell, Search, Settings, LogOut, User, ChevronDown, Moon, Sun, Command } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/store/use-app-store"
import { getInitials } from "@/lib/utils"
import { CommandPalette } from "@/components/layout/command-palette"

export function Header() {
  const { data: session } = useSession()
  const { sidebarCollapsed, setCommandPaletteOpen, theme, setTheme } = useAppStore()
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const user = session?.user

  return (
    <>
      <header
        className="fixed top-0 right-0 h-16 z-20 flex items-center gap-4 px-6 bg-[rgb(var(--card))]/80 backdrop-blur-sm border-b border-[rgb(var(--border))]"
        style={{ left: sidebarCollapsed ? 64 : 240, transition: "left 0.3s" }}
      >
        {/* Search */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--muted))]/50 text-[rgb(var(--muted-foreground))] text-sm hover:bg-[rgb(var(--muted))] transition-colors min-w-64"
        >
          <Search className="w-4 h-4" />
          <span>Search documents, repos...</span>
          <div className="ml-auto flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-xs rounded bg-[rgb(var(--border))] font-mono">⌘K</kbd>
          </div>
        </button>

        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-4 h-4" />
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-[10px]"
                >
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                Notifications
                <Badge variant="accent" className="text-xs">3 new</Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {[
                { title: "New document uploaded", desc: "Q4 Report.pdf in Finance Repo", time: "2m ago" },
                { title: "Signature request", desc: "Please sign Contract_2024.pdf", time: "1h ago" },
                { title: "Workflow completed", desc: "Document approval flow done", time: "3h ago" },
              ].map((notif, i) => (
                <DropdownMenuItem key={i} className="flex flex-col items-start gap-1 py-3">
                  <span className="font-medium text-sm">{notif.title}</span>
                  <span className="text-xs text-[rgb(var(--muted-foreground))]">{notif.desc}</span>
                  <span className="text-xs text-[rgb(var(--muted-foreground))]">{notif.time}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center justify-center text-[rgb(var(--accent))] text-sm">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-[rgb(var(--muted))] transition-colors">
                <Avatar className="w-7 h-7">
                  <AvatarImage src={user?.image ?? undefined} />
                  <AvatarFallback className="text-xs bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                    {getInitials(user?.name ?? user?.email ?? "U")}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium leading-none">{user?.name ?? "User"}</p>
                  <p className="text-xs text-[rgb(var(--muted-foreground))] mt-0.5">{user?.email}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[rgb(var(--muted-foreground))]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>
                <div>
                  <p className="font-semibold">{user?.name ?? "User"}</p>
                  <p className="text-xs text-[rgb(var(--muted-foreground))] font-normal">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="w-4 h-4 mr-2" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-500 focus:text-red-500"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="w-4 h-4 mr-2" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <CommandPalette />
    </>
  )
}
