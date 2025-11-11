import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive"
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "relative w-full rounded-lg border p-4",
          {
            "bg-zinc-900 border-zinc-800 text-white": variant === "default",
            "bg-red-500/10 border-red-500/50 text-red-500": variant === "destructive",
          },
          className
        )}
        {...props}
      />
    )
  }
)

Alert.displayName = "Alert"

export const AlertDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    return <p ref={ref} className={cn("text-sm", className)} {...props} />
  }
)

AlertDescription.displayName = "AlertDescription"
