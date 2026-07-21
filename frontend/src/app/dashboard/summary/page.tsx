'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowDownCircle, ArrowUpCircle, Wallet, TrendingUp, PiggyBank } from 'lucide-react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import api from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { CustomLineChart } from '@/components/charts'

export default function SummaryPage() {
  const { data: overview } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/overview')
      return data
    },
  })

  const { data: goalsStats } = useQuery({
    queryKey: ['goals-stats'],
    queryFn: async () => {
      const { data } = await api.get('/goals/stats')
      return data
    },
  })

  const summaryCards = [
    {
      title: 'Ingresos del mes',
      value: overview?.income?.monthlyTotal || 0,
      icon: ArrowUpCircle,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
    {
      title: 'Gastos del mes',
      value: overview?.expenses?.monthlyTotal || 0,
      icon: ArrowDownCircle,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
    },
    {
      title: 'Balance',
      value: overview?.balance || 0,
      icon: Wallet,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      title: 'Metas completadas',
      value: goalsStats?.completedGoals || 0,
      subtitle: `${goalsStats?.activeGoals || 0} activas`,
      icon: PiggyBank,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Resumen</h1>
        <p className="text-muted-foreground mt-2">Visión general de tu situación financiera</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg ${card.bg}`}>
                    <card.icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                  {card.value >= 0 ? (
                    <ArrowUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold mt-1">
                    ${typeof card.value === 'number' ? card.value.toLocaleString('es-AR') : card.value}
                  </p>
                  {card.subtitle && (
                    <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle>Evolución mensual</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomLineChart
            data={overview?.monthlyEvolution || []}
            title="Evolución de Ingresos y Gastos"
            description="Últimos 6 meses"
            xKey="month"
            yKeys={['income', 'expense']}
            height={350}
          />
        </CardContent>
      </Card>
    </motion.div>
  )
}
