"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Copy, Check, Link2, Lock, Calendar, Eye, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface ShareDialogProps {
  documentId: string
  documentName: string
  isOpen: boolean
  onClose: () => void
}

export function ShareDialog({ documentId, documentName, isOpen, onClose }: ShareDialogProps) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const [shareLink, setShareLink] = useState("")
  const [settings, setSettings] = useState({
    expiresAt: "",
    password: "",
    allowDownload: true,
    allowView: true,
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, ...settings }),
      })
      if (!res.ok) throw new Error("Failed to create link")
      return res.json()
    },
    onSuccess: (data) => setShareLink(data.url),
    onError: () => toast({ title: "Failed to create link", variant: "destructive" }),
  })

  const copy = () => {
    if (!shareLink) return
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    toast({ title: "Link copied to clipboard" })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-cyan-500" /> Share Document
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm text-slate-500 truncate">{documentName}</p>

          {/* Link input */}
          {shareLink ? (
            <div className="flex gap-2">
              <Input value={shareLink} readOnly className="flex-1 text-xs font-mono" />
              <Button variant="outline" size="icon" onClick={copy}>
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          ) : (
            <Button
              className="w-full bg-cyan-500 hover:bg-cyan-600"
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
            >
              <Link2 className="w-4 h-4 mr-2" />
              {createMutation.isPending ? "Creating..." : "Create Share Link"}
            </Button>
          )}

          <div className="border-t border-slate-100 pt-4 space-y-3">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Settings</p>

            {/* Expiry */}
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="flex-1">
                <Label className="text-sm">Expires</Label>
                <Input
                  type="date"
                  value={settings.expiresAt}
                  onChange={(e) => setSettings({ ...settings, expiresAt: e.target.value })}
                  className="mt-1 h-8 text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex items-center gap-3">
              <Lock className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="flex-1">
                <Label className="text-sm">Password protection</Label>
                <Input
                  type="password"
                  placeholder="Leave empty for no password"
                  value={settings.password}
                  onChange={(e) => setSettings({ ...settings, password: e.target.value })}
                  className="mt-1 h-8 text-sm"
                />
              </div>
            </div>

            {/* Permissions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-slate-400" />
                  <Label className="text-sm cursor-pointer">Allow viewing</Label>
                </div>
                <Switch
                  checked={settings.allowView}
                  onCheckedChange={(v) => setSettings({ ...settings, allowView: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-slate-400" />
                  <Label className="text-sm cursor-pointer">Allow download</Label>
                </div>
                <Switch
                  checked={settings.allowDownload}
                  onCheckedChange={(v) => setSettings({ ...settings, allowDownload: v })}
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
