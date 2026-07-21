'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { formatMoney, formatDate, cn } from '@/lib/utils'
import { Transaction, Category, WorkspaceMember } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import { 
  ArrowDownRight, ArrowUpRight, Search, Plus, 
  Copy, Trash2, Loader2, FolderPlus
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
import { PageHeader } from '@/components/pyme/page-header'

export default function TransactionsPage() {
  const queryClient = useQueryClient()
  const { activeWorkspaceId } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('ALL')
  const [filterUserId, setFilterUserId] = useState<string>('')
  const [showDialog, setShowDialog] = useState(false)
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [formData, setFormData] = useState({ type: 'EXPENSE', amount: '', categoryId: '', categoryName: '', description: '', date: '' })
  const [newCategory, setNewCategory] = useState({ name: '', type: 'EXPENSE' })

  const handleTypeChange = (value: string) => {
    setFormData({ ...formData, type: value, categoryId: '' })
    setNewCategory({ ...newCategory, type: value })
  }

  const handleNewCategoryDialogOpen = () => {
    setNewCategory({ name: '', type: formData.type })
    setShowCategoryDialog(true)
  }

  const { data: transactionsData, isLoading, isError: transactionsError } = useQuery({
    queryKey: ['transactions', activeWorkspaceId, filterType, searchTerm, filterUserId],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filterType !== 'ALL') params.set('type', filterType)
      if (searchTerm) params.set('search', searchTerm)
      if (filterUserId) params.set('createdById', filterUserId)
      const { data } = await api.get(`/transactions?${params.toString()}`)
      return data as Transaction[]
    },
  })

  const usersQuery = useQuery({
    queryKey: ['workspace-members', activeWorkspaceId],
    queryFn: async () => {
      const { data } = await api.get('/workspace-members')
      return data as WorkspaceMember[]
    },
    enabled: !!activeWorkspaceId,
  })

  const categoriesQuery = useQuery({
    queryKey: ['categories', activeWorkspaceId],
    queryFn: async () => {
      const { data } = await api.get('/categories')
      return data as Category[]
    },
    enabled: !!activeWorkspaceId,
  })

  const createCategoryMutation = useMutation({
    mutationFn: async (data: { name: string; type: string }) => {
      const res = await api.post('/categories', data)
      return res.data
    },
    onSuccess: (newCat: Category) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setFormData({ ...formData, categoryId: newCat.id })
      setNewCategory({ name: '', type: 'EXPENSE' })
      setShowCategoryDialog(false)
      toast({ title: 'Categoría creada', type: 'success' })
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.response?.data?.message || 'No se pudo crear la categoría', type: 'error' })
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/transactions', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-expenses'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-income'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-profitability'] })
      setShowDialog(false)
      setFormData({ type: 'EXPENSE', amount: '', categoryId: '', categoryName: '', description: '', date: '' })
      toast({ title: 'Movimiento creado', type: 'success' })
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.response?.data?.message || 'No se pudo crear el movimiento', type: 'error' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/transactions/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-expenses'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-income'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-profitability'] })
      toast({ title: 'Movimiento eliminado', type: 'success' })
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.response?.data?.message || 'No se pudo eliminar el movimiento', type: 'error' })
    },
  })

  const duplicateMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/transactions/${id}/duplicate`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-expenses'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-income'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-profitability'] })
      toast({ title: 'Movimiento duplicado', type: 'success' })
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.response?.data?.message || 'No se pudo duplicar el movimiento', type: 'error' })
    },
  })

  const filteredTransactions = (transactionsData || []).filter((tx: Transaction) => 
    tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Movimientos</CardTitle>
            <CardDescription>Gestiona tus ingresos y gastos.</CardDescription>
          </div>
          <Button className="shrink-0" onClick={() => setShowDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Movimiento
          </Button>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
             <div className="relative flex-1">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <Input 
                 placeholder="Buscar por descripción o categoría..." 
                 className="pl-9 bg-background"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
             </div>
             <div className="flex gap-2">
               <Button 
                 variant={filterType === 'ALL' ? 'default' : 'outline'} 
                 onClick={() => setFilterType('ALL')}
               >
                 Todos
               </Button>
               <Button 
                 variant={filterType === 'INCOME' ? 'default' : 'outline'} 
                 onClick={() => setFilterType('INCOME')}
                 className={filterType === 'INCOME' ? 'bg-green-600 hover:bg-green-700' : ''}
               >
                 Ingresos
               </Button>
               <Button 
                 variant={filterType === 'EXPENSE' ? 'default' : 'outline'} 
                 onClick={() => setFilterType('EXPENSE')}
                 className={filterType === 'EXPENSE' ? 'bg-red-600 hover:bg-red-700' : ''}
               >
                 Gastos
               </Button>
             </div>
             <Select value={filterUserId} onValueChange={(v) => setFilterUserId(v === '__all__' ? '' : v)}>
               <SelectTrigger className="w-[220px]">
                 <SelectValue placeholder="Filtrar por usuario" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="__all__">Todos los usuarios</SelectItem>
                 {(usersQuery.data || []).map((member: WorkspaceMember) => {
                   const label = member.displayName || member.user?.name || member.user?.email || 'Usuario'
                   return (
                     <SelectItem key={member.userId} value={member.userId}>
                       {label}
                     </SelectItem>
                   )
                 })}
               </SelectContent>
             </Select>
           </div>

          {isLoading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              No se encontraron movimientos.
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredTransactions.map((tx: Transaction) => {
                  const isIncome = tx.type === 'INCOME'
                  return (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      layout
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border bg-card hover:bg-accent/50 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "p-3 rounded-xl shrink-0",
                          isIncome ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                                   : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                        )}>
                          {isIncome ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-semibold">{tx.category?.name || 'Sin categoría'}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">{tx.description || 'Sin descripción'}</p>
                          {tx.createdBy && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Cargado por: {tx.createdBy.name || tx.createdBy.email}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/3">
                        <div className="text-right">
                          <p className={cn(
                            "font-bold whitespace-nowrap",
                            isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          )}>
                            {isIncome ? '+' : '-'}{formatMoney(Number(tx.amount))}
                          </p>
                          <p className="text-xs text-muted-foreground">{formatDate(tx.date)}</p>
                        </div>
                        
                        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => duplicateMutation.mutate(tx.id)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteMutation.mutate(tx.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Movimiento</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault()
            if (!formData.amount) {
              toast({ title: 'Error', description: 'Monto es requerido', type: 'error' })
              return
            }
            const data = {
              type: formData.type,
              amount: parseFloat(formData.amount),
              categoryId: formData.categoryId || undefined,
              categoryName: !formData.categoryId && formData.categoryName ? formData.categoryName : undefined,
              description: formData.description,
              date: formData.date ? `${formData.date}T00:00:00.000Z` : new Date().toISOString(),
              paymentMethod: 'CASH',
              status: 'CONFIRMED',
            }
            createMutation.mutate(data)
          }} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={formData.type} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXPENSE">Gasto</SelectItem>
                  <SelectItem value="INCOME">Ingreso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Monto</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Categoría</Label>
              <Select value={formData.categoryId} onValueChange={(v) => {
                if (v === '__add_new__') {
                  handleNewCategoryDialogOpen()
                } else if (v === '__custom__') {
                  setFormData({ ...formData, categoryId: '', categoryName: '' })
                } else {
                  setFormData({ ...formData, categoryId: v, categoryName: '' })
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {(categoriesQuery.data || [])
                    .filter((cat: Category) => cat.type === formData.type || cat.type === 'MIXED')
                    .map((cat: Category) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  <div className="h-px bg-border my-2" />
                  <SelectItem value="__custom__" className="text-primary hover:text-primary focus:text-primary">
                    <span className="flex items-center gap-2">
                      <FolderPlus className="h-4 w-4" />
                      Escribir nombre...
                    </span>
                  </SelectItem>
                  <SelectItem value="__add_new__" className="text-primary hover:text-primary focus:text-primary">
                    <span className="flex items-center gap-2">
                      <FolderPlus className="h-4 w-4" />
                      Nueva categoría...
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              {!formData.categoryId && (
                <Input
                  placeholder="Nombre de la categoría (se crea automáticamente)"
                  value={formData.categoryName}
                  onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                  className="mt-2"
                />
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Descripción</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
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

      <Dialog open={showCategoryDialog} onOpenChange={(open) => {
          setShowCategoryDialog(open)
          if (!open) {
            setNewCategory({ name: '', type: formData.type })
          }
        }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Categoría</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault()
            if (!newCategory.name) {
              toast({ title: 'Error', description: 'El nombre es requerido', type: 'error' })
              return
            }
            createCategoryMutation.mutate(newCategory)
          }} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nombre</Label>
              <Input
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="Ej: Comida, Transporte, etc."
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={newCategory.type} onValueChange={(v) => setNewCategory({ ...newCategory, type: v })}>
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
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowCategoryDialog(false)}>Cancelar</Button>
              <Button type="submit" disabled={createCategoryMutation.isPending}>
                {createCategoryMutation.isPending ? 'Guardando...' : 'Crear'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
