"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { User, Lock, Smartphone, Monitor, Bell, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

export default function ProfileSettingsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [name, setName] = useState(session?.user?.name ?? "")
  const [email, setEmail] = useState(session?.user?.email ?? "")
  const [mfaEnabled, setMfaEnabled] = useState(false)

  const save = () => toast({ title: "Profile updated" })

  const ACTIVE_SESSIONS = [
    { device: "Chrome on MacOS", location: "San Francisco, CA", lastActive: "Current session", isCurrent: true },
    { device: "Safari on iPhone", location: "New York, NY", lastActive: "2 hours ago", isCurrent: false },
    { device: "Firefox on Windows", location: "London, UK", lastActive: "3 days ago", isCurrent: false },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <User className="w-7 h-7 text-slate-600" /> Profile Settings
        </h1>
      </div>

      {/* Avatar */}
      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-sm">Profile Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-5">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage src={session?.user?.image ?? undefined} />
                <AvatarFallback className="text-xl bg-gradient-to-br from-cyan-400 to-violet-500 text-white">
                  {session?.user?.name?.[0] ?? "U"}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 w-7 h-7 bg-cyan-500 rounded-full flex items-center justify-center hover:bg-cyan-600 transition-colors">
                <Camera className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
            <div>
              <p className="font-semibold text-slate-800">{session?.user?.name}</p>
              <p className="text-sm text-slate-500">{session?.user?.email}</p>
              <Button variant="outline" size="sm" className="mt-2 text-xs">Change Avatar</Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Full Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="mt-1.5" />
            </div>
          </div>
          <Button onClick={save} className="bg-cyan-500 hover:bg-cyan-600">Save Profile</Button>
        </CardContent>
      </Card>

      {/* Password */}
      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Lock className="w-4 h-4" /> Change Password</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Current Password</Label>
            <Input type="password" className="mt-1.5" />
          </div>
          <div>
            <Label>New Password</Label>
            <Input type="password" className="mt-1.5" />
          </div>
          <div>
            <Label>Confirm New Password</Label>
            <Input type="password" className="mt-1.5" />
          </div>
          <Button onClick={() => toast({ title: "Password updated" })} variant="outline">Update Password</Button>
        </CardContent>
      </Card>

      {/* MFA */}
      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Smartphone className="w-4 h-4" /> Two-Factor Authentication</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">Enable MFA</p>
              <p className="text-xs text-slate-400">Use an authenticator app for extra security</p>
            </div>
            <Switch checked={mfaEnabled} onCheckedChange={setMfaEnabled} />
          </div>
          {mfaEnabled && (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center space-y-2">
              <p className="text-sm text-slate-600">Scan this QR code with your authenticator app</p>
              <div className="w-32 h-32 bg-white border border-slate-200 rounded mx-auto flex items-center justify-center text-slate-300 text-xs">
                [QR Code]
              </div>
              <Input placeholder="Enter 6-digit code" className="max-w-xs mx-auto text-center" />
              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600">Verify & Enable</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sessions */}
      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Monitor className="w-4 h-4" /> Active Sessions</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {ACTIVE_SESSIONS.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-slate-700">{s.device}</p>
                  {s.isCurrent && <Badge className="text-xs bg-emerald-100 text-emerald-700 border-emerald-200" variant="outline">Current</Badge>}
                </div>
                <p className="text-xs text-slate-400">{s.location} · {s.lastActive}</p>
              </div>
              {!s.isCurrent && (
                <Button variant="ghost" size="sm" className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50">
                  Revoke
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  )
}
