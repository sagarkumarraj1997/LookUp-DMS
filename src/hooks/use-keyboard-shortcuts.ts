"use client"

import { useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"

type ShortcutHandler = () => void

interface ShortcutMap {
  [key: string]: ShortcutHandler
}

let globalShortcuts: ShortcutMap = {}

export function registerShortcut(key: string, handler: ShortcutHandler) {
  globalShortcuts[key] = handler
}

export function unregisterShortcut(key: string) {
  delete globalShortcuts[key]
}

export function useKeyboardShortcuts(options?: { onShowHelp?: () => void; onCommandPalette?: () => void }) {
  const router = useRouter()

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey
      const key = e.key.toLowerCase()

      // Don't fire shortcuts when typing in inputs
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.contentEditable === "true") {
        // Still allow Escape
        if (key !== "escape") return
      }

      // Cmd/Ctrl+K → Command Palette
      if (meta && key === "k") {
        e.preventDefault()
        options?.onCommandPalette?.()
        return
      }

      // Cmd/Ctrl+U → Upload
      if (meta && key === "u") {
        e.preventDefault()
        router.push("/documents/upload")
        return
      }

      // Cmd/Ctrl+N → New note
      if (meta && key === "n") {
        e.preventDefault()
        router.push("/notes/new")
        return
      }

      // Cmd/Ctrl+F → Focus search
      if (meta && key === "f") {
        e.preventDefault()
        const searchInput = document.querySelector<HTMLInputElement>("[data-search-input]")
        searchInput?.focus()
        return
      }

      // ? → Show help
      if (key === "?" && !meta) {
        e.preventDefault()
        options?.onShowHelp?.()
        return
      }

      // G+D → Go to dashboard
      if (!meta && key === "g") {
        const onD = (e2: KeyboardEvent) => {
          if (e2.key.toLowerCase() === "d") {
            router.push("/dashboard")
          } else if (e2.key.toLowerCase() === "r") {
            router.push("/repositories")
          } else if (e2.key.toLowerCase() === "s") {
            router.push("/signatures")
          } else if (e2.key.toLowerCase() === "n") {
            router.push("/notes")
          } else if (e2.key.toLowerCase() === "a") {
            router.push("/analytics")
          }
          window.removeEventListener("keydown", onD)
        }
        window.addEventListener("keydown", onD)
        setTimeout(() => window.removeEventListener("keydown", onD), 1000)
        return
      }

      // Check registered shortcuts
      const shortcutKey = `${meta ? "mod+" : ""}${key}`
      if (globalShortcuts[shortcutKey]) {
        e.preventDefault()
        globalShortcuts[shortcutKey]()
      }
    },
    [router, options]
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])
}

export const SHORTCUTS = [
  { category: "Navigation", shortcuts: [
    { keys: ["G", "D"], description: "Go to Dashboard" },
    { keys: ["G", "R"], description: "Go to Repositories" },
    { keys: ["G", "S"], description: "Go to Signatures" },
    { keys: ["G", "N"], description: "Go to Notes" },
    { keys: ["G", "A"], description: "Go to Analytics" },
  ]},
  { category: "Actions", shortcuts: [
    { keys: ["⌘", "K"], description: "Open command palette" },
    { keys: ["⌘", "U"], description: "Upload file" },
    { keys: ["⌘", "N"], description: "New note" },
    { keys: ["⌘", "F"], description: "Focus search" },
  ]},
  { category: "Help", shortcuts: [
    { keys: ["?"], description: "Show keyboard shortcuts" },
    { keys: ["Esc"], description: "Close modal / Cancel" },
  ]},
]
