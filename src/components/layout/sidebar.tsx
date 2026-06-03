"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard, FolderOpen, FileText, StickyNote, PenTool,
  GitBranch, FileSignature, BarChart3, Settings, ChevronLeft,
  ChevronRight, ChevronDown, Building2, Users, HelpCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/store/use-app-store"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Repositories",
    href: "/repositories",
    icon: FolderOpen,
  },
  {
    label: "Documents",
    href: "/documents",
    icon: FileText,
  },
  {
    label: "Collaboration",
    icon: Users,
    children: [
      { label: "Notes", href: "/notes", icon: StickyNote },
      { label: "Whiteboard", href: "/whiteboard", icon: PenTool },
    ],
  },
  {
    label: "Signatures",
    href: "/signatures",
    icon: FileSignature,
    badge: 3,
  },
  {
    label: "Workflows",
    href: "/workflows",
    icon: GitBranch,
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
]

const bottomItems = [
  { label: "Organization", href: "/organization", icon: Building2 },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Help & Support", href: "/help", icon: HelpCircle },
]

interface NavItemProps {
  item: typeof navItems[0]
  collapsed: boolean
  depth?: number
}

function NavItem({ item, collapsed, depth = 0 }: NavItemProps) {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(true)
  const hasChildren = "children" in item && item.children && item.children.length > 0
  const isActive = "href" in item ? pathname === item.href || pathname.startsWith(item.href + "/") : false
  const isChildActive = hasChildren && item.children!.some(
    (child) => pathname === child.href || pathname.startsWith(child.href + "/")
  )

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
            isChildActive
              ? "text-[rgb(var(--accent))]"
              : "text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]"
          )}
        >
          <item.icon className="w-4 h-4 shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              <ChevronDown
                className={cn("w-3.5 h-3.5 transition-transform", expanded && "rotate-180")}
              />
            </>
          )}
        </button>
        <AnimatePresence>
          {expanded && !collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="ml-4 mt-1 space-y-0.5 border-l border-[rgb(var(--border))] pl-3">
                {item.children!.map((child) => (
                  <NavItem key={child.href} item={child as typeof navItems[0]} collapsed={collapsed} depth={1} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  const href = (item as { href: string }).href
  const badge = (item as { badge?: number }).badge

  return (
    <Link href={href}>
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 relative",
          isActive
            ? "bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))]"
            : "text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]"
        )}
      >
        {isActive && (
          <motion.div
            layoutId="activeNav"
            className="absolute inset-0 rounded-lg bg-[rgb(var(--accent))]/10"
            transition={{ type: "spring", duration: 0.3 }}
          />
        )}
        <item.icon className="w-4 h-4 shrink-0 relative z-10" />
        {!collapsed && (
          <>
            <span className="flex-1 relative z-10">{item.label}</span>
            {badge && (
              <Badge variant="accent" className="text-xs px-1.5 py-0 h-5 relative z-10">
                {badge}
              </Badge>
            )}
          </>
        )}
      </div>
    </Link>
  )
}

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore()

  return (
    <motion.aside
      className="fixed left-0 top-0 h-full z-30 flex flex-col bg-[rgb(var(--card))] border-r border-[rgb(var(--border))]"
      animate={{ width: sidebarCollapsed ? 64 : 240 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-4 h-16 border-b border-[rgb(var(--border))] shrink-0",
        sidebarCollapsed && "justify-center px-0"
      )}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 text-white" />
        </div>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col"
          >
            <span className="font-bold text-sm leading-tight">LookUp DMS</span>
            <span className="text-[10px] text-[rgb(var(--muted-foreground))]">Enterprise Edition</span>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-0.5">
          {navItems.map((item) => (
            <NavItem
              key={item.label}
              item={item as typeof navItems[0]}
              collapsed={sidebarCollapsed}
            />
          ))}
        </nav>

        <div className="my-4 border-t border-[rgb(var(--border))]" />

        <nav className="space-y-0.5">
          {bottomItems.map((item) => (
            <NavItem
              key={item.label}
              item={item as typeof navItems[0]}
              collapsed={sidebarCollapsed}
            />
          ))}
        </nav>
      </ScrollArea>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-[rgb(var(--border))]">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center p-2 rounded-lg text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </motion.aside>
  )
}
