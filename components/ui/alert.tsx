import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/libs/utils"

const alertVariants = cva(
  "relative w-full rounded-none border p-4 [&>svg~*]:pl-9 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-5 [&>svg]:text-theme-500 font-mono overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-[#0a0a0f] border-theme-500/20 text-white shadow-[inset_0_0_15px_rgba(var(--theme-500),0.05)]",
        destructive:
          "bg-[#0a0a0f] border-red-500/40 text-red-500 shadow-[inset_0_0_15px_rgba(239,68,68,0.05)] [&>svg]:text-red-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  >
    {/* 背景装飾 */}
    <div className="absolute inset-0 opacity-5 pointer-events-none bg-[length:100%_2px] bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.5)_50%)]" />
    {/* HUDコーナー */}
    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-theme-500/40" />
    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-theme-500/40" />
    {props.children}
  </div>
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 text-[10px] font-black uppercase tracking-[0.3em] leading-none", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-[10px] uppercase tracking-widest opacity-60 [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
