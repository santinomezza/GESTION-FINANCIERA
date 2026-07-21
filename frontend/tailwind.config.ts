import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "sm": "640px",
        "md": "768px",
        "lg": "1024px",
        "xl": "1280px",
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
        },
        // Brand palette – updated to match new premium system
        pyme: {
          green:      "#10b981",
          greenLight: "#34d399",
          purple:     "#8b5cf6",
          indigo:     "#6366f1",
          red:        "#ef4444",
          amber:      "#f59e0b",
          blue:       "#3b82f6",
        },
        // Keep legacy aliases for backward compat
        "pyme-green":  "#10b981",
        "pyme-blue":   "#3b82f6",
        "pyme-red":    "#ef4444",
      },
      fontFamily: {
        sans:    ["Inter", "system-ui", "sans-serif"],
        display: ["'Space Grotesk'", "Inter", "sans-serif"],
        mono:    ["'JetBrains Mono'", "'Fira Code'", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":  "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-mesh":       "radial-gradient(ellipse at 20% 50%, rgba(16,185,129,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.12) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(99,102,241,0.10) 0%, transparent 50%)",
      },
      boxShadow: {
        "glow-sm":      "0 0 12px rgba(16,185,129,0.20)",
        "glow":         "0 0 24px rgba(16,185,129,0.25)",
        "glow-lg":      "0 0 48px rgba(16,185,129,0.30)",
        "glow-purple":  "0 0 24px rgba(139,92,246,0.25)",
        "glow-red":     "0 0 24px rgba(239,68,68,0.22)",
        "card-dark":    "0 4px 24px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.05)",
        "card-hover":   "0 12px 40px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.08)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.94)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(16,185,129,0)" },
          "50%":      { boxShadow: "0 0 20px 4px rgba(16,185,129,0.25)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-8px)" },
        },
        "gradient-shift": {
          "0%":   { backgroundPosition: "0% 50%" },
          "50%":  { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      animation: {
        "accordion-down":   "accordion-down 0.2s ease-out",
        "accordion-up":     "accordion-up 0.2s ease-out",
        "fade-in":          "fade-in 0.4s ease-out",
        "slide-up":         "slide-up 0.45s ease-out",
        "scale-in":         "scale-in 0.3s ease-out",
        "shimmer":          "shimmer 1.8s ease-in-out infinite",
        "pulse-glow":       "pulse-glow 3s ease-in-out infinite",
        "float":            "float 4s ease-in-out infinite",
        "gradient-shift":   "gradient-shift 8s ease infinite",
      },
      transitionTimingFunction: {
        "spring":     "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "bounce-out": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [],
} satisfies Config

export default config