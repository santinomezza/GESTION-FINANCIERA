'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CustomBarChart } from '@/components/charts'

export function OverviewChart({ data }: { data: any[] }) {
  const chartData = (data || []).map((m: any) => ({
    name: m.month,
    month: m.month,
    Ingresos: m.income,
    Gastos: m.expense,
    Balance: m.balance || (m.income - m.expense),
  }))

  const hasData = chartData.length > 0

  return (
    <Card className="glass-card col-span-full lg:col-span-4">
      <CardHeader>
        <CardTitle>Evolución de Ingresos y Gastos</CardTitle>
        <CardDescription className="mt-1">
          Visualización interactiva
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData && (
          <div className="text-center py-8 text-muted-foreground">
            No hay datos suficientes
          </div>
        )}

        {hasData && (
          <div className="bg-muted/30 rounded-lg p-4 font-mono text-xs overflow-x-auto mb-4">
            <pre>{JSON.stringify(chartData, null, 2)}</pre>
          </div>
        )}

        <CustomBarChart
          data={chartData}
          title="Ingresos vs Gastos"
          description="Evolución mensual"
          xKey="month"
          yKeys={['Ingresos', 'Gastos']}
          height={350}
        />
      </CardContent>
    </Card>
  )
}
