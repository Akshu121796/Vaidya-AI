import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border select-none",
        {
          "bg-primary/10 border-primary/30 text-primary": variant === "default",
          "bg-white/5 border-white/10 text-muted-foreground": variant === "secondary",
          "bg-destructive/10 border-destructive/30 text-red-400": variant === "destructive",
          "border-white/20 bg-transparent text-foreground": variant === "outline",
          "bg-emerald-500/10 border-emerald-500/30 text-emerald-400": variant === "success",
          "bg-amber-500/10 border-amber-500/30 text-amber-400": variant === "warning",
          "bg-cyan-500/10 border-cyan-500/30 text-cyan-400": variant === "info",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
