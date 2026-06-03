"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useMutation } from "@tanstack/react-query"
import {
  Building2, Users, FolderOpen, Upload, CheckCircle, ArrowRight, ArrowLeft, Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

const STEPS = [
  { id: 1, label: "Organization", icon: Building2, description: "Set up your organization details" },
  { id: 2, label: "Invite Team", icon: Users, description: "Invite your team members" },
  { id: 3, label: "First Repository", icon: FolderOpen, description: "Create your first repository" },
  { id: 4, label: "Upload File", icon: Upload, description: "Upload your first document" },
  { id: 5, label: "Done!", icon: CheckCircle, description: "You're all set" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [orgData, setOrgData] = useState({ name: "", description: "" })
  const [inviteEmails, setInviteEmails] = useState("")
  const [repoName, setRepoName] = useState("")

  const createOrgMutation = useMutation({
    mutationFn: async () => {
      const slug = orgData.name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-")
      const res = await fetch("/api/admin/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: orgData.name, slug, description: orgData.description }),
      })
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  })

  const canProceed = () => {
    if (step === 1) return orgData.name.length >= 2
    if (step === 3) return repoName.length >= 2
    return true
  }

  const next = async () => {
    if (step === 1 && orgData.name) await createOrgMutation.mutateAsync().catch(() => {})
    if (step === 5) {
      router.push("/dashboard")
      return
    }
    setStep(s => s + 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl">LookUp DMS</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Welcome!</h1>
          <p className="text-slate-400 mt-2">Let&apos;s set up your workspace in just a few steps</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                step > s.id ? "bg-cyan-500 text-white" :
                step === s.id ? "bg-white text-slate-900" :
                "bg-slate-700 text-slate-400"
              )}>
                {step > s.id ? <CheckCircle className="w-4 h-4" /> : s.id}
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn("w-8 h-0.5 transition-all", step > s.id ? "bg-cyan-500" : "bg-slate-700")} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              {(() => {
                const Icon = STEPS[step - 1].icon
                return (
                  <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-cyan-600" />
                  </div>
                )
              })()}
              <div>
                <h2 className="font-bold text-slate-900">Step {step}: {STEPS[step - 1].label}</h2>
                <p className="text-sm text-slate-500">{STEPS[step - 1].description}</p>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 min-h-[280px]"
            >
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label>Organization Name *</Label>
                    <Input
                      value={orgData.name}
                      onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                      placeholder="e.g. Acme Corporation"
                      className="mt-1.5"
                      autoFocus
                    />
                  </div>
                  <div>
                    <Label>Description (optional)</Label>
                    <Textarea
                      value={orgData.description}
                      onChange={(e) => setOrgData({ ...orgData, description: e.target.value })}
                      placeholder="What does your organization do?"
                      rows={3}
                      className="mt-1.5"
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-500">Invite colleagues to join your workspace. You can skip this and invite them later.</p>
                  <div>
                    <Label>Email Addresses (one per line or comma-separated)</Label>
                    <Textarea
                      value={inviteEmails}
                      onChange={(e) => setInviteEmails(e.target.value)}
                      placeholder="john@example.com&#10;jane@example.com"
                      rows={5}
                      className="mt-1.5"
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-500">Repositories organize your documents into logical groups.</p>
                  <div>
                    <Label>Repository Name *</Label>
                    <Input
                      value={repoName}
                      onChange={(e) => setRepoName(e.target.value)}
                      placeholder="e.g. Legal Documents, HR Policies..."
                      className="mt-1.5"
                      autoFocus
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {["Legal Documents", "HR Policies", "Finance Reports", "Product Specs", "Marketing", "General"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setRepoName(t)}
                        className={cn(
                          "p-2 rounded-lg border text-sm transition-all text-left",
                          repoName === t ? "border-cyan-400 bg-cyan-50 text-cyan-700" : "border-slate-200 hover:border-slate-300"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-500">Upload your first document to get started.</p>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-cyan-400 transition-colors cursor-pointer">
                    <Upload className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">Drop a file here or click to upload</p>
                    <p className="text-slate-400 text-sm mt-1">PDF, DOCX, XLSX, images, and more</p>
                    <Button variant="outline" size="sm" className="mt-4">Browse Files</Button>
                  </div>
                  <p className="text-xs text-slate-400 text-center">You can skip this and upload files later</p>
                </div>
              )}

              {step === 5 && (
                <div className="text-center space-y-4 py-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto"
                  >
                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-slate-900">You&apos;re all set!</h2>
                  <p className="text-slate-500 max-w-sm mx-auto">
                    Your workspace is ready. Start managing your documents, collaborating with your team, and automating workflows.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="px-6 pb-6 flex justify-between">
            <Button
              variant="ghost"
              onClick={() => step > 1 ? setStep(s => s - 1) : null}
              disabled={step === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <div className="flex gap-2">
              {step < 5 && step !== 1 && (
                <Button variant="ghost" onClick={() => setStep(s => s + 1)}>
                  Skip
                </Button>
              )}
              <Button
                onClick={next}
                disabled={!canProceed() || createOrgMutation.isPending}
                className="bg-cyan-500 hover:bg-cyan-600"
              >
                {step === 5 ? "Go to Dashboard" : "Continue"}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
