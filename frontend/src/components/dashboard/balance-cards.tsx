'use client'

import { motion } from 'framer-motion'
import { ArrowDownRight, ArrowUpRight, Wallet, TrendingUp } from 'lucide-react'
import { formatMoney } from '@/lib/utils'
import { cardEntrance } from '@/lib/animations'
import { cn } from '@/lib/utils'

interface BalanceCardsProps {
  data?: {
    totalIncome: number
    totalExpense: number
    balance: number
    profitability: number
  }
}

const CARDS = [
  {
    key: 'balance',
    title: 'Balance Total',
    subtitle: 'Patrimonio neto',
    Icon: Wallet,
    gradient: 'from-violet-500 via-purple-500 to-indigo-600',
    glow: 'rgba(139,92,246,0.35)',
    shimmer: 'rgba(139,92,246,0.15)',
    accentBg: 'bg-violet-400/20',
    isMoney: true,
  },
  {
    key: 'totalIncome',
    title: 'Ingresos',
    subtitle: 'Este mes',
    Icon: ArrowUpRight,
    gradient: 'from-emerald-400 via-teal-500 to-green-600',
    glow: 'rgba(16,185,129,0.35)',
    shimmer: 'rgba(16,185,129,0.15)',
    accentBg: 'bg-emerald-400/20',
    isMoney: true,
  },
  {
    key: 'totalExpense',
    title: 'Gastos',
    subtitle: 'Este mes',
    Icon: ArrowDownRight,
    gradient: 'from-rose-400 via-red-500 to-orange-500',
    glow: 'rgba(239,68,68,0.35)',
    shimmer: 'rgba(239,68,68,0.15)',
    accentBg: 'bg-rose-400/20',
    isMoney: true,
  },
  {
    key: 'profitability',
    title: 'Rentabilidad',
    subtitle: 'Margen neto',
    Icon: TrendingUp,
    gradient: 'from-amber-400 via-orange-400 to-yellow-500',
    glow: 'rgba(245,158,11,0.35)',
    shimmer: 'rgba(245,158,11,0.15)',
    accentBg: 'bg-amber-400/20',
    isMoney: false,
    suffix: '%',
  },
]

export function BalanceCards({ data }: BalanceCardsProps) {
  // Skeleton loading
  if (!data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="glass-card p-5 space-y-4"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-28 bg-white/8 rounded-lg animate-shimmer" />
              <div className="h-10 w-10 bg-white/8 rounded-xl animate-shimmer" />
            </div>
            <div className="h-7 w-36 bg-white/8 rounded-lg animate-shimmer" />
            <div className="h-2.5 w-20 bg-white/5 rounded-full animate-shimmer" />
          </div>
        ))}
      </div>
    )
  }

  const values: Record<string, number> = {
    balance: data.balance,
    totalIncome: data.totalIncome,
    totalExpense: data.totalExpense,
    profitability: data.profitability,
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {CARDS.map((card, index) => {
        const Icon = card.Icon
        const rawValue = values[card.key] ?? 0
        const displayValue = card.isMoney
          ? formatMoney(rawValue)
          : `${rawValue.toFixed(1)}${card.suffix ?? ''}`

        return (
          <motion.div
            key={card.key}
            custom={index}
            variants={cardEntrance}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -4, transition: { duration: 0.25, ease: 'easeOut' } }}
            className="relative overflow-hidden rounded-2xl cursor-default select-none"
            style={{
              background: `linear-gradient(135deg, ${card.gradient.replace('from-', '').replace(' via-', ' to ')})`,
            }}
          >
            {/* Gradient background */}
            <div className={cn("absolute inset-0 bg-gradient-to-br", card.gradient)} />

            {/* Shimmer overlay */}
            <div
              className="absolute inset-0 opacity-40"
              style={{
                background: `radial-gradient(ellipse at top left, ${card.shimmer} 0%, transparent 60%)`,
              }}
            />

            {/* Top-right circle decoration */}
            <div
              className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20"
              style={{ background: 'rgba(255,255,255,0.25)', filter: 'blur(2px)' }}
            />
            <div
              className="absolute -bottom-8 -left-4 w-20 h-20 rounded-full opacity-10"
              style={{ background: 'rgba(255,255,255,0.3)' }}
            />

            {/* Content */}
            <div className="relative z-10 p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-white/80 text-xs font-semibold uppercase tracking-widest leading-none">
                    {card.title}
                  </p>
                  <p className="text-white/55 text-[10px] mt-1">{card.subtitle}</p>
                </div>
                <div className={cn("p-2.5 rounded-xl", card.accentBg)}>
                  <Icon className="h-4.5 w-4.5 text-white" style={{ width: '1.125rem', height: '1.125rem' }} />
                </div>
              </div>

              <p className="text-white font-bold text-2xl tracking-tight font-display leading-none">
                {displayValue}
              </p>

              {/* Bottom accent line */}
              <div className="mt-4 h-0.5 rounded-full bg-white/20" />
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
