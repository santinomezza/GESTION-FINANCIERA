'use client'

import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cn } from '@/lib/utils'

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  /** Color variant for the indicator */
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'purple'
}

const INDICATOR_STYLES: Record<string, string> = {
  primary: 'from-primary to-emerald-400',
  success: 'from-emerald-400 to-teal-400',
  warning: 'from-amber-400 to-orange-400',
  danger:  'from-rose-400 to-red-500',
  purple:  'from-purple-400 to-indigo-500',
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, variant = 'primary', ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      'relative h-2 w-full overflow-hidden rounded-full bg-white/8',
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        'h-full flex-1 rounded-full transition-all duration-700 ease-out',
        'bg-gradient-to-r',
        INDICATOR_STYLES[variant] || INDICATOR_STYLES.primary
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))

Progress.displayName = 'Progress'

export { Progress }
