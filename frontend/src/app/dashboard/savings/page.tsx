'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PiggyBank, Plus, Trash2, Target } from 'lucide-react'
import api from '@/lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/ui/use-toast'
import { GoalProgressCard, SavingsStats } from '@/components/charts/progress-ring'

export default function SavingsPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '', targetAmount: '', category: '', targetDate: '' })

  const { data: goals } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const { data } = await api.get('/goals')
      return data
    },
  })

  const { data: stats } = useQuery({
    queryKey: ['goals-stats'],
    queryFn: async () => {
      const { data } = await api.get('/goals/stats')
      return data
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/goals', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      queryClient.invalidateQueries({ queryKey: ['goals-stats'] })
      setShowForm(false)
      setFormData({ name: '', description: '', targetAmount: '', category: '', targetDate: '' })
      toast({ title: 'Meta creada', type: 'success' })
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.response?.data?.message || 'Error al crear meta', type: 'error' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/goals/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      queryClient.invalidateQueries({ queryKey: ['goals-stats'] })
      toast({ title: 'Meta eliminada', type: 'success' })
    },
  })

  const toggleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await api.patch(`/goals/${id}`, data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      queryClient.invalidateQueries({ queryKey: ['goals-stats'] })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      ...formData,
      targetAmount: parseFloat(formData.targetAmount),
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ahorros</h1>
          <p className="text-muted-foreground mt-2">Definí metas y seguí tu progreso</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Meta
        </Button>
      </div>

      {stats && (
        <SavingsStats
          totalTarget={parseFloat(stats.totalTarget)}
          totalSaved={parseFloat(stats.totalSaved)}
          completionRate={stats.completionRate}
          activeGoals={stats.activeGoals}
          completedGoals={stats.completedGoals}
        />
      )}

      {showForm && (
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Nueva Meta</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Nombre</Label>
                  <Input
                    placeholder="Ej: Vacaciones"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Monto objetivo</Label>
                  <Input
                    type="number"
                    placeholder="100000"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Categoría</Label>
                  <Input
                    placeholder="Ej: vacation, car, home"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Fecha objetivo</Label>
                  <Input
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Guardando...' : 'Crear meta'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {goals && goals.length === 0 && (
        <Card className="border-none shadow-lg">
          <CardContent className="p-12 text-center">
            <PiggyBank className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Sin metas de ahorro</h3>
            <p className="text-muted-foreground">Creá tu primera meta para empezar a ahorrar</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals?.map((goal: any) => {
          const currentAmount = Number(goal.currentAmount) || 0
          const targetAmount = Number(goal.targetAmount) || 0

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <GoalProgressCard
                name={goal.name}
                currentAmount={currentAmount}
                targetAmount={targetAmount}
                color={goal.isCompleted ? '#10b981' : '#8b5cf6'}
              />
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
