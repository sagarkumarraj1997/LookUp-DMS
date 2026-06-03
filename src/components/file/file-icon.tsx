import { FileText, FileImage, FileVideo, Music, Archive, Table, FileCode, File } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileIconProps {
  mimeType: string
  extension?: string
  className?: string
}

export function FileIcon({ mimeType, extension, className }: FileIconProps) {
  const cls = cn("w-4 h-4", className)

  if (mimeType.includes("pdf")) return <FileText className={cn(cls, "text-red-500")} />
  if (mimeType.includes("word") || extension === "docx" || extension === "doc")
    return <FileText className={cn(cls, "text-blue-500")} />
  if (mimeType.includes("sheet") || extension === "xlsx" || extension === "xls")
    return <Table className={cn(cls, "text-green-500")} />
  if (mimeType.includes("presentation") || extension === "pptx" || extension === "ppt")
    return <FileText className={cn(cls, "text-orange-500")} />
  if (mimeType.includes("image")) return <FileImage className={cn(cls, "text-purple-500")} />
  if (mimeType.includes("video")) return <FileVideo className={cn(cls, "text-pink-500")} />
  if (mimeType.includes("audio")) return <Music className={cn(cls, "text-yellow-500")} />
  if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("archive"))
    return <Archive className={cn(cls, "text-amber-500")} />
  if (mimeType.includes("text/plain") || extension === "txt")
    return <FileText className={cn(cls, "text-[rgb(var(--muted-foreground))]")} />
  if (mimeType.includes("javascript") || mimeType.includes("typescript") || mimeType.includes("json") || mimeType.includes("html"))
    return <FileCode className={cn(cls, "text-[rgb(var(--accent))]")} />

  return <File className={cn(cls, "text-[rgb(var(--muted-foreground))]")} />
}
