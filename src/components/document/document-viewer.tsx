"use client"

import { useState } from "react"
import { Download, Share2, Maximize2, MessageSquare, X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CommentPanel } from "./comment-panel"
import { ShareDialog } from "./share-dialog"
import { cn } from "@/lib/utils"

interface Document {
  id: string
  name: string
  mimeType: string
  driveWebViewLink?: string | null
  driveDownloadLink?: string | null
}

interface DocumentViewerProps {
  document: Document
}

const PDF_MIME = "application/pdf"
const IMAGE_MIMES = ["image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml"]
const VIDEO_MIMES = ["video/mp4", "video/webm", "video/ogg"]
const OFFICE_MIMES = [
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/msword",
  "application/vnd.ms-excel",
  "application/vnd.google-apps.document",
  "application/vnd.google-apps.spreadsheet",
  "application/vnd.google-apps.presentation",
]

export function DocumentViewer({ document }: DocumentViewerProps) {
  const [showComments, setShowComments] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [imageZoom, setImageZoom] = useState(1)

  const isPDF = document.mimeType === PDF_MIME
  const isImage = IMAGE_MIMES.includes(document.mimeType)
  const isVideo = VIDEO_MIMES.includes(document.mimeType)
  const isOffice = OFFICE_MIMES.includes(document.mimeType) || document.mimeType.includes("google-apps")
  const hasViewLink = !!document.driveWebViewLink

  return (
    <div className={cn("flex flex-col h-full", isFullscreen ? "fixed inset-0 z-50 bg-white" : "")}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2">
          {isImage && (
            <>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setImageZoom((z) => Math.min(z + 0.25, 3))}>
                <ZoomIn className="w-4 h-4" />
              </Button>
              <span className="text-xs text-slate-500">{Math.round(imageZoom * 100)}%</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setImageZoom((z) => Math.max(z - 0.25, 0.25))}>
                <ZoomOut className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageSquare className={cn("w-4 h-4", showComments ? "text-cyan-500" : "text-slate-400")} />
          </Button>
          {document.driveDownloadLink && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => window.open(document.driveDownloadLink!, "_blank")}
            >
              <Download className="w-4 h-4 text-slate-400" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowShare(true)}
          >
            <Share2 className="w-4 h-4 text-slate-400" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <X className="w-4 h-4" /> : <Maximize2 className="w-4 h-4 text-slate-400" />}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Document content */}
        <div className="flex-1 overflow-auto bg-slate-100 flex items-center justify-center p-4">
          {isImage && document.driveWebViewLink ? (
            <div className="overflow-auto max-w-full max-h-full" style={{ transform: `scale(${imageZoom})`, transformOrigin: "center top" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={document.driveWebViewLink}
                alt={document.name}
                className="max-w-full rounded shadow-lg"
              />
            </div>
          ) : isVideo && document.driveWebViewLink ? (
            <video
              controls
              className="max-w-full max-h-full rounded shadow-lg"
              src={document.driveWebViewLink}
            >
              Your browser does not support the video tag.
            </video>
          ) : hasViewLink ? (
            <iframe
              src={document.driveWebViewLink!}
              className="w-full h-full bg-white rounded shadow-sm border border-slate-200"
              title={document.name}
              allow="fullscreen"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-200 flex items-center justify-center mb-4">
                <Download className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium">{document.name}</p>
              <p className="text-slate-400 text-sm mt-1">Preview not available for this file type</p>
              {document.driveDownloadLink && (
                <Button
                  className="mt-4 bg-cyan-500 hover:bg-cyan-600"
                  onClick={() => window.open(document.driveDownloadLink!, "_blank")}
                >
                  <Download className="w-4 h-4 mr-2" /> Download File
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Comments panel */}
        {showComments && (
          <div className="w-80 shrink-0 flex flex-col border-l border-slate-200">
            <CommentPanel documentId={document.id} />
          </div>
        )}
      </div>

      {showShare && (
        <ShareDialog
          documentId={document.id}
          documentName={document.name}
          isOpen={showShare}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  )
}
