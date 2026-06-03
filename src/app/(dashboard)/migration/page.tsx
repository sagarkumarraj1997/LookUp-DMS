"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  CloudIcon,
  FolderOpen,
  Upload,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCcw,
  ChevronRight,
  AlertTriangle,
} from "lucide-react"

type Source = "google-drive" | "dropbox" | "onedrive" | "local"
type JobStatus = "pending" | "running" | "completed" | "failed"

interface MigrationJob {
  id: string
  source: Source
  status: JobStatus
  totalFiles: number
  processedFiles: number
  errors: string[]
  createdAt: string
}

const sourceConfig = {
  "google-drive": { name: "Google Drive", icon: "🔵", color: "from-blue-500 to-blue-600" },
  dropbox: { name: "Dropbox", icon: "💠", color: "from-indigo-500 to-indigo-600" },
  onedrive: { name: "OneDrive", icon: "🔷", color: "from-sky-500 to-sky-600" },
  local: { name: "Local Files", icon: "💻", color: "from-slate-500 to-slate-600" },
}

export default function MigrationPage() {
  const [step, setStep] = useState<"select" | "configure" | "running">("select")
  const [selectedSource, setSelectedSource] = useState<Source | null>(null)
  const [repositoryId, setRepositoryId] = useState("")
  const [jobs, setJobs] = useState<MigrationJob[]>([])
  const [loading, setLoading] = useState(false)

  const handleStart = async () => {
    if (!selectedSource || !repositoryId) return
    setLoading(true)
    try {
      const res = await fetch("/api/migration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: selectedSource, repositoryId }),
      })
      const data = await res.json()
      if (res.ok) {
        setJobs(prev => [data.job, ...prev])
        setStep("running")
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const statusIcon = (status: JobStatus) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="w-5 h-5 text-green-400" />
      case "failed": return <XCircle className="w-5 h-5 text-red-400" />
      case "running": return <RefreshCcw className="w-5 h-5 text-cyan-400 animate-spin" />
      default: return <Clock className="w-5 h-5 text-slate-400" />
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Content Migration</h1>
        <p className="text-slate-400">Import files from external storage services into LookUp DMS.</p>
      </div>

      {step === "select" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-lg font-semibold text-white mb-4">Select a source</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {(Object.entries(sourceConfig) as [Source, typeof sourceConfig[Source]][]).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setSelectedSource(key)}
                className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${
                  selectedSource === key
                    ? "border-cyan-500 bg-cyan-500/10"
                    : "border-slate-700 bg-slate-800/50 hover:border-slate-500"
                }`}
              >
                <span className="text-4xl">{cfg.icon}</span>
                <span className="text-white font-medium text-sm">{cfg.name}</span>
              </button>
            ))}
          </div>
          {selectedSource && (
            <button
              onClick={() => setStep("configure")}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:opacity-90"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      )}

      {step === "configure" && selectedSource && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Configure {sourceConfig[selectedSource].name} Migration
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Target Repository ID</label>
                <input
                  value={repositoryId}
                  onChange={e => setRepositoryId(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  placeholder="Enter repository ID"
                />
              </div>
              <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-amber-300 text-sm">
                  Large migrations may take several hours. You can close this page — the job will continue in the background.
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setStep("select")}
              className="px-6 py-3 rounded-xl bg-slate-700 text-white hover:bg-slate-600 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleStart}
              disabled={!repositoryId || loading}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {loading ? "Starting..." : "Start Migration"}
            </button>
          </div>
        </motion.div>
      )}

      {jobs.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-white mb-4">Migration Jobs</h2>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Source</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Status</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Progress</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Started</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => (
                  <tr key={job.id} className="border-b border-slate-700/50 last:border-0">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{sourceConfig[job.source]?.icon}</span>
                        <span className="text-white">{sourceConfig[job.source]?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {statusIcon(job.status)}
                        <span className="text-slate-300 capitalize">{job.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-slate-700 rounded-full h-2 w-32">
                          <div
                            className="bg-gradient-to-r from-cyan-500 to-purple-600 h-2 rounded-full"
                            style={{ width: job.totalFiles ? `${(job.processedFiles / job.totalFiles) * 100}%` : "0%" }}
                          />
                        </div>
                        <span className="text-slate-400 text-sm">{job.processedFiles}/{job.totalFiles}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {jobs.length === 0 && step === "running" && (
        <div className="text-center py-12">
          <FolderOpen className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400">No migration jobs found.</p>
        </div>
      )}
    </div>
  )
}
