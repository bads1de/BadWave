import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/libs/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-none border px-2.5 py-0.5 text-[10px] font-mono font-black uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cyber-glitch",
  {
    variants: {
      variant: {
        default:
          "border-theme-500/40 bg-theme-500/10 text-theme-300 shadow-[0_0_10px_rgba(var(--theme-500),0.2)]",
        secondary:
          "border-theme-900/40 bg-theme-900/20 text-theme-500",
        destructive:
          "border-red-500/40 bg-red-500/10 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]",
        outline: "text-theme-500 border-theme-500/20 bg-transparent",
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
