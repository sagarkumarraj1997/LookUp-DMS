"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { FolderPlus, ArrowLeft, FileText, Shield, Globe, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCreateRepository } from "@/hooks/use-repositories"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import Link from "next/link"

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  description: z.string().max(500).optional(),
  isPublic: z.boolean(),
  template: z.string().optional(),
  retentionDays: z.number().optional(),
})

type FormData = z.infer<typeof schema>

const templates = [
  { value: "general", label: "General Purpose", description: "Flexible repository for any type of documents", icon: FileText },
  { value: "legal", label: "Legal & Compliance", description: "Contracts, NDAs, and regulatory documents", icon: Shield },
  { value: "hr", label: "Human Resources", description: "Employee files, policies, and onboarding docs", icon: FileText },
  { value: "finance", label: "Finance", description: "Reports, invoices, and financial statements", icon: FileText },
]

const DEFAULT_ORG_ID = "default-org"

export default function NewRepositoryPage() {
  const router = useRouter()
  const createRepo = useCreateRepository()

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { isPublic: false, template: "general" },
  })

  const isPublic = watch("isPublic")
  const selectedTemplate = watch("template")

  const onSubmit = async (data: FormData) => {
    try {
      const repo = await createRepo.mutateAsync({ ...data, organizationId: DEFAULT_ORG_ID })
      toast({ title: "Repository created!", description: `${data.name} is ready to use`, variant: "success" as const })
      router.push(`/repositories/${repo.id}`)
    } catch {
      toast({ title: "Failed to create repository", variant: "destructive" })
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        className="flex items-center gap-3 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button variant="ghost" size="icon" asChild>
          <Link href="/repositories"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">New Repository</h1>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">Set up a new document repository</p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Repository Details</CardTitle>
              <CardDescription>Basic information about your new repository</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Repository Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Q4 Finance Documents"
                  className="text-base"
                  {...register("name")}
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the purpose of this repository..."
                  rows={3}
                  {...register("description")}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Template Selection */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Template</CardTitle>
              <CardDescription>Choose a template to pre-configure your repository</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {templates.map((tmpl) => (
                  <button
                    key={tmpl.value}
                    type="button"
                    onClick={() => setValue("template", tmpl.value)}
                    className={cn(
                      "flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all",
                      selectedTemplate === tmpl.value
                        ? "border-[rgb(var(--accent))] bg-[rgb(var(--accent))]/5"
                        : "border-[rgb(var(--border))] hover:border-[rgb(var(--accent))]/50"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                      selectedTemplate === tmpl.value ? "bg-[rgb(var(--accent))]/20" : "bg-[rgb(var(--muted))]"
                    )}>
                      <tmpl.icon className={cn("w-4 h-4", selectedTemplate === tmpl.value ? "text-[rgb(var(--accent))]" : "text-[rgb(var(--muted-foreground))]")} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{tmpl.label}</p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] mt-0.5">{tmpl.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Access Control */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Access Control</CardTitle>
              <CardDescription>Control who can access this repository</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-[rgb(var(--muted))]/50 border border-[rgb(var(--border))]">
                <div className="flex items-center gap-3">
                  {isPublic ? (
                    <Globe className="w-5 h-5 text-[rgb(var(--accent))]" />
                  ) : (
                    <Lock className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
                  )}
                  <div>
                    <p className="font-medium text-sm">
                      {isPublic ? "Public Repository" : "Private Repository"}
                    </p>
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">
                      {isPublic
                        ? "All organization members can view this repository"
                        : "Only invited members can access this repository"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isPublic}
                  onCheckedChange={(val) => setValue("isPublic", val)}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Submit */}
        <motion.div
          className="flex items-center justify-end gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button type="button" variant="outline" asChild>
            <Link href="/repositories">Cancel</Link>
          </Button>
          <Button type="submit" variant="accent" loading={createRepo.isPending} size="lg">
            <FolderPlus className="w-4 h-4 mr-2" />
            Create Repository
          </Button>
        </motion.div>
      </form>
    </div>
  )
}
