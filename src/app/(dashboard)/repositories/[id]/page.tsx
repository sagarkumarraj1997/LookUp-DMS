"use client"

import { use } from "react"
import { motion } from "framer-motion"
import { FolderOpen, FileText, Users, Settings, Upload, Plus, ArrowLeft, Calendar, Grid, List } from "lucide-react"
import { useRepository } from "@/hooks/use-repositories"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileBrowser } from "@/components/file/file-browser"
import { FileUploader } from "@/components/file/file-uploader"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

export default function RepositoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data: repository, isLoading } = useRepository(id)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  if (!repository) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-[rgb(var(--muted-foreground))]">Repository not found</p>
        <Button variant="outline" asChild className="mt-4">
          <Link href="/repositories">Back to Repositories</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/repositories"><ArrowLeft className="w-4 h-4" /></Link>
          </Button>
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[rgb(var(--accent))]/20 to-[rgb(var(--highlight))]/20 border border-[rgb(var(--accent))]/20 flex items-center justify-center">
            <FolderOpen className="w-6 h-6 text-[rgb(var(--accent))]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{repository.name}</h1>
              {repository.isPublic && <Badge variant="accent">Public</Badge>}
              {repository.isArchived && <Badge variant="outline">Archived</Badge>}
            </div>
            {repository.description && (
              <p className="text-sm text-[rgb(var(--muted-foreground))] mt-0.5">{repository.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Users className="w-4 h-4 mr-2" />Manage Access
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />Settings
          </Button>
          <FileUploader repositoryId={id}>
            <Button variant="accent" size="sm">
              <Upload className="w-4 h-4 mr-2" />Upload
            </Button>
          </FileUploader>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {[
          { label: "Documents", value: (repository as { _count?: { documents: number } })._count?.documents ?? 0, icon: FileText },
          { label: "Folders", value: (repository as { _count?: { folders: number } })._count?.folders ?? 0, icon: FolderOpen },
          { label: "Members", value: "—", icon: Users },
          { label: "Created", value: formatDate(repository.createdAt), icon: Calendar },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[rgb(var(--muted))] flex items-center justify-center">
                <stat.icon className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">{stat.label}</p>
                <p className="font-semibold text-sm">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* File Browser */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs defaultValue="files">
          <TabsList className="mb-4">
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="files">
            <FileBrowser repositoryId={id} />
          </TabsContent>
          <TabsContent value="activity">
            <Card>
              <CardContent className="p-8 text-center text-[rgb(var(--muted-foreground))]">
                Activity log coming soon
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="settings">
            <Card>
              <CardContent className="p-8 text-center text-[rgb(var(--muted-foreground))]">
                Repository settings coming soon
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
