"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { ArrowLeft, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  plan: z.string(),
  adminEmail: z.string().email().optional().or(z.literal("")),
  domain: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function NewOrganizationPage() {
  const router = useRouter()
  const { toast } = useToast()

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", slug: "", plan: "FREE" },
  })

  const nameValue = watch("name")

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch("/api/admin/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
    onSuccess: () => {
      toast({ title: "Organization created successfully" })
      router.push("/admin/organizations")
    },
    onError: () => toast({ title: "Failed to create organization", variant: "destructive" }),
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Create Organization</h1>
          <p className="text-sm text-slate-500">Set up a new organization</p>
        </div>
      </div>

      <form onSubmit={handleSubmit((d) => createMutation.mutate(d))}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-violet-500" /> Organization Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name *</Label>
                <Input
                  {...register("name")}
                  onChange={(e) => {
                    register("name").onChange(e)
                    setValue("slug", e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-"))
                  }}
                  placeholder="Acme Corporation"
                  className="mt-1"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label>Slug *</Label>
                <Input {...register("slug")} placeholder="acme-corp" className="mt-1" />
                {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea {...register("description")} placeholder="Describe the organization..." rows={3} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Plan</Label>
                <Select defaultValue="FREE" onValueChange={(v) => setValue("plan", v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FREE">Free</SelectItem>
                    <SelectItem value="PRO">Pro</SelectItem>
                    <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Domain (optional)</Label>
                <Input {...register("domain")} placeholder="acme.com" className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Admin Email (optional)</Label>
              <Input {...register("adminEmail")} type="email" placeholder="admin@acme.com" className="mt-1" />
              {errors.adminEmail && <p className="text-red-500 text-xs mt-1">{errors.adminEmail.message}</p>}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={createMutation.isPending} className="bg-violet-500 hover:bg-violet-600">
            {createMutation.isPending ? "Creating..." : "Create Organization"}
          </Button>
        </div>
      </form>
    </motion.div>
  )
}
