"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Shield,
  Monitor,
  MapPin,
  Clock,
  LogOut,
  Lock,
  Smartphone,
  Eye,
  Download,
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
} from "lucide-react"

interface Session {
  id: string
  device: string
  ip: string
  location: string
  lastActive: string
  current: boolean
}

interface LoginAttempt {
  id: string
  email: string
  ip: string
  location: string
  timestamp: string
  success: boolean
}

const mockSessions: Session[] = [
  { id: "1", device: "Chrome on macOS", ip: "192.168.1.1", location: "New York, US", lastActive: "Just now", current: true },
  { id: "2", device: "Safari on iPhone", ip: "10.0.0.1", location: "New York, US", lastActive: "2 hours ago", current: false },
  { id: "3", device: "Firefox on Windows", ip: "172.16.0.1", location: "Los Angeles, US", lastActive: "Yesterday", current: false },
]

const mockAttempts: LoginAttempt[] = [
  { id: "1", email: "admin@acme.com", ip: "192.168.1.1", location: "New York, US", timestamp: "2024-01-15 14:32", success: true },
  { id: "2", email: "admin@acme.com", ip: "185.234.218.1", location: "Moscow, RU", timestamp: "2024-01-14 08:11", success: false },
  { id: "3", email: "admin@acme.com", ip: "192.168.1.1", location: "New York, US", timestamp: "2024-01-13 17:45", success: true },
]

export default function SecurityPage() {
  const [sessions, setSessions] = useState(mockSessions)
  const [mfaEnabled, setMfaEnabled] = useState(false)
  const [ipAllowlist, setIpAllowlist] = useState<string[]>(["192.168.1.0/24"])
  const [newIp, setNewIp] = useState("")
  const [activeTab, setActiveTab] = useState<"sessions" | "mfa" | "ip" | "activity">("sessions")

  const revokeSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id))
  }

  const addIp = () => {
    if (newIp && !ipAllowlist.includes(newIp)) {
      setIpAllowlist(prev => [...prev, newIp])
      setNewIp("")
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Shield className="w-6 h-6 text-cyan-400" />
          Security
        </h1>
        <p className="text-slate-400">Manage your account security settings and active sessions.</p>
      </div>

      {/* Security Score */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-xl p-6 mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white font-semibold mb-1">Security Score</h2>
            <p className="text-slate-400 text-sm">Improve your score by enabling all security features</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-cyan-400">{mfaEnabled ? "85" : "60"}</div>
            <div className="text-slate-400 text-sm">/ 100</div>
          </div>
        </div>
        <div className="mt-4 bg-slate-700/50 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-cyan-500 to-purple-600 h-2 rounded-full transition-all"
            style={{ width: mfaEnabled ? "85%" : "60%" }}
          />
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/50 rounded-xl p-1 mb-6 border border-slate-700">
        {[
          { key: "sessions", label: "Active Sessions", icon: Monitor },
          { key: "mfa", label: "MFA", icon: Smartphone },
          { key: "ip", label: "IP Allowlist", icon: MapPin },
          { key: "activity", label: "Login History", icon: Eye },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as typeof activeTab)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === key ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {activeTab === "sessions" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Active Sessions</h2>
            <button className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1">
              <LogOut className="w-4 h-4" />
              Revoke all others
            </button>
          </div>
          {sessions.map(s => (
            <div key={s.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <div className="text-white font-medium flex items-center gap-2">
                    {s.device}
                    {s.current && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Current</span>
                    )}
                  </div>
                  <div className="text-slate-400 text-sm flex items-center gap-3">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{s.location}</span>
                    <span>•</span>
                    <span>{s.ip}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.lastActive}</span>
                  </div>
                </div>
              </div>
              {!s.current && (
                <button onClick={() => revokeSession(s.id)} className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1">
                  <LogOut className="w-4 h-4" />
                  Revoke
                </button>
              )}
            </div>
          ))}
        </motion.div>
      )}

      {activeTab === "mfa" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-white font-semibold">Two-Factor Authentication</h2>
                <p className="text-slate-400 text-sm mt-1">Add an extra layer of security to your account</p>
              </div>
              <div className={`w-12 h-6 rounded-full transition-colors cursor-pointer ${mfaEnabled ? "bg-cyan-500" : "bg-slate-600"}`}
                onClick={() => setMfaEnabled(!mfaEnabled)}>
                <div className={`w-5 h-5 bg-white rounded-full m-0.5 transition-transform ${mfaEnabled ? "translate-x-6" : ""}`} />
              </div>
            </div>
            {mfaEnabled ? (
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm">Two-factor authentication is enabled</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Enable 2FA to significantly improve account security</span>
              </div>
            )}
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h2 className="text-white font-semibold mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4" /> Password Strength
            </h2>
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`flex-1 h-2 rounded-full ${i <= 3 ? "bg-green-500" : "bg-slate-600"}`} />
              ))}
            </div>
            <p className="text-green-400 text-sm">Strong password</p>
          </div>
        </motion.div>
      )}

      {activeTab === "ip" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h2 className="text-white font-semibold mb-4">IP Allowlist</h2>
            <p className="text-slate-400 text-sm mb-6">Restrict access to specific IP addresses or CIDR ranges.</p>
            <div className="flex gap-3 mb-4">
              <input
                value={newIp}
                onChange={e => setNewIp(e.target.value)}
                placeholder="e.g. 192.168.1.0/24"
                className="flex-1 bg-slate-700/50 border border-slate-600 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 placeholder-slate-500 text-sm"
              />
              <button onClick={addIp} className="flex items-center gap-2 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 px-4 py-2.5 rounded-xl text-sm transition-colors">
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
            <div className="space-y-2">
              {ipAllowlist.map(ip => (
                <div key={ip} className="flex items-center justify-between py-2 px-3 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-300 text-sm font-mono">{ip}</span>
                  <button onClick={() => setIpAllowlist(prev => prev.filter(i => i !== ip))} className="text-slate-500 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === "activity" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-white font-semibold">Recent Login Attempts</h2>
              <button className="text-sm text-slate-400 hover:text-white flex items-center gap-1">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Status</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">IP Address</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Location</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Time</th>
                </tr>
              </thead>
              <tbody>
                {mockAttempts.map(a => (
                  <tr key={a.id} className="border-b border-slate-700/50 last:border-0">
                    <td className="px-6 py-4">
                      {a.success ? (
                        <span className="flex items-center gap-1.5 text-green-400 text-sm"><CheckCircle2 className="w-4 h-4" />Success</span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-red-400 text-sm"><AlertCircle className="w-4 h-4" />Failed</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-300 font-mono text-sm">{a.ip}</td>
                    <td className="px-6 py-4 text-slate-400 text-sm">{a.location}</td>
                    <td className="px-6 py-4 text-slate-400 text-sm">{a.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  )
}
