'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Transaction } from "@/types"
import { formatMoney, formatDate } from "@/lib/utils"
import { ArrowDownRight, ArrowUpRight, Clock, Receipt } from "lucide-react"
import { motion } from "framer-motion"
import { staggerContainer, fadeInUp } from "@/lib/animations"

export function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  if (!transactions || transactions.length === 0) {
    return (
      <Card className="glass-card h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Últimos Movimientos</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground/50" />
          </div>
          <div className="h-px bg-gradient-to-r from-primary/30 via-primary/10 to-transparent mt-3" />
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center gap-3 py-12">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center">
            <Clock className="h-5 w-5 text-muted-foreground/40" />
          </div>
          <p className="text-sm text-muted-foreground/60">No hay movimientos recientes</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-card h-full flex flex-col">
      <CardHeader className="pb-2 shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Últimos Movimientos</CardTitle>
          <span className="text-xs text-muted-foreground/60 bg-white/5 px-2 py-1 rounded-lg border border-white/8">
            {transactions.length} recientes
          </span>
        </div>
        {/* Accent line */}
        <div className="h-px bg-gradient-to-r from-primary/40 via-primary/15 to-transparent mt-3" />
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto scrollbar-thin px-0 pb-0 pt-1">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="divide-y divide-white/5"
        >
          {transactions.map((tx, index) => {
            const isIncome = tx.type === 'INCOME'
            return (
              <motion.div
                key={tx.id}
                custom={index}
                variants={fadeInUp}
                className="flex items-center gap-3.5 px-5 py-3 hover:bg-white/3 transition-colors duration-150 group"
              >
                {/* Icon */}
                <div className={`
                  flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110
                  ${isIncome
                    ? 'bg-emerald-500/15 border border-emerald-500/20'
                    : 'bg-rose-500/15 border border-rose-500/20'
                  }
                `}>
                  {isIncome
                    ? <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
                    : <ArrowDownRight className="h-3.5 w-3.5 text-rose-400" />
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground/90 truncate leading-tight">
                    {tx.category?.name || 'Sin categoría'}
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5 truncate">
                    {tx.description || formatDate(tx.date)}
                  </p>
                </div>

                {/* Amount */}
                <div className={`
                  text-sm font-bold font-mono-financial tabular-nums shrink-0
                  ${isIncome ? 'text-emerald-400' : 'text-rose-400'}
                `}>
                  {isIncome ? '+' : '-'}{formatMoney(Number(tx.amount))}
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </CardContent>
    </Card>
  )
}
