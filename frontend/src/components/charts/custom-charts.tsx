'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { formatMoney } from '@/lib/utils'

// Tipos
interface ChartDataItem {
    name: string
    value?: number
    [key: string]: any
}

interface BaseChartProps {
    data: ChartDataItem[]
    title: string
    description?: string
    height?: number
}

// Colores profesionales para finanzas
const COLORS = {
    primary: '#3b82f6',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    info: '#06b6d4',
    purple: '#8b5cf6',
    pink: '#ec4899',
    indigo: '#6366f1',
    teal: '#14b8a6',
    orange: '#f97316'
}

const COLOR_PALETTE = [
    COLORS.primary,
    COLORS.success,
    COLORS.warning,
    COLORS.danger,
    COLORS.purple,
    COLORS.info,
    COLORS.pink,
    COLORS.indigo,
    COLORS.teal,
    COLORS.orange
]

// Tooltip simple
interface TooltipProps {
    x: number
    y: number
    content: React.ReactNode
    visible: boolean
}

function SimpleTooltip({ x, y, content, visible }: TooltipProps) {
    if (!visible) return null

    return (
        <div
            className="fixed z-50 px-3 py-2 bg-popover text-popover-foreground border border-border shadow-lg rounded-lg text-sm pointer-events-none glass"
            style={{
                left: `${x}px`,
                top: `${y - 10}px`,
                transform: 'translate(-50%, -100%)',
            }}
        >
            {content}
        </div>
    )
}

// Gráfico de Barras Simple
interface BarChartProps extends BaseChartProps {
    xKey?: string
    yKeys?: string[]
    showValues?: boolean
}

export function CustomBarChart({
    data,
    title,
    description,
    xKey = 'name',
    yKeys = [],
    height = 300,
    showValues = true
}: BarChartProps) {
    const [tooltip, setTooltip] = useState<{ x: number; y: number; content: React.ReactNode } | null>(null)

    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm py-10">
                No hay datos suficientes
            </div>
        )
    }

    const maxValue = Math.max(...data.map(d =>
        Math.max(...yKeys.map(key => Number(d[key]) || 0))
    ), 1000)

    const yAxisSteps = 5
    // Calculate a nice max value for the Y axis
    const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)))
    const normalizedMax = maxValue / magnitude
    let niceMax = Math.ceil(normalizedMax) * magnitude
    if (niceMax < maxValue * 1.1) niceMax = Math.ceil(normalizedMax + 1) * magnitude
    const maxChartValue = niceMax

    const paddingLeft = 45
    const paddingRight = 10
    const paddingTop = 20
    const paddingBottom = 30
    
    const chartHeight = height - paddingTop - paddingBottom
    
    // Bar styling
    const barWidthPx = 10
    const barGapPx = 4
    const totalGroupWidthPx = yKeys.length * barWidthPx + (yKeys.length - 1) * barGapPx

    const formatYAxis = (value: number) => {
        if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
        if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`
        return `$${value}`
    }

    const handleMouseEnter = (event: React.MouseEvent, index: number, key: string, value: number) => {
        const rect = event.currentTarget.getBoundingClientRect()
        setTooltip({
            x: rect.left + rect.width / 2,
            y: rect.top,
            content: (
                <div className="space-y-1">
                    <p className="font-semibold text-foreground text-xs">{data[index][xKey]}</p>
                    <p className="text-xs" style={{ color: getBarColor(key) }}>
                        {key}: <span className="font-bold">{formatMoney(value)}</span>
                    </p>
                </div>
            )
        })
    }

    const handleMouseLeave = () => {
        setTooltip(null)
    }
    
    const getBarColor = (key: string) => {
        if (key.toLowerCase() === 'ingresos') return '#10b981' // emerald-500
        if (key.toLowerCase() === 'gastos') return '#ef4444' // red-500
        return COLOR_PALETTE[yKeys.indexOf(key) % COLOR_PALETTE.length]
    }

    return (
        <div className="w-full relative flex flex-col" style={{ height }}>
            {/* Optional inner title/description if not using ChartCard header */}
            {(title || description) && (
                <div className="mb-4">
                    {title && <h4 className="text-sm font-semibold text-foreground">{title}</h4>}
                    {description && <p className="text-xs text-muted-foreground">{description}</p>}
                </div>
            )}
            
            <div className="flex-1 relative w-full">
                <svg width="100%" height="100%" className="overflow-visible absolute inset-0">
                    {/* Y Axis Grid Lines & Labels */}
                    {Array.from({ length: yAxisSteps + 1 }).map((_, i) => {
                        const value = (maxChartValue / yAxisSteps) * i
                        const y = chartHeight + paddingTop - (value / maxChartValue) * chartHeight
                        return (
                            <g key={`y-axis-${i}`}>
                                <text
                                    x={paddingLeft - 8}
                                    y={y + 4}
                                    textAnchor="end"
                                    className="text-[10px] fill-muted-foreground font-mono-financial"
                                >
                                    {formatYAxis(value)}
                                </text>
                                <line
                                    x1={paddingLeft}
                                    y1={y}
                                    x2="100%"
                                    y2={y}
                                    className="stroke-border/40"
                                    strokeDasharray="4,4"
                                />
                            </g>
                        )
                    })}

                    {/* Bars */}
                    {data.map((item, index) => {
                        return yKeys.map((key, keyIndex) => {
                            const value = Number(item[key]) || 0
                            const barHeight = (value / maxChartValue) * chartHeight
                            
                            const xOffsetPx = -totalGroupWidthPx / 2 + keyIndex * (barWidthPx + barGapPx)
                            const xPos = `calc(${paddingLeft}px + (100% - ${paddingLeft + paddingRight}px) * ${(index + 0.5) / data.length} + ${xOffsetPx}px)`
                            
                            const color = getBarColor(key)
                            
                            // To make only the top rounded, we can use a path, or just use rect with rx and rely on it being drawn from the bottom line
                            // But since it starts exactly at the baseline, rx will round the bottom too.
                            // The simplest way to round only the top is to draw the rect slightly taller and clip it, or just use a path.
                            // Path for top-rounded rect:
                            const xVal = xPos
                            const yVal = chartHeight + paddingTop - barHeight
                            
                            return (
                                <rect
                                    key={`${index}-${key}`}
                                    style={{ x: xPos }}
                                    y={yVal}
                                    width={barWidthPx}
                                    height={Math.max(barHeight, 0)}
                                    fill={color}
                                    rx={barWidthPx / 2}
                                    onMouseEnter={(e) => handleMouseEnter(e, index, key, value)}
                                    onMouseLeave={handleMouseLeave}
                                    className="cursor-pointer transition-all duration-300 hover:opacity-80 hover:brightness-110"
                                />
                            )
                        })
                    })}

                    {/* X Axis Labels */}
                    {data.map((item, index) => {
                        const xPos = `calc(${paddingLeft}px + (100% - ${paddingLeft + paddingRight}px) * ${(index + 0.5) / data.length})`
                        return (
                            <text
                                key={`x-axis-${index}`}
                                style={{ x: xPos }}
                                y={chartHeight + paddingTop + 16}
                                textAnchor="middle"
                                className="text-[10px] fill-muted-foreground font-medium"
                            >
                                {item[xKey]}
                            </text>
                        )
                    })}
                </svg>
            </div>

            {tooltip && (
                <SimpleTooltip
                    x={tooltip.x}
                    y={tooltip.y}
                    content={tooltip.content}
                    visible={!!tooltip}
                />
            )}
        </div>
    )
}

// Gráfico de Líneas Simple
interface LineChartProps extends BaseChartProps {
    xKey?: string
    yKeys?: string[]
    showArea?: boolean
    curved?: boolean
}

export function CustomLineChart({
    data,
    title,
    description,
    xKey = 'name',
    yKeys = [],
    height = 300,
    showArea = true,
    curved = true
}: LineChartProps) {
    const [tooltip, setTooltip] = useState<{ x: number; y: number; content: React.ReactNode } | null>(null)

    if (!data || data.length === 0) {
        return (
            <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
                    {description && <CardDescription className="text-sm text-gray-500">{description}</CardDescription>}
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-[300px] text-gray-400">
                        No hay datos suficientes
                    </div>
                </CardContent>
            </Card>
        )
    }

    const maxValue = Math.max(...data.map(d =>
        Math.max(...yKeys.map(key => Number(d[key]) || 0))
    ))

    const chartHeight = height - 60
    const chartWidth = 100

    const getX = (index: number) => (index / (data.length - 1)) * chartWidth
    const getY = (value: number) => chartHeight - (value / maxValue) * chartHeight

    const generatePath = (key: string, fill: boolean = false) => {
        const points = data.map((d, i) => ({
            x: getX(i),
            y: getY(Number(d[key]) || 0)
        }))

        if (points.length === 0) return ''

        if (curved && points.length > 1) {
            let path = `M ${points[0].x} ${points[0].y}`

            for (let i = 0; i < points.length - 1; i++) {
                const xMid = (points[i].x + points[i + 1].x) / 2
                const yMid = (points[i].y + points[i + 1].y) / 2
                const cp1x = (points[i].x + xMid) / 2
                const cp1y = points[i].y
                const cp2x = (xMid + points[i + 1].x) / 2
                const cp2y = points[i + 1].y

                path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${points[i + 1].x} ${points[i + 1].y}`
            }

            if (fill) {
                path += ` L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`
            }

            return path
        } else {
            const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

            if (fill) {
                return `${linePath} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`
            }

            return linePath
        }
    }

    const handleMouseEnter = (event: React.MouseEvent, index: number, key: string) => {
        const rect = event.currentTarget.getBoundingClientRect()
        const value = Number(data[index][key]) || 0
        setTooltip({
            x: rect.left + rect.width / 2,
            y: rect.top,
            content: (
                <div className="space-y-1">
                    <p className="font-semibold">{data[index][xKey]}</p>
                    <p style={{ color: COLOR_PALETTE[yKeys.indexOf(key) % COLOR_PALETTE.length] }}>
                        {key}: {formatMoney(value)}
                    </p>
                </div>
            )
        })
    }

    const handleMouseLeave = () => {
        setTooltip(null)
    }

    return (
        <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
                {description && <CardDescription className="text-sm text-gray-500">{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <svg width="100%" height={height} className="overflow-visible">
                    {/* Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                        <line
                            key={i}
                            x1="0"
                            y1={chartHeight * ratio}
                            x2={`${chartWidth}%`}
                            y2={chartHeight * ratio}
                            stroke="#e5e7eb"
                            strokeDasharray="3,3"
                        />
                    ))}

                    {/* Áreas */}
                    {showArea && yKeys.map((key, index) => (
                        <path
                            key={`area-${key}`}
                            d={generatePath(key, true)}
                            fill={COLOR_PALETTE[index % COLOR_PALETTE.length]}
                            opacity="0.1"
                        />
                    ))}

                    {/* Líneas */}
                    {yKeys.map((key, index) => (
                        <path
                            key={`line-${key}`}
                            d={generatePath(key)}
                            fill="none"
                            stroke={COLOR_PALETTE[index % COLOR_PALETTE.length]}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    ))}

                    {/* Puntos */}
                    {data.map((item, index) =>
                        yKeys.map((key, keyIndex) => {
                            const value = Number(item[key]) || 0
                            const x = getX(index)
                            const y = getY(value)
                            const color = COLOR_PALETTE[keyIndex % COLOR_PALETTE.length]

                            return (
                                <circle
                                    key={`${index}-${key}`}
                                    cx={`${x}%`}
                                    cy={y}
                                    r="4"
                                    fill={color}
                                    stroke="white"
                                    strokeWidth="2"
                                    onMouseEnter={(e) => handleMouseEnter(e, index, key)}
                                    onMouseLeave={handleMouseLeave}
                                    className="cursor-pointer"
                                />
                            )
                        })
                    )}

                    {/* X Axis labels */}
                    {data.map((item, index) => (
                        <text
                            key={index}
                            x={`${getX(index)}%`}
                            y={chartHeight + 20}
                            textAnchor="middle"
                            className="text-xs fill-gray-600"
                        >
                            {item[xKey]}
                        </text>
                    ))}
                </svg>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 mt-4 justify-center">
                    {yKeys.map((key, index) => (
                        <div key={key} className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: COLOR_PALETTE[index % COLOR_PALETTE.length] }}
                            />
                            <span className="text-sm text-gray-600">{key}</span>
                        </div>
                    ))}
                </div>

                {tooltip && (
                    <SimpleTooltip
                        x={tooltip.x}
                        y={tooltip.y}
                        content={tooltip.content}
                        visible={!!tooltip}
                    />
                )}
            </CardContent>
        </Card>
    )
}

// Gráfico de Donut Simple
interface DonutChartProps extends BaseChartProps {
    nameKey?: string
    valueKey?: string
    showLegend?: boolean
    innerRadius?: number
}

export function CustomDonutChart({
    data,
    title,
    description,
    nameKey = 'name',
    valueKey = 'value',
    height = 300,
    showLegend = true,
    innerRadius = 60
}: DonutChartProps) {
    const [hoveredSegment, setHoveredSegment] = useState<number | null>(null)
    const [tooltip, setTooltip] = useState<{ x: number; y: number; content: React.ReactNode } | null>(null)

    if (!data || data.length === 0) {
        return (
            <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
                    {description && <CardDescription className="text-sm text-gray-500">{description}</CardDescription>}
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-[300px] text-gray-400">
                        No hay datos suficientes
                    </div>
                </CardContent>
            </Card>
        )
    }

    const total = data.reduce((sum, item) => sum + (Number(item[valueKey]) || 0), 0)
    const radius = 80
    const centerX = 150
    const centerY = 150
    const svgSize = 300

    let currentAngle = -90

    const segments = data.map((item, index) => {
        const value = Number(item[valueKey]) || 0
        const percentage = total > 0 ? (value / total) : 0
        const angle = percentage * 360
        const startAngle = currentAngle
        const endAngle = currentAngle + angle
        currentAngle = endAngle

        const startRad = (startAngle * Math.PI) / 180
        const endRad = (endAngle * Math.PI) / 180

        const x1 = centerX + radius * Math.cos(startRad)
        const y1 = centerY + radius * Math.sin(startRad)
        const x2 = centerX + radius * Math.cos(endRad)
        const y2 = centerY + radius * Math.sin(endRad)

        const largeArcFlag = angle > 180 ? 1 : 0

        const innerX1 = centerX + innerRadius * Math.cos(startRad)
        const innerY1 = centerY + innerRadius * Math.sin(startRad)
        const innerX2 = centerX + innerRadius * Math.cos(endRad)
        const innerY2 = centerY + innerRadius * Math.sin(endRad)

        const pathData = [
            `M ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            `L ${innerX2} ${innerY2}`,
            `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerX1} ${innerY1}`,
            'Z'
        ].join(' ')

        return {
            path: pathData,
            percentage,
            value,
            color: COLOR_PALETTE[index % COLOR_PALETTE.length],
            name: item[nameKey] || item.name,
            midAngle: (startAngle + endAngle) / 2
        }
    })

    const handleMouseEnter = (event: React.MouseEvent, segment: typeof segments[0], index: number) => {
        const rect = event.currentTarget.getBoundingClientRect()
        setTooltip({
            x: rect.left + rect.width / 2,
            y: rect.top,
            content: (
                <div className="space-y-1">
                    <p className="font-semibold">{segment.name}</p>
                    <p style={{ color: segment.color }}>
                        {formatMoney(segment.value)} ({(segment.percentage * 100).toFixed(1)}%)
                    </p>
                </div>
            )
        })
    }

    const handleMouseLeave = () => {
        setTooltip(null)
    }

    return (
        <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
                {description && <CardDescription className="text-sm text-gray-500">{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <div className="flex flex-col lg:flex-row items-center gap-8">
                    <svg width={svgSize} height={svgSize} className="mx-auto">
                        {segments.map((segment, index) => (
                            <path
                                key={index}
                                d={segment.path}
                                fill={segment.color}
                                opacity={hoveredSegment === null || hoveredSegment === index ? 1 : 0.4}
                                onMouseEnter={(e) => handleMouseEnter(e, segment, index)}
                                onMouseLeave={handleMouseLeave}
                                className="cursor-pointer"
                            />
                        ))}

                        {/* Texto central */}
                        <text
                            x={centerX}
                            y={centerY - 10}
                            textAnchor="middle"
                            className="text-2xl font-bold fill-gray-800"
                        >
                            {formatMoney(total)}
                        </text>
                        <text
                            x={centerX}
                            y={centerY + 15}
                            textAnchor="middle"
                            className="text-sm fill-gray-500"
                        >
                            Total
                        </text>
                    </svg>

                    {/* Leyenda */}
                    {showLegend && (
                        <div className="flex-1 space-y-2">
                            {segments.map((segment, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                                    onMouseEnter={() => setHoveredSegment(index)}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-4 h-4 rounded"
                                            style={{ backgroundColor: segment.color }}
                                        />
                                        <span className="text-sm font-medium text-gray-700">{segment.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-gray-900">{formatMoney(segment.value)}</p>
                                        <p className="text-xs text-gray-500">{(segment.percentage * 100).toFixed(1)}%</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {tooltip && (
                    <SimpleTooltip
                        x={tooltip.x}
                        y={tooltip.y}
                        content={tooltip.content}
                        visible={!!tooltip}
                    />
                )}
            </CardContent>
        </Card>
    )
}

// Gráfico de Área Simple
interface AreaChartProps extends BaseChartProps {
    xKey?: string
    yKeys?: string[]
}

export function CustomAreaChart({
    data,
    title,
    description,
    xKey = 'name',
    yKeys = [],
    height = 300
}: AreaChartProps) {
    const [tooltip, setTooltip] = useState<{ x: number; y: number; content: React.ReactNode } | null>(null)

    if (!data || data.length === 0) {
        return (
            <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
                    {description && <CardDescription className="text-sm text-gray-500">{description}</CardDescription>}
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-[300px] text-gray-400">
                        No hay datos suficientes
                    </div>
                </CardContent>
            </Card>
        )
    }

    const maxValue = Math.max(...data.map(d =>
        Math.max(...yKeys.map(key => Number(d[key]) || 0))
    ))

    const chartHeight = height - 60
    const chartWidth = 100

    const getX = (index: number) => (index / (data.length - 1)) * chartWidth
    const getY = (value: number) => chartHeight - (value / maxValue) * chartHeight

    const generateAreaPath = (key: string) => {
        const points = data.map((d, i) => ({
            x: getX(i),
            y: getY(Number(d[key]) || 0)
        }))

        if (points.length === 0) return ''

        let path = `M ${points[0].x} ${points[0].y}`

        for (let i = 0; i < points.length - 1; i++) {
            const xMid = (points[i].x + points[i + 1].x) / 2
            const yMid = (points[i].y + points[i + 1].y) / 2
            const cp1x = (points[i].x + xMid) / 2
            const cp1y = points[i].y
            const cp2x = (xMid + points[i + 1].x) / 2
            const cp2y = points[i + 1].y

            path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${points[i + 1].x} ${points[i + 1].y}`
        }

        path += ` L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`
        return path
    }

    const handleMouseEnter = (event: React.MouseEvent, index: number, key: string) => {
        const rect = event.currentTarget.getBoundingClientRect()
        const value = Number(data[index][key]) || 0
        setTooltip({
            x: rect.left + rect.width / 2,
            y: rect.top,
            content: (
                <div className="space-y-1">
                    <p className="font-semibold">{data[index][xKey]}</p>
                    <p style={{ color: COLOR_PALETTE[yKeys.indexOf(key) % COLOR_PALETTE.length] }}>
                        {key}: {formatMoney(value)}
                    </p>
                </div>
            )
        })
    }

    const handleMouseLeave = () => {
        setTooltip(null)
    }

    return (
        <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
                {description && <CardDescription className="text-sm text-gray-500">{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <svg width="100%" height={height} className="overflow-visible">
                    {/* Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                        <line
                            key={i}
                            x1="0"
                            y1={chartHeight * ratio}
                            x2={`${chartWidth}%`}
                            y2={chartHeight * ratio}
                            stroke="#e5e7eb"
                            strokeDasharray="3,3"
                        />
                    ))}

                    {/* Áreas */}
                    {yKeys.map((key, index) => (
                        <path
                            key={`area-${key}`}
                            d={generateAreaPath(key)}
                            fill={COLOR_PALETTE[index % COLOR_PALETTE.length]}
                            opacity="0.1"
                        />
                    ))}

                    {/* Líneas */}
                    {yKeys.map((key, index) => {
                        const points = data.map((d, i) => ({
                            x: getX(i),
                            y: getY(Number(d[key]) || 0)
                        }))

                        let path = `M ${points[0].x} ${points[0].y}`
                        for (let i = 0; i < points.length - 1; i++) {
                            const xMid = (points[i].x + points[i + 1].x) / 2
                            const yMid = (points[i].y + points[i + 1].y) / 2
                            const cp1x = (points[i].x + xMid) / 2
                            const cp1y = points[i].y
                            const cp2x = (xMid + points[i + 1].x) / 2
                            const cp2y = points[i + 1].y
                            path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${points[i + 1].x} ${points[i + 1].y}`
                        }

                        return (
                            <path
                                key={`line-${key}`}
                                d={path}
                                fill="none"
                                stroke={COLOR_PALETTE[index % COLOR_PALETTE.length]}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        )
                    })}

                    {/* Puntos interactivos */}
                    {data.map((item, index) =>
                        yKeys.map((key, keyIndex) => {
                            const value = Number(item[key]) || 0
                            const x = getX(index)
                            const y = getY(value)
                            const color = COLOR_PALETTE[keyIndex % COLOR_PALETTE.length]

                            return (
                                <circle
                                    key={`${index}-${key}`}
                                    cx={`${x}%`}
                                    cy={y}
                                    r="4"
                                    fill={color}
                                    stroke="white"
                                    strokeWidth="2"
                                    onMouseEnter={(e) => handleMouseEnter(e, index, key)}
                                    onMouseLeave={handleMouseLeave}
                                    className="cursor-pointer"
                                />
                            )
                        })
                    )}

                    {/* X Axis labels */}
                    {data.map((item, index) => (
                        <text
                            key={index}
                            x={`${getX(index)}%`}
                            y={chartHeight + 20}
                            textAnchor="middle"
                            className="text-xs fill-gray-600"
                        >
                            {item[xKey]}
                        </text>
                    ))}
                </svg>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 mt-4 justify-center">
                    {yKeys.map((key, index) => (
                        <div key={key} className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: COLOR_PALETTE[index % COLOR_PALETTE.length] }}
                            />
                            <span className="text-sm text-gray-600">{key}</span>
                        </div>
                    ))}
                </div>

                {tooltip && (
                    <SimpleTooltip
                        x={tooltip.x}
                        y={tooltip.y}
                        content={tooltip.content}
                        visible={!!tooltip}
                    />
                )}
            </CardContent>
        </Card>
    )
}