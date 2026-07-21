'use client'

import { useToastStore } from './use-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

const ICON_MAP = {
  success: CheckCircle2,
  error:   AlertCircle,
  warning: AlertTriangle,
  default: Info,
}

const STYLE_MAP = {
  success: {
    container: 'border-emerald-500/25 bg-[rgba(10,30,20,0.92)]',
    icon:      'text-emerald-400',
    accent:    'bg-emerald-400',
  },
  error: {
    container: 'border-rose-500/25 bg-[rgba(30,10,12,0.92)]',
    icon:      'text-rose-400',
    accent:    'bg-rose-400',
  },
  warning: {
    container: 'border-amber-500/25 bg-[rgba(28,22,6,0.92)]',
    icon:      'text-amber-400',
    accent:    'bg-amber-400',
  },
  default: {
    container: 'border-white/12 bg-[rgba(12,16,28,0.92)]',
    icon:      'text-blue-400',
    accent:    'bg-blue-400',
  },
}

export function Toaster() {
  const { toasts, dismiss } = useToastStore()

  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2.5 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const type = toast.type || 'default'
          const Icon = ICON_MAP[type] || Info
          const styles = STYLE_MAP[type] || STYLE_MAP.default

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.92, transition: { duration: 0.18 } }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className={cn(
                "pointer-events-auto relative overflow-hidden",
                "flex items-start gap-3 p-4 rounded-2xl",
                "border backdrop-blur-xl shadow-2xl shadow-black/40",
                styles.container
              )}
            >
              {/* Left accent bar */}
              <div className={cn("absolute left-0 top-3 bottom-3 w-0.5 rounded-full", styles.accent)} />

              {/* Icon */}
              <div className="shrink-0 mt-0.5 pl-1.5">
                <Icon className={cn("h-4.5 w-4.5", styles.icon)} style={{ width: '1.125rem', height: '1.125rem' }} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {toast.title && (
                  <p className="text-sm font-semibold text-white leading-tight">{toast.title}</p>
                )}
                {toast.description && (
                  <p className="text-xs text-white/60 mt-0.5 leading-snug">{toast.description}</p>
                )}
              </div>

              {/* Dismiss */}
              <button
                onClick={() => dismiss(toast.id)}
                className="shrink-0 text-white/30 hover:text-white/70 transition-colors p-0.5 rounded-lg hover:bg-white/8"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
