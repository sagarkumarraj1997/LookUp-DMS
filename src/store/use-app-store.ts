import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AppState {
  sidebarCollapsed: boolean
  theme: "light" | "dark" | "system"
  currentOrgId: string | null
  commandPaletteOpen: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  setTheme: (theme: "light" | "dark" | "system") => void
  setCurrentOrgId: (orgId: string | null) => void
  setCommandPaletteOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      theme: "light",
      currentOrgId: null,
      commandPaletteOpen: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setTheme: (theme) => set({ theme }),
      setCurrentOrgId: (orgId) => set({ currentOrgId: orgId }),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
    }),
    { name: "lookup-dms-app-store" }
  )
)
