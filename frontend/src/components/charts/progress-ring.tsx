'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import DonutChart from "@/components/charts/DonutChart";
import { formatMoney } from '@/lib/utils'


interface GoalProgressCardProps {
    name: string
    currentAmount: number
    targetAmount: number
    color?: string
}

export function GoalProgressCard({ name, currentAmount, targetAmount, color = '#3b82f6' }: GoalProgressCardProps) {
    const progress = Math.min(100, (currentAmount / targetAmount) * 100)
    const isCompleted = progress >= 100

    return (
        <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{name}</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold" style={{ color }}>
                                {formatMoney(currentAmount)}
                            </span>
                            <span className="text-sm text-gray-400">de {formatMoney(targetAmount)}</span>
                        </div>
                    </div>
                    <DonutChart
                        progress={progress}
                        size={80}
                        strokeWidth={6}
                        color={isCompleted ? '#10b981' : color}
                        showValue={true}
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progreso</span>
                        <span className="font-medium">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                            className="h-full rounded-full"
                            style={{
                                width: `${progress}%`,
                                backgroundColor: isCompleted ? 'var(--success)' : color
                            }}
                        />
                    </div>
                </div>

                {isCompleted && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-700 font-medium">¡Meta completada!</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

interface SavingsStatsProps {
    totalTarget: number
    totalSaved: number
    completionRate: number
    activeGoals: number
    completedGoals: number
}

export function SavingsStats({ totalTarget, totalSaved, completionRate, activeGoals, completedGoals }: SavingsStatsProps) {
    const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Progreso Global</p>
                            <p className="text-3xl font-bold" style={{ color: '#3b82f6' }}>
                                {overallProgress.toFixed(1)}%
                            </p>
                        </div>
                        <DonutChart
                            progress={overallProgress}
                            size={80}
                            strokeWidth={6}
                            color="var(--primary)"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-6">
                    <p className="text-sm text-gray-600 mb-2">Total Ahorrado</p>
                    <p className="text-3xl font-bold text-green-600 mb-1">
                        {formatMoney(totalSaved)}
                    </p>
                    <p className="text-sm text-gray-500">
                        de {formatMoney(totalTarget)}
                    </p>
                </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-6">
                    <p className="text-sm text-gray-600 mb-2">Metas</p>
                    <div className="flex items-baseline gap-3">
                        <p className="text-3xl font-bold text-purple-600">{completedGoals}</p>
                        <p className="text-sm text-gray-500">de {activeGoals + completedGoals} completadas</p>
                    </div>
                    <div className="mt-2 flex gap-1">
                        {Array.from({ length: activeGoals + completedGoals }).map((_, i) => (
                            <div
                                key={i}
                                className={`h-2 flex-1 rounded-full ${i < completedGoals ? 'bg-purple-500' : 'bg-gray-200'}`}
                            />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}