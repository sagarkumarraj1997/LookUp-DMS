"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, XCircle, Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface Signer {
  id: string
  order: number
  status: "PENDING" | "SIGNED" | "DECLINED" | "EXPIRED"
  signedAt?: Date | null
  signer: {
    id: string
    name?: string | null
    email: string
    image?: string | null
  }
}

interface SignerCardProps {
  signer: Signer
  isActive?: boolean
}

const statusConfig = {
  PENDING: { icon: Clock, color: "text-amber-500", bg: "bg-amber-50", label: "Pending" },
  SIGNED: { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50", label: "Signed" },
  DECLINED: { icon: XCircle, color: "text-red-500", bg: "bg-red-50", label: "Declined" },
  EXPIRED: { icon: Circle, color: "text-slate-400", bg: "bg-slate-50", label: "Expired" },
}

export function SignerCard({ signer, isActive }: SignerCardProps) {
  const config = statusConfig[signer.status]
  const Icon = config.icon
  const initials = signer.signer.name
    ? signer.signer.name.split(" ").map((n) => n[0]).join("").toUpperCase()
    : signer.signer.email[0].toUpperCase()

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border transition-all",
        isActive ? "border-cyan-400 bg-cyan-50/50" : "border-slate-200 bg-white",
        "hover:shadow-sm"
      )}
    >
      <div className="relative">
        <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-slate-800 text-white text-xs flex items-center justify-center font-bold z-10">
          {signer.order}
        </div>
        <Avatar className="w-10 h-10">
          <AvatarImage src={signer.signer.image ?? undefined} />
          <AvatarFallback className="bg-gradient-to-br from-violet-500 to-cyan-500 text-white text-sm font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-slate-800 truncate">
          {signer.signer.name || signer.signer.email}
        </p>
        <p className="text-xs text-slate-500 truncate">{signer.signer.email}</p>
        {signer.signedAt && (
          <p className="text-xs text-slate-400 mt-0.5">
            Signed {format(new Date(signer.signedAt), "MMM d, yyyy h:mm a")}
          </p>
        )}
      </div>
      <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium", config.bg, config.color)}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </div>
    </div>
  )
}
