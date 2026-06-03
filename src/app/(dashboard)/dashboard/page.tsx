"use client"

import { motion } from "framer-motion"
import { useSession } from "next-auth/react"
import {
  FileText, HardDrive, Users, Clock, ArrowRight, Sparkles
} from "lucide-react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { StorageChart, RepositoryDistributionChart } from "@/components/dashboard/storage-chart"
import { RepositoryHealth } from "@/components/dashboard/repository-health"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatBytes } from "@/lib/utils"
import Link from "next/link"

const stats = [
  {
    title: "Total Documents",
    value: "2,847",
    description: "Across all repositories",
    trend: 12,
    icon: FileText,
    iconColor: "text-[rgb(var(--accent))]",
    iconBg: "bg-[rgb(var(--accent))]/10",
  },
  {
    title: "Storage Used",
    value: "48.2 GB",
    description: "Of 100 GB allocated",
    trend: 8,
    icon: HardDrive,
    iconColor: "text-[rgb(var(--highlight))]",
    iconBg: "bg-[rgb(var(--highlight))]/10",
  },
  {
    title: "Active Users",
    value: "127",
    description: "Team members with access",
    trend: 5,
    icon: Users,
    iconColor: "text-green-500",
    iconBg: "bg-green-500/10",
  },
  {
    title: "Pending Approvals",
    value: "14",
    description: "Awaiting your review",
    trend: -3,
    icon: Clock,
    iconColor: "text-orange-500",
    iconBg: "bg-orange-500/10",
  },
]

export default function DashboardPage() {
  const { data: session } = useSession()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-6 text-white"
        style={{
          background: "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0C4A6E 100%)",
        }}
      >
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-5"
              style={{
                width: `${200 + i * 100}px`,
                height: `${200 + i * 100}px`,
                background: "rgb(6, 182, 212)",
                top: `${-50 + i * 20}%`,
                right: `${-5 + i * 3}%`,
              }}
            />
          ))}
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-blue-300 text-sm font-medium mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
            <h1 className="text-2xl font-bold mb-1">
              {greeting}, {session?.user?.name?.split(" ")[0] ?? "there"} 👋
            </h1>
            <p className="text-blue-200 text-sm">
              You have <strong className="text-white">14 pending approvals</strong> and{" "}
              <strong className="text-white">3 signature requests</strong> awaiting your attention.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Button asChild variant="accent" size="sm">
              <Link href="/signatures">
                Review Requests <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <StatsCard key={stat.title} {...stat} index={idx} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Charts - 2/3 width */}
        <div className="xl:col-span-2 space-y-6">
          <StorageChart />
          <RepositoryDistributionChart />
        </div>

        {/* Right column - 1/3 width */}
        <div className="space-y-6">
          <QuickActions />
          <RepositoryHealth />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RecentActivity />

        {/* Workflow Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <div className="p-6 border-b border-[rgb(var(--border))] flex items-center justify-between">
              <h3 className="font-semibold">Active Workflows</h3>
              <Badge variant="accent">5 Running</Badge>
            </div>
            <CardContent className="p-4 space-y-3">
              {[
                { name: "Document Approval Flow", status: "In Progress", step: "Manager Review", progress: 60 },
                { name: "Onboarding Checklist", status: "Waiting", step: "HR Signature", progress: 40 },
                { name: "Contract Review", status: "In Progress", step: "Legal Check", progress: 80 },
              ].map((workflow, i) => (
                <div key={i} className="p-3 rounded-lg bg-[rgb(var(--muted))]/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{workflow.name}</span>
                    <Badge
                      variant={workflow.status === "In Progress" ? "accent" : "outline"}
                      className="text-xs"
                    >
                      {workflow.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-[rgb(var(--muted-foreground))]">Current: {workflow.step}</p>
                  <div className="w-full h-1.5 bg-[rgb(var(--border))] rounded-full">
                    <div
                      className="h-full bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--highlight))] rounded-full transition-all"
                      style={{ width: `${workflow.progress}%` }}
                    />
                  </div>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="w-full" asChild>
                <Link href="/workflows">
                  View all workflows <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
