"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { FolderOpen, FileText, Users, Calendar, MoreVertical, Archive, Edit, Trash2, ExternalLink } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDate } from "@/lib/utils"
import type { Repository } from "@/types"

interface RepositoryCardProps {
  repository: Repository & { _count?: { documents: number; folders: number } }
  index?: number
  onDelete?: (id: string) => void
  onArchive?: (id: string) => void
}

export function RepositoryCard({ repository, index = 0, onDelete, onArchive }: RepositoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
    >
      <Card className="group hover:shadow-md transition-all duration-200 hover:border-[rgb(var(--accent))]/50">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[rgb(var(--accent))]/20 to-[rgb(var(--highlight))]/20 border border-[rgb(var(--accent))]/20 flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-[rgb(var(--accent))]" />
              </div>
              <div>
                <Link href={`/repositories/${repository.id}`}>
                  <h3 className="font-semibold text-sm hover:text-[rgb(var(--accent))] transition-colors line-clamp-1">
                    {repository.name}
                  </h3>
                </Link>
                {repository.isPublic && (
                  <Badge variant="accent" className="text-[10px] px-1.5 py-0 h-4 mt-0.5">Public</Badge>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/repositories/${repository.id}`}>
                    <ExternalLink className="w-4 h-4 mr-2" />Open
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/repositories/${repository.id}/settings`}>
                    <Edit className="w-4 h-4 mr-2" />Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onArchive?.(repository.id)}>
                  <Archive className="w-4 h-4 mr-2" />Archive
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-500 focus:text-red-500"
                  onClick={() => onDelete?.(repository.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {repository.description && (
            <p className="text-xs text-[rgb(var(--muted-foreground))] mb-4 line-clamp-2">
              {repository.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-[rgb(var(--muted-foreground))]">
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              {repository._count?.documents ?? 0} docs
            </span>
            <span className="flex items-center gap-1">
              <FolderOpen className="w-3.5 h-3.5" />
              {repository._count?.folders ?? 0} folders
            </span>
            <span className="flex items-center gap-1 ml-auto">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(repository.createdAt)}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
