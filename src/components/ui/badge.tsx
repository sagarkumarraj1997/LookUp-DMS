import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] hover:bg-[rgb(var(--primary))]/80",
        secondary:
          "border-transparent bg-[rgb(var(--secondary))] text-[rgb(var(--secondary-foreground))] hover:bg-[rgb(var(--secondary))]/80",
        destructive:
          "border-transparent bg-[rgb(var(--destructive))] text-[rgb(var(--destructive-foreground))] hover:bg-[rgb(var(--destructive))]/80",
        outline: "text-[rgb(var(--foreground))]",
        accent:
          "border-transparent bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))] border-[rgb(var(--accent))]/20",
        success:
          "border-transparent bg-[rgb(var(--success))]/10 text-[rgb(var(--success))] border-[rgb(var(--success))]/20",
        highlight:
          "border-transparent bg-[rgb(var(--highlight))]/10 text-[rgb(var(--highlight))] border-[rgb(var(--highlight))]/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
