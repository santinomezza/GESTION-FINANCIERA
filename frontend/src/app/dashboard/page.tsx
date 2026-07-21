'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { BalanceCards } from '@/components/dashboard/balance-cards'
import { MainDashboardChart } from '@/components/dashboard/main-chart'
import { RecentTransactions } from '@/components/dashboard/recent-transactions'
import { Loader2, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { motion } from 'framer-motion'
import { staggerContainer, fadeInUp } from '@/lib/animations'

export default function DashboardOverviewPage() {
  const { user, activeWorkspaceId } = useAuthStore()

  const { data: overview, isLoading } = useQuery({
    queryKey: ['dashboard-overview', activeWorkspaceId],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/overview')
      return data
    },
  })

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-12 h-12">
            <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div className="absolute inset-0 w-12 h-12 gradient-primary rounded-xl animate-pulse opacity-50" />
          </div>
          <p className="text-sm text-muted-foreground">Cargando información financiera...</p>
        </div>
      </div>
    )
  }

  const firstName = user?.name?.split(' ')[0]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ── Header ── */}
      <motion.div variants={fadeInUp} className="flex flex-col gap-1 pt-1">
        <div className="flex items-center gap-2">
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
            {greeting},{' '}
            <span className="text-gradient">{firstName}</span>{' '}
            <span className="not-italic">👋</span>
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Aquí está el resumen de tu estado financiero actual.
        </p>
      </motion.div>

      {/* ── Balance Cards ── */}
      <motion.div variants={fadeInUp}>
        <BalanceCards
          data={overview?.monthly || { totalIncome: 0, totalExpense: 0, balance: 0, profitability: 0 }}
        />
      </motion.div>

      {/* ── Charts & Recent Transactions ── */}
      <motion.div
        variants={fadeInUp}
        className="grid gap-5 md:grid-cols-1 lg:grid-cols-7"
      >
        <div className="lg:col-span-4">
          <MainDashboardChart />
        </div>
        <div className="lg:col-span-3">
          <RecentTransactions transactions={overview?.recentTransactions || []} />
        </div>
      </motion.div>
    </motion.div>
  )
}
