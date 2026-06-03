"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { FolderPlus } from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useCreateRepository } from "@/hooks/use-repositories"
import { toast } from "@/hooks/use-toast"

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  description: z.string().max(500).optional(),
  isPublic: z.boolean(),
})

type FormData = z.infer<typeof schema>

interface CreateRepositoryDialogProps {
  organizationId: string
  onCreated?: () => void
  children?: React.ReactNode
}

export function CreateRepositoryDialog({
  organizationId,
  onCreated,
  children,
}: CreateRepositoryDialogProps) {
  const [open, setOpen] = useState(false)
  const createRepo = useCreateRepository()

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { isPublic: false },
  })

  const isPublic = watch("isPublic")

  const onSubmit = async (data: FormData) => {
    try {
      await createRepo.mutateAsync({ ...data, organizationId })
      toast({ title: "Repository created", description: `${data.name} is ready to use`, variant: "success" as const })
      reset()
      setOpen(false)
      onCreated?.()
    } catch (error) {
      toast({ title: "Failed to create repository", variant: "destructive" })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button variant="accent">
            <FolderPlus className="w-4 h-4 mr-2" />New Repository
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-[rgb(var(--accent))]" />
            Create Repository
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Repository Name *</Label>
            <Input id="name" placeholder="e.g. Finance Documents" {...register("name")} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this repository contains..."
              rows={3}
              {...register("description")}
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-[rgb(var(--muted))]/50">
            <div>
              <p className="text-sm font-medium">Public repository</p>
              <p className="text-xs text-[rgb(var(--muted-foreground))]">Visible to all organization members</p>
            </div>
            <Switch
              checked={isPublic}
              onCheckedChange={(val) => setValue("isPublic", val)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" loading={createRepo.isPending}>
              Create Repository
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
