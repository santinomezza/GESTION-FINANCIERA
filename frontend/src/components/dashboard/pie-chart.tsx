'use client'

import { ChartCard } from '@/components/charts';
import { CustomDonutChart } from '@/components/charts';

export function CategoryPieChart({ data, title }: { data: any[], title: string }) {
  const chartData = (data || []).map((item: any) => ({
    name: item.name || item.categoría,
    value: item.total || item.value,
  }))

  const hasData = chartData.length > 0

  return (
    <ChartCard title={title} description="Distribución visual">
      {!hasData && (
        <div className="text-center py-8 text-muted-foreground">
          No hay datos suficientes
        </div>
      )}

      <CustomDonutChart
        data={chartData}
        title={title}
        description="Distribución por categoría"
        showLegend={true}
      />
    </ChartCard>
  )
}
