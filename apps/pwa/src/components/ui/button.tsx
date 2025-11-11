import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-semibold transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950",
          "disabled:opacity-50 disabled:pointer-events-none",
          {
            // Variants
            "bg-gradient-to-r from-purple-600 via-[#D445E7] to-cyan-400 text-white hover:opacity-90 focus:ring-purple-500/50": variant === "default",
            "border border-zinc-800 bg-transparent text-white hover:bg-zinc-900 focus:ring-zinc-700":
              variant === "outline",
            "text-white hover:bg-zinc-900 focus:ring-zinc-700": variant === "ghost",
            // Sizes
            "h-10 px-4 text-sm": size === "sm",
            "h-12 px-6 text-base": size === "default",
            "h-14 px-8 text-lg": size === "lg",
          },
          className
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"
