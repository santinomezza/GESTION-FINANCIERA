'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CustomBarChart, CustomAreaChart } from '@/components/charts'
import { formatMoney } from '@/lib/utils'
import { Loader2, TrendingUp, DollarSign, Activity } from 'lucide-react'
import { motion } from 'framer-motion'

import { useAuthStore } from '@/store/useAuthStore'

export default function ProfitabilityDashboardPage() {
  const { activeWorkspaceId } = useAuthStore()
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-profitability', activeWorkspaceId],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/profitability?months=12')
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

  const { currentMonth, yearly, accumulated, monthly } = data || {}
  const chartData = [...(monthly || [])].reverse()

  const cashflowData = chartData.map((m: any) => ({
    name: m.month,
    month: m.month,
    'Flujo de Caja': m.balance,
    Ingresos: m.income,
    Gastos: m.expense,
  }))

  return (
    <>
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Rentabilidad y Flujo 📈</h1>
        <p className="text-muted-foreground">Evolución de tus márgenes y resultado final acumulado.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between pb-2">
                <p className="text-sm font-medium text-muted-foreground">Flujo Neto (Mes)</p>
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Activity className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <h2 className="text-3xl font-bold">{formatMoney(currentMonth?.balance || 0)}</h2>
              <p className="text-sm text-muted-foreground mt-1">Ingresos vs Gastos</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between pb-2">
                <p className="text-sm font-medium text-muted-foreground">Margen Bruto (Año)</p>
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
              </div>
              <h2 className="text-3xl font-bold">{yearly?.grossMargin || 0}%</h2>
              <p className="text-sm text-muted-foreground mt-1">Rentabilidad promedio</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between pb-2">
                <p className="text-sm font-medium text-muted-foreground">Balance Anual</p>
                <div className="p-2 rounded-lg bg-green-500/10">
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <h2 className="text-3xl font-bold">{formatMoney(yearly?.balance || 0)}</h2>
              <p className="text-sm text-muted-foreground mt-1">Acumulado del año</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-card bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between pb-2">
                <p className="text-sm font-medium text-primary">Resultado Histórico</p>
                <div className="p-2 rounded-lg bg-primary/10">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-primary">{formatMoney(accumulated?.balance || 0)}</h2>
              <p className="text-sm text-primary/80 mt-1">Balance total acumulado</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-4 lg:grid-cols-1 mb-8">
        <CustomBarChart
          data={chartData}
          title="Evolución de Ingresos y Gastos"
          description="Comparativa mensual"
          xKey="month"
          yKeys={['Ingresos', 'Gastos']}
          height={350}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-1">
        <CustomAreaChart
          data={cashflowData}
          title="Flujo de Caja (Cashflow)"
          description="Evolución del balance mensual"
          xKey="month"
          yKeys={['Ingresos', 'Gastos', 'Flujo de Caja']}
          height={350}
        />
      </div>
    </>
  )
}