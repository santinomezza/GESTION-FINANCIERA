'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, Loader2, Pencil, Trash2, CheckCircle, X, Plus, Eye } from 'lucide-react'
import api from '@/lib/api'
import { API_URL } from '@/lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/ui/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

interface Invoice {
  id: string
  invoiceNumber: string
  issueDate: string
  dueDate: string
  totalAmount: number
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  client?: { name: string }
  urlArchivo?: string
}

interface FormData {
  invoiceNumber: string
  issueDate: string
  dueDate: string
  totalAmount: string
  status: string
  clientId: string
}

const emptyForm: FormData = {
  invoiceNumber: '',
  issueDate: '',
  dueDate: '',
  totalAmount: '',
  status: 'PENDING',
  clientId: '',
}

export default function InvoicesPage() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data } = await api.get('/invoices')
      return data
    },
  })

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data } = await api.get('/clients')
      return data
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: Partial<FormData>) => {
      return api.post('/invoices', {
        invoiceNumber: data.invoiceNumber,
        issueDate: data.issueDate,
        dueDate: data.dueDate,
        totalAmount: parseFloat(data.totalAmount || '0'),
        status: data.status,
        clientId: data.clientId || undefined,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast({ title: 'Factura creada', type: 'success' })
      closeDialog()
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.response?.data?.message || 'No se pudo crear', type: 'error' })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<FormData> }) => {
      return api.patch(`/invoices/${id}`, {
        ...data,
        totalAmount: data.totalAmount ? parseFloat(data.totalAmount) : undefined,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast({ title: 'Factura actualizada', type: 'success' })
      closeDialog()
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.response?.data?.message || 'No se pudo actualizar', type: 'error' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/invoices/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast({ title: 'Factura eliminada', type: 'success' })
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.response?.data?.message || 'No se pudo eliminar', type: 'error' })
    },
  })

  const payMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.post(`/invoices/${id}/pay`, { paymentDate: new Date().toISOString() })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast({ title: 'Factura marcada como pagada', type: 'success' })
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.response?.data?.message || 'No se pudo marcar como pagada', type: 'error' })
    },
  })

  const uploadFileMutation = useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const formData = new FormData()
      formData.append('file', file)
      return api.post(`/invoices/${id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast({ title: 'Archivo subido', type: 'success' })
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.response?.data?.message || 'No se pudo subir el archivo', type: 'error' })
    },
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const openCreateDialog = () => {
    setEditingId(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEditDialog = (invoice: Invoice) => {
    setEditingId(invoice.id)
    setForm({
      invoiceNumber: invoice.invoiceNumber,
      issueDate: invoice.issueDate ? invoice.issueDate.split('T')[0] : '',
      dueDate: invoice.dueDate ? invoice.dueDate.split('T')[0] : '',
      totalAmount: String(invoice.totalAmount),
      status: invoice.status,
      clientId: (invoice as any).clientId || '',
    })
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleSubmit = () => {
    if (!form.invoiceNumber || !form.issueDate || !form.totalAmount) {
      toast({ title: 'Completá los campos obligatorios', type: 'warning' })
      return
    }
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: form })
    } else {
      createMutation.mutate(form)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-500/10 text-green-500'
      case 'PENDING': return 'bg-yellow-500/10 text-yellow-500'
      case 'OVERDUE': return 'bg-red-500/10 text-red-500'
      case 'CANCELLED': return 'bg-gray-500/10 text-gray-500'
      default: return 'bg-gray-500/10 text-gray-500'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PAID': return 'PAGADA'
      case 'PENDING': return 'PENDIENTE'
      case 'OVERDUE': return 'VENCIDA'
      case 'CANCELLED': return 'CANCELADA'
      default: return status
    }
  }

  const isMutating = createMutation.isPending || updateMutation.isPending

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Facturas</h1>
          <p className="text-muted-foreground mt-2">Gestioná tus facturas y comprobantes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.href = '/dashboard/invoices/upload'}>
            <Upload className="h-4 w-4 mr-2" />
            Subir Factura
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Factura
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-lg">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : invoices && invoices.length > 0 ? (
            <div className="divide-y">
              {invoices.map((invoice: Invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {invoice.client?.name || 'Sin cliente'} · {new Date(invoice.issueDate).toLocaleDateString('es-AR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">${Number(invoice.totalAmount).toLocaleString('es-AR')}</span>
                    <Badge className={getStatusColor(invoice.status)}>
                      {getStatusLabel(invoice.status)}
                    </Badge>
                    <div className="flex gap-1">
                      {invoice.urlArchivo && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-500/10"
                          onClick={() => window.open(`${API_URL.replace('/api', '')}${invoice.urlArchivo}`, '_blank')}
                          title="Ver factura"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {invoice.status !== 'PAID' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-500/10"
                          onClick={() => payMutation.mutate(invoice.id)}
                          disabled={payMutation.isPending}
                          title="Marcar como pagada"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditDialog(invoice)}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          if (confirm('¿Eliminar esta factura?')) {
                            deleteMutation.mutate(invoice.id)
                          }
                        }}
                        disabled={deleteMutation.isPending}
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Sin facturas</h3>
              <p className="text-muted-foreground mb-4">Creá tu primera factura para comenzar</p>
              <div className="flex justify-center gap-2">
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Factura
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/dashboard/invoices/upload'}>
                  <Upload className="h-4 w-4 mr-2" />
                  Subir Factura
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog() }}>
        <DialogContent className="max-w-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {editingId ? 'Editar Factura' : 'Nueva Factura'}
            </h2>
            <Button variant="ghost" size="icon" onClick={closeDialog}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Número de factura *</Label>
              <Input
                value={form.invoiceNumber}
                onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })}
                placeholder="FAA-0001-00001234"
              />
            </div>

            <div className="space-y-1">
              <Label>Cliente</Label>
              <Select value={form.clientId} onValueChange={(v) => setForm({ ...form, clientId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin cliente</SelectItem>
                  {clients?.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Fecha de emisión *</Label>
                <Input
                  type="date"
                  value={form.issueDate}
                  onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Fecha de vencimiento</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Monto total *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.totalAmount}
                  onChange={(e) => setForm({ ...form, totalAmount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1">
                <Label>Estado</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pendiente</SelectItem>
                    <SelectItem value="PAID">Pagada</SelectItem>
                    <SelectItem value="OVERDUE">Vencida</SelectItem>
                    <SelectItem value="CANCELLED">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label>Archivo adjunto</Label>
              <Input
                type="file"
                ref={fileInputRef}
                accept="application/pdf,image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f && editingId) {
                    uploadFileMutation.mutate({ id: editingId, file: f })
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }
                }}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={closeDialog}>Cancelar</Button>
              <Button onClick={handleSubmit} disabled={isMutating}>
                {isMutating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {editingId ? 'Guardar cambios' : 'Crear factura'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
