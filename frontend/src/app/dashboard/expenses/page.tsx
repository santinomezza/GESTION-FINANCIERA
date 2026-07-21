'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Card, CardContent } from "@/components/ui/card"
import { CustomBarChart, CustomDonutChart } from '@/components/charts'
import { formatMoney } from '@/lib/utils'
import { ArrowDownRight, Loader2, TrendingDown, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'

import { useAuthStore } from '@/store/useAuthStore'

export default function ExpensesDashboardPage() {
  const { activeWorkspaceId } = useAuthStore()
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-expenses', activeWorkspaceId],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/expenses?months=6')
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
  const isVariationNegative = summary?.variation < 0

  return (
    <>
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Análisis de Gastos 💸</h1>
        <p className="text-muted-foreground">Detalle de tus egresos y distribución por categorías.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between pb-2">
                <p className="text-sm font-medium text-muted-foreground">Gasto este mes</p>
                <div className="p-2 rounded-lg bg-red-500/10">
                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                </div>
              </div>
              <h2 className="text-3xl font-bold">{formatMoney(summary?.currentMonth || 0)}</h2>
              <div className="flex items-center gap-1 mt-1">
                {isVariationNegative ? (
                  <TrendingDown className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm ${isVariationNegative ? 'text-green-500' : 'text-red-500'}`}>
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
                <p className="text-sm font-medium text-muted-foreground">Categoría Principal</p>
              </div>
              <h2 className="text-2xl font-bold truncate">{summary?.topCategory?.name || 'N/A'}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {formatMoney(summary?.topCategory?.total || 0)} gastados
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between pb-2">
                <p className="text-sm font-medium text-muted-foreground">Gasto Promedio (6m)</p>
              </div>
              <h2 className="text-2xl font-bold">{formatMoney((summary?.total || 0) / 6)}</h2>
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
          title="Distribución de Gastos"
          description="Por categoría"
        />
        <CustomBarChart
          data={(data?.monthly || []).map((m: any) => ({ month: m.month, expense: m.total, income: 0 })).reverse()}
          title="Evolución Mensual"
          description="Gastos por mes"
          xKey="month"
          yKeys={['expense']}
          height={350}
        />
      </div>
    </>
  )
}
