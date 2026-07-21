import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts'
import { useMemo } from 'react'

interface CashFlowChartProps {
  data: { date: string; income: number; expense: number }[]
  className?: string
}

export function CashFlowChart({ data, className }: CashFlowChartProps) {
  const chartData = useMemo(() => {
    return data.map(item => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }),
    }))
  }, [data])

  return (
    <div className={className || ''}>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} barSize={20}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="date" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={10}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [`$${value.toLocaleString('es-AR')}`, undefined]}
          />
          <Bar 
            dataKey="income" 
            fill="hsl(160, 40%, 30%)" 
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="expense" 
            fill="hsl(0, 50%, 50%)" 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

interface CategoryPieProps {
  data: { name: string; amount: number; color?: string }[]
  className?: string
}

export function CategoryPie({ data, className }: CategoryPieProps) {
  const COLORS = [
    '#385144', '#4A6B5C', '#2A5AA0', '#B94232', 
    '#A68A64', '#5A5A5A', '#D4C8B5', '#264653'
  ]

  const pieData = useMemo(() => {
    return data.map((item, index) => ({
      ...item,
      fill: item.color || COLORS[index % COLORS.length],
    }))
  }, [data])

  return (
    <div className={className || ''}>
      <ResponsiveContainer width="100%" height={150}>
        <BarChart data={pieData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} />
          <YAxis hide />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [`$${value.toLocaleString('es-AR')}`, undefined]}
          />
          <Bar dataKey="amount" fill="#385144" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}