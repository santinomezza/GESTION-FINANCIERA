'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserPlus, Trash2, Search, FileText, ExternalLink } from 'lucide-react'
import api from '@/lib/api'
import { API_URL } from '@/lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/ui/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface ClientInvoice {
  id: string
  invoiceNumber: string
  issueDate: string
  totalAmount: number
  status: string
  urlArchivo?: string
}

export default function ClientsPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', cuit: '', email: '', phone: '', address: '' })
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [invoicesDialogOpen, setInvoicesDialogOpen] = useState(false)

  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data } = await api.get('/clients')
      return data
    },
  })

  const { data: clientInvoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ['client-invoices', selectedClient?.id],
    queryFn: async () => {
      if (!selectedClient?.id) return []
      const { data } = await api.get(`/invoices?clientId=${selectedClient.id}`)
      return data
    },
    enabled: !!selectedClient?.id,
  })

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/clients', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      setShowForm(false)
      setFormData({ name: '', cuit: '', email: '', phone: '', address: '' })
      toast({ title: 'Cliente creado', type: 'success' })
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.response?.data?.message || 'Error al crear cliente', type: 'error' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/clients/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast({ title: 'Cliente eliminado', type: 'success' })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  const handleViewInvoices = (client: any) => {
    setSelectedClient(client)
    setInvoicesDialogOpen(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground mt-2">Gestioná tu cartera de clientes</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      {showForm && (
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Nuevo Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Nombre / Razón Social *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>CUIT</Label>
                  <Input
                    value={formData.cuit}
                    onChange={(e) => setFormData({ ...formData, cuit: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Teléfono</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Guardando...' : 'Crear cliente'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="border-none shadow-lg">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : clients && clients.length > 0 ? (
            <div className="divide-y">
              {clients.map((client: any) => (
                <div key={client.id} className="flex items-center justify-between p-4 gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{client.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {client.cuit ? `CUIT: ${client.cuit}` : 'Sin CUIT'}
                      {client.email && ` · ${client.email}`}
                    </p>
                    <p className="text-xs text-blue-600 mt-1 cursor-pointer" onClick={() => handleViewInvoices(client)}>
                      📄 Ver facturas ({clientInvoices?.length || 0})
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm('¿Eliminar cliente?')) deleteMutation.mutate(client.id)
                    }}
                    className="shrink-0"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-12">
              <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Sin clientes</h3>
              <p className="text-muted-foreground">Agregá tu primer cliente para comenzar</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={invoicesDialogOpen} onOpenChange={setInvoicesDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Facturas de {selectedClient?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {invoicesLoading ? (
              <div className="text-center py-8">Cargando...</div>
            ) : clientInvoices?.length > 0 ? (
              <div className="divide-y">
                {clientInvoices.map((inv: ClientInvoice) => (
                  <div key={inv.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium">{inv.invoiceNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(inv.issueDate).toLocaleDateString('es-AR')} · ${Number(inv.totalAmount).toLocaleString('es-AR')}
                      </p>
                    </div>
                    {inv.urlArchivo && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`${API_URL.replace('/api', '')}${inv.urlArchivo}`, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">Sin facturas</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
