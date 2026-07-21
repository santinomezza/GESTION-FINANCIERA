'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartCard } from '@/components/charts';
import { CustomBarChart } from '@/components/charts'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'

export function MainDashboardChart() {
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
      <Card className="glass-card col-span-full lg:col-span-4">
        <CardHeader>
          <CardTitle>Evolución de Ingresos y Gastos</CardTitle>
          <CardDescription>Cargando...</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  const chartData = data?.monthly?.map((m: any) => ({
    month: m.month,
    Ingresos: m.income,
    Gastos: m.expense,
  }))

  return (
    <ChartCard title="Evolución de Ingresos y Gastos" description="Visualización interactiva">
      <CustomBarChart
        data={chartData}
        title="Evolución Mensual"
        description="Últimos 12 meses"
        xKey="month"
        yKeys={['Ingresos', 'Gastos']}
        height={350}
      />
    </ChartCard>
  )
}