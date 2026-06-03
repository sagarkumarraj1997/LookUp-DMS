"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import {
  Settings, Building2, Shield, HardDrive, Bell, Globe, Trash2, AlertTriangle, Webhook, Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

const SECTIONS = [
  { id: "general", label: "General", icon: Building2 },
  { id: "security", label: "Security", icon: Shield },
  { id: "storage", label: "Storage", icon: HardDrive },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "integrations", label: "Integrations", icon: Webhook },
  { id: "danger", label: "Danger Zone", icon: Trash2 },
]

export default function SettingsPage() {
  const { data: session } = useSession()
  const [activeSection, setActiveSection] = useState("general")
  const [mfaPolicy, setMfaPolicy] = useState("optional")
  const [sessionTimeout, setSessionTimeout] = useState("8")
  const [notifications, setNotifications] = useState({
    fileShared: true, signatureRequest: true, approvals: true, systemAlerts: true,
  })
  const { toast } = useToast()

  const save = () => toast({ title: "Settings saved" })

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-7 h-7 text-slate-600" /> Organization Settings
        </h1>
        <p className="text-slate-500 text-sm mt-1">Manage your organization configuration</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar nav */}
        <div className="w-48 shrink-0 space-y-1">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all text-left",
                activeSection === id ? "bg-slate-100 text-slate-900 font-medium" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <Icon className={cn("w-4 h-4", id === "danger" ? "text-red-500" : "")} />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          {activeSection === "general" && (
            <Card className="border-0 shadow-sm">
              <CardHeader><CardTitle className="text-sm">General Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Organization Name</Label>
                    <Input defaultValue="My Organization" className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Slug</Label>
                    <Input defaultValue="my-org" className="mt-1.5" />
                  </div>
                </div>
                <div>
                  <Label>Custom Domain</Label>
                  <Input defaultValue="" placeholder="docs.mycompany.com" className="mt-1.5" />
                </div>
                <div>
                  <Label>Logo</Label>
                  <div className="mt-1.5 flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-white font-bold text-xl">
                      L
                    </div>
                    <Button variant="outline" size="sm">Change Logo</Button>
                  </div>
                </div>
                <Button onClick={save} className="bg-cyan-500 hover:bg-cyan-600">Save Changes</Button>
              </CardContent>
            </Card>
          )}

          {activeSection === "security" && (
            <Card className="border-0 shadow-sm">
              <CardHeader><CardTitle className="text-sm">Security Settings</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <Label>MFA Policy</Label>
                  <Select value={mfaPolicy} onValueChange={setMfaPolicy}>
                    <SelectTrigger className="mt-1.5 w-64"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disabled">Disabled</SelectItem>
                      <SelectItem value="optional">Optional</SelectItem>
                      <SelectItem value="required">Required for all users</SelectItem>
                      <SelectItem value="admin-only">Required for admins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Session Timeout (hours)</Label>
                  <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                    <SelectTrigger className="mt-1.5 w-64"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hour</SelectItem>
                      <SelectItem value="8">8 hours</SelectItem>
                      <SelectItem value="24">24 hours</SelectItem>
                      <SelectItem value="168">1 week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>IP Restrictions</Label>
                  <p className="text-xs text-slate-400 mb-2">Comma-separated IP ranges (CIDR notation)</p>
                  <Input placeholder="192.168.0.0/24, 10.0.0.0/8" className="mt-1.5" />
                </div>
                <Button onClick={save} className="bg-cyan-500 hover:bg-cyan-600">Save Security Settings</Button>
              </CardContent>
            </Card>
          )}

          {activeSection === "storage" && (
            <Card className="border-0 shadow-sm">
              <CardHeader><CardTitle className="text-sm">Storage Configuration</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <HardDrive className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-slate-800">Google Drive</p>
                      <p className="text-xs text-slate-500">Connected · 15.2 GB / 100 GB used</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200" variant="outline">
                    <Check className="w-3 h-3 mr-1" /> Connected
                  </Badge>
                </div>
                <div>
                  <Label>Storage Usage</Label>
                  <div className="mt-2 bg-slate-100 rounded-full h-2">
                    <div className="bg-cyan-500 h-2 rounded-full" style={{ width: "15.2%" }} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">15.2 GB of 100 GB used</p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "notifications" && (
            <Card className="border-0 shadow-sm">
              <CardHeader><CardTitle className="text-sm">Notification Preferences</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {Object.entries({
                  fileShared: "File shared with you",
                  signatureRequest: "Signature requests",
                  approvals: "Approval requests",
                  systemAlerts: "System alerts",
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{label}</p>
                      <p className="text-xs text-slate-400">Email and in-app notifications</p>
                    </div>
                    <Switch
                      checked={notifications[key as keyof typeof notifications]}
                      onCheckedChange={(v) => setNotifications({ ...notifications, [key]: v })}
                    />
                  </div>
                ))}
                <Button onClick={save} className="bg-cyan-500 hover:bg-cyan-600">Save Preferences</Button>
              </CardContent>
            </Card>
          )}

          {activeSection === "integrations" && (
            <Card className="border-0 shadow-sm">
              <CardHeader><CardTitle className="text-sm">Webhooks & Integrations</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Webhook URL</Label>
                  <Input placeholder="https://hooks.your-app.com/webhook" className="mt-1.5" />
                  <p className="text-xs text-slate-400 mt-1">Receive POST events for document actions</p>
                </div>
                <div>
                  <Label>Events to send</Label>
                  <div className="mt-2 space-y-2">
                    {["document.uploaded", "document.deleted", "signature.completed", "workflow.completed"].map((e) => (
                      <div key={e} className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">{e}</code>
                      </div>
                    ))}
                  </div>
                </div>
                <Button onClick={save} className="bg-cyan-500 hover:bg-cyan-600">Save Webhook</Button>
              </CardContent>
            </Card>
          )}

          {activeSection === "danger" && (
            <Card className="border border-red-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm text-red-600 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-red-100 rounded-lg">
                  <div>
                    <p className="font-medium text-sm text-slate-800">Export Organization Data</p>
                    <p className="text-xs text-slate-500">Download all your data as a ZIP archive</p>
                  </div>
                  <Button variant="outline" size="sm">Export Data</Button>
                </div>
                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                  <div>
                    <p className="font-medium text-sm text-red-800">Delete Organization</p>
                    <p className="text-xs text-red-600">This will permanently delete all data and cannot be undone</p>
                  </div>
                  <Button variant="destructive" size="sm">Delete Organization</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  )
}
