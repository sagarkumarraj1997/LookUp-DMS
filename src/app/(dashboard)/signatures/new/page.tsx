"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useQuery, useMutation } from "@tanstack/react-query"
import {
  ArrowLeft, ArrowRight, Check, FileText, Users, Settings, Send,
  Plus, Trash2, GripVertical, Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

const steps = [
  { id: 1, label: "Select Document", icon: FileText },
  { id: 2, label: "Add Signers", icon: Users },
  { id: 3, label: "Configure", icon: Settings },
  { id: 4, label: "Review & Send", icon: Send },
]

const requestSchema = z.object({
  title: z.string().min(1, "Title required"),
  message: z.string().optional(),
  dueDate: z.string().optional(),
  documentId: z.string().min(1, "Document required"),
})

type RequestForm = z.infer<typeof requestSchema>

interface Signer {
  userId: string
  name: string
  email: string
  image?: string | null
  order: number
}

export default function NewSignaturePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedDoc, setSelectedDoc] = useState<{ id: string; name: string } | null>(null)
  const [signers, setSigners] = useState<Signer[]>([])
  const [userSearch, setUserSearch] = useState("")

  const form = useForm<RequestForm>({
    resolver: zodResolver(requestSchema),
    defaultValues: { title: "", message: "", dueDate: "", documentId: "" },
  })

  const { data: docs } = useQuery({
    queryKey: ["documents-for-sign"],
    queryFn: async () => {
      const res = await fetch("/api/documents?limit=50")
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  })

  const { data: users } = useQuery({
    queryKey: ["users-search", userSearch],
    queryFn: async () => {
      const res = await fetch(`/api/admin/users?search=${userSearch}&limit=10`)
      if (!res.ok) return { users: [] }
      return res.json()
    },
    enabled: userSearch.length > 1,
  })

  const createMutation = useMutation({
    mutationFn: async (data: RequestForm) => {
      const res = await fetch("/api/signatures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, signers }),
      })
      if (!res.ok) throw new Error("Failed to create")
      return res.json()
    },
    onSuccess: (data) => {
      toast({ title: "Signature request sent!" })
      router.push(`/signatures/${data.id}`)
    },
    onError: () => toast({ title: "Error creating request", variant: "destructive" }),
  })

  const addSigner = (user: { id: string; name?: string; email: string; image?: string | null }) => {
    if (signers.find((s) => s.userId === user.id)) return
    setSigners([...signers, {
      userId: user.id,
      name: user.name ?? user.email,
      email: user.email,
      image: user.image,
      order: signers.length + 1,
    }])
    setUserSearch("")
  }

  const removeSigner = (userId: string) => {
    setSigners(signers.filter((s) => s.userId !== userId).map((s, i) => ({ ...s, order: i + 1 })))
  }

  const canProceed = () => {
    if (currentStep === 1) return !!selectedDoc
    if (currentStep === 2) return signers.length > 0
    if (currentStep === 3) return form.getValues("title").length > 0
    return true
  }

  const onSubmit = form.handleSubmit((data) => {
    createMutation.mutate({ ...data, documentId: selectedDoc!.id })
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-xl font-bold text-slate-900">New Signature Request</h1>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between relative">
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-200 z-0" />
        {steps.map((step, i) => (
          <div key={step.id} className="flex flex-col items-center gap-2 z-10">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
              currentStep > step.id ? "bg-cyan-500 border-cyan-500 text-white" :
              currentStep === step.id ? "bg-white border-cyan-500 text-cyan-500" :
              "bg-white border-slate-300 text-slate-400"
            )}>
              {currentStep > step.id ? <Check className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
            </div>
            <span className={cn("text-xs font-medium", currentStep >= step.id ? "text-slate-800" : "text-slate-400")}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Step 1: Select Document */}
          {currentStep === 1 && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h2 className="text-base font-semibold text-slate-800 mb-4">Select Document to Sign</h2>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {docs?.documents?.map((doc: { id: string; name: string; mimeType: string }) => (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoc({ id: doc.id, name: doc.name })}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                        selectedDoc?.id === doc.id ? "border-cyan-400 bg-cyan-50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      )}
                    >
                      <FileText className="w-5 h-5 text-slate-400 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-slate-800">{doc.name}</p>
                        <p className="text-xs text-slate-400">{doc.mimeType}</p>
                      </div>
                      {selectedDoc?.id === doc.id && <Check className="w-4 h-4 text-cyan-500 ml-auto" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Add Signers */}
          {currentStep === 2 && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-base font-semibold text-slate-800">Add Signers</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search users by name or email..."
                    className="pl-9"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                  {userSearch.length > 1 && users?.users?.length > 0 && (
                    <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                      {users.users.map((u: { id: string; name?: string; email: string; image?: string | null }) => (
                        <div
                          key={u.id}
                          onClick={() => addSigner(u)}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 cursor-pointer"
                        >
                          <Avatar className="w-7 h-7">
                            <AvatarImage src={u.image ?? undefined} />
                            <AvatarFallback className="text-xs bg-violet-500 text-white">
                              {u.name?.[0] ?? u.email[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{u.name}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {signers.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500">Signing order (drag to reorder)</p>
                    {signers.map((signer) => (
                      <div key={signer.userId} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <GripVertical className="w-4 h-4 text-slate-300 cursor-grab" />
                        <div className="w-6 h-6 rounded-full bg-slate-800 text-white text-xs flex items-center justify-center font-bold">
                          {signer.order}
                        </div>
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={signer.image ?? undefined} />
                          <AvatarFallback className="text-xs bg-violet-500 text-white">
                            {signer.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-800">{signer.name}</p>
                          <p className="text-xs text-slate-400">{signer.email}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => removeSigner(signer.userId)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm">Search and add signers above</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Configure */}
          {currentStep === 3 && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-base font-semibold text-slate-800">Configure Request</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Request Title *</Label>
                    <Input id="title" {...form.register("title")} placeholder="e.g. Contract Signature - Q1 2024" className="mt-1.5" />
                    {form.formState.errors.title && (
                      <p className="text-red-500 text-xs mt-1">{form.formState.errors.title.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="message">Message (optional)</Label>
                    <Textarea
                      id="message"
                      {...form.register("message")}
                      placeholder="Add a message for the signers..."
                      rows={3}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date (optional)</Label>
                    <Input id="dueDate" type="date" {...form.register("dueDate")} className="mt-1.5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-5">
                <h2 className="text-base font-semibold text-slate-800">Review & Send</h2>
                <div className="space-y-3 bg-slate-50 rounded-lg p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Document</span>
                    <span className="font-medium text-slate-800">{selectedDoc?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Title</span>
                    <span className="font-medium text-slate-800">{form.getValues("title")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Signers</span>
                    <span className="font-medium text-slate-800">{signers.length} signer{signers.length !== 1 ? "s" : ""}</span>
                  </div>
                  {form.getValues("dueDate") && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Due Date</span>
                      <span className="font-medium text-slate-800">{form.getValues("dueDate")}</span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">Signers</p>
                  <div className="flex flex-wrap gap-2">
                    {signers.map((s) => (
                      <Badge key={s.userId} variant="outline" className="gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-violet-500 text-white text-xs flex items-center justify-center">
                          {s.order}
                        </span>
                        {s.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  Signers will receive an email notification with a link to sign the document.
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          {currentStep === 1 ? "Cancel" : "Back"}
        </Button>
        {currentStep < 4 ? (
          <Button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!canProceed()}
            className="bg-cyan-500 hover:bg-cyan-600"
          >
            Next <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={() => onSubmit()}
            disabled={createMutation.isPending}
            className="bg-cyan-500 hover:bg-cyan-600"
          >
            <Send className="w-4 h-4 mr-1" />
            {createMutation.isPending ? "Sending..." : "Send for Signature"}
          </Button>
        )}
      </div>
    </motion.div>
  )
}
