'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import { Category } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import {
  Search, Plus, Tags, Star, GripVertical, Loader2, ArrowUpCircle, ArrowDownCircle, X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/useAuthStore'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

export default function CategoriesPage() {
  const queryClient = useQueryClient()
  const { activeWorkspaceId } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [showDialog, setShowDialog] = useState(false)
  const [formData, setFormData] = useState({ name: '', type: 'EXPENSE', color: '#385144', icon: 'tag' })

  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['categories', activeWorkspaceId],
    queryFn: async () => {
      const { data } = await api.get('/categories')
      return data as Category[]
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/categories', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setShowDialog(false)
      setFormData({ name: '', type: 'EXPENSE', color: '#385144', icon: 'tag' })
      toast({ title: 'Categoría creada', type: 'success' })
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.response?.data?.message || 'Error', type: 'error' })
    },
  })

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (category: Category) => {
      await api.patch(`/categories/${category.id}`, { isFavorite: !category.isFavorite })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-expenses'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-income'] })
    },
  })

  const filteredCategories = categoriesData?.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const incomeCategories = filteredCategories.filter(c => c.type === 'INCOME')
  const expenseCategories = filteredCategories.filter(c => c.type === 'EXPENSE')

  const renderCategoryList = (title: string, icon: any, categories: Category[], typeColor: string) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2 text-muted-foreground">
        {icon} {title}
      </h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {categories.map((cat) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              layout
              className="flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <GripVertical className="h-4 w-4 text-muted-foreground/30 cursor-grab hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: cat.color || typeColor }}
                />
                <span className="font-medium">{cat.name}</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  "h-8 w-8",
                  cat.isFavorite ? "text-yellow-500 hover:text-yellow-600" : "text-muted-foreground hover:text-yellow-500"
                )}
                onClick={() => toggleFavoriteMutation.mutate(cat)}
              >
                <Star className="h-4 w-4" fill={cat.isFavorite ? "currentColor" : "none"} />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {categories.length === 0 && (
          <div className="col-span-full py-8 text-center text-sm text-muted-foreground border border-dashed rounded-xl">
            No hay categorías de este tipo
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categorías</h1>
          <p className="text-muted-foreground">Administra cómo clasificas tus movimientos.</p>
        </div>
        <Button className="shrink-0" onClick={() => setShowDialog(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nueva Categoría
        </Button>
      </div>

      <Card className="glass-card">
        <CardContent className="p-4 sm:p-6">
          <div className="relative mb-8 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar categoría..." 
              className="pl-9 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-8">
              {renderCategoryList(
                'Ingresos', 
                <ArrowUpCircle className="h-5 w-5 text-green-500" />, 
                incomeCategories, 
                '#22c55e'
              )}
              {renderCategoryList(
                'Gastos', 
                <ArrowDownCircle className="h-5 w-5 text-red-500" />, 
                expenseCategories, 
                '#ef4444'
              )}
            </div>
          )}
          </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Categoría</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault()
            if (!formData.name) {
              toast({ title: 'Error', description: 'El nombre es requerido', type: 'error' })
              return
            }
            createMutation.mutate({
              name: formData.name,
              type: formData.type,
              color: formData.color,
              icon: formData.icon,
            })
          }} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nombre</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EXPENSE">Gasto</SelectItem>
                    <SelectItem value="INCOME">Ingreso</SelectItem>
                    <SelectItem value="MIXED">Mixto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Color</Label>
                <Input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="h-10"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Guardando...' : 'Crear'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
