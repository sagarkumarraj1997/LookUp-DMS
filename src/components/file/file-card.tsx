"use client"

import { motion } from "framer-motion"
import { ExternalLink, MoreVertical, Download, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FileIcon } from "@/components/file/file-icon"
import { formatBytes, formatDate, truncate } from "@/lib/utils"
import type { Document } from "@/types"

interface FileCardProps {
  document: Document
  index?: number
}

export function FileCard({ document: doc, index = 0 }: FileCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="group hover:shadow-md transition-all duration-200 hover:border-[rgb(var(--accent))]/50 cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[rgb(var(--muted))] flex items-center justify-center">
              <FileIcon mimeType={doc.mimeType} extension={doc.extension ?? undefined} className="w-5 h-5" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <a href={doc.driveWebViewLink ?? "#"} target="_blank" rel="noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />Open in Drive
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href={doc.driveDownloadLink ?? "#"} target="_blank" rel="noreferrer">
                    <Download className="w-4 h-4 mr-2" />Download
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-500 focus:text-red-500">
                  <Trash2 className="w-4 h-4 mr-2" />Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-sm font-medium line-clamp-2 mb-2">{truncate(doc.name, 40)}</p>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-[10px] px-1.5 h-4">
              {doc.extension?.toUpperCase() ?? "FILE"}
            </Badge>
            <span className="text-xs text-[rgb(var(--muted-foreground))]">
              {formatBytes(Number(doc.fileSize))}
            </span>
          </div>
          <p className="text-[10px] text-[rgb(var(--muted-foreground))] mt-2">
            {formatDate(doc.updatedAt)}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
