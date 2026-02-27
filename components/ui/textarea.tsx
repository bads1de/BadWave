import * as React from "react"

import { cn } from "@/libs/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-none border border-theme-500/20 bg-[#0a0a0f]/80 px-4 py-3 text-sm font-mono text-theme-300 ring-offset-background placeholder:text-theme-900 focus-visible:outline-none focus:border-theme-500/60 focus:shadow-[0_0_15px_rgba(var(--theme-500),0.1),inset_0_0_15px_rgba(var(--theme-500),0.05)] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 shadow-[inset_0_0_10px_rgba(var(--theme-500),0.05)]",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
