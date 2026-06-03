"use client"

import { useAppStore } from "@/store/use-app-store"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Breadcrumb } from "@/components/layout/breadcrumb"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { sidebarCollapsed } = useAppStore()

  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      <Sidebar />
      <Header />
      <main
        className="pt-16 transition-all duration-300 ease-in-out"
        style={{ marginLeft: sidebarCollapsed ? 64 : 240 }}
      >
        <div className="p-6 max-w-[1600px] mx-auto">
          <Breadcrumb />
          {children}
        </div>
      </main>
    </div>
  )
}
