"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-8 h-8 opacity-0" />
  }

  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:bg-white/10 hover:text-foreground transition-all duration-200"
      aria-label="Toggle theme"
    >
      <Sun className="h-4.5 w-4.5 absolute transition-all duration-300 scale-100 rotate-0 dark:scale-0 dark:-rotate-90" />
      <Moon className="h-4.5 w-4.5 absolute transition-all duration-300 scale-0 rotate-90 dark:scale-100 dark:rotate-0" />
    </button>
  )
}
