'use client';

import { motion } from 'framer-motion';
import { cardEntrance } from '@/lib/animations';
import { cn } from '@/lib/utils';

export interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  badge?: string;
  action?: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  description,
  children,
  className,
  badge,
  action,
}) => (
  <motion.div
    variants={cardEntrance}
    initial="hidden"
    animate="visible"
    className={cn('glass-card overflow-hidden flex flex-col', className)}
  >
    {/* Header */}
    <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-sm font-semibold text-foreground leading-tight">{title}</h3>
          {badge && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-primary/15 text-primary border border-primary/20">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>

    {/* Thin accent line */}
    <div className="mx-5 mb-3 h-px bg-gradient-to-r from-primary/40 via-primary/15 to-transparent rounded-full" />

    {/* Chart area */}
    <div className="relative flex-1 px-2 pb-4">
      {children}
    </div>
  </motion.div>
);