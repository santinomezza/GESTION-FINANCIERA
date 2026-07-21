import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-200',
  {
    variants: {
      variant: {
        default:     'bg-primary/15 text-primary border border-primary/25',
        secondary:   'bg-white/8 text-foreground/80 border border-white/10',
        destructive: 'bg-red-500/15 text-red-400 border border-red-500/25',
        outline:     'border border-white/15 text-foreground/70',
        success:     'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
        warning:     'bg-amber-500/15 text-amber-400 border border-amber-500/25',
        purple:      'bg-purple-500/15 text-purple-400 border border-purple-500/25',
        blue:        'bg-blue-500/15 text-blue-400 border border-blue-500/25',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
