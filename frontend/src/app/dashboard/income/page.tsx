'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Card, CardContent } from "@/components/ui/card"
import { CustomBarChart, CustomDonutChart } from '@/components/charts'
import { formatMoney } from '@/lib/utils'
import { ArrowUpRight, Loader2, TrendingDown, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'

import { useAuthStore } from '@/store/useAuthStore'

export default function IncomeDashboardPage() {
  const { activeWorkspaceId } = useAuthStore()
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-income', activeWorkspaceId],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/income?months=6')
      return data
    },
  })

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const summary = data?.summary
  const isVariationPositive = summary?.variation > 0

  return (
    <>
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Análisis de Ingresos 💰</h1>
        <p className="text-muted-foreground">Distribución y evolución de tus fuentes de ingreso.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between pb-2">
                <p className="text-sm font-medium text-muted-foreground">Ingreso este mes</p>
                <div className="p-2 rounded-lg bg-green-500/10">
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <h2 className="text-3xl font-bold">{formatMoney(summary?.currentMonth || 0)}</h2>
              <div className="flex items-center gap-1 mt-1">
                {isVariationPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm ${isVariationPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {Math.abs(summary?.variation || 0)}% vs mes anterior
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between pb-2">
                <p className="text-sm font-medium text-muted-foreground">Fuente Principal</p>
              </div>
              <h2 className="text-2xl font-bold truncate">{summary?.topSource?.name || 'N/A'}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {formatMoney(summary?.topSource?.total || 0)} ingresados
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between pb-2">
                <p className="text-sm font-medium text-muted-foreground">Ingreso Promedio (6m)</p>
              </div>
              <h2 className="text-2xl font-bold">{formatMoney(summary?.avgMonthly || 0)}</h2>
              <p className="text-sm text-muted-foreground mt-1">Por mes</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <CustomDonutChart
          data={(data?.byCategory || []).map((cat: any) => ({
            name: cat.name || cat.categoría,
            value: cat.total || cat.value
          }))}
          title="Fuentes de Ingreso"
          description="Distribución por categoría"
        />
        <CustomBarChart
          data={(data?.monthly || []).map((m: any) => ({ month: m.month, expense: 0, income: m.total })).reverse()}
          title="Evolución Mensual"
          description="Ingresos por mes"
          xKey="month"
          yKeys={['income']}
          height={350}
        />
      </div>
    </>
  )
}
