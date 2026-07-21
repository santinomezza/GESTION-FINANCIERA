import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Layout
          "flex h-11 w-full rounded-xl px-3.5 py-2 text-sm",
          // Colors
          "bg-background border border-input text-foreground",
          "placeholder:text-muted-foreground/60",
          // File input
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          // Focus
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary",
          "focus-visible:bg-accent/20",
          // Disabled
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Transition
          "transition-all duration-200",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
