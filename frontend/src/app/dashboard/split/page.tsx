'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calculator, UserPlus, Trash2, ArrowRight } from 'lucide-react'
import api from '@/lib/api'
import { toast } from '@/components/ui/use-toast'

interface Person {
  id: string
  name: string
  amount: number
}

export default function SplitPage() {
  const [description, setDescription] = useState('')
  const [people, setPeople] = useState<Person[]>([])
  const [newName, setNewName] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [result, setResult] = useState<{
    total: number
    perPerson: number
    balances: Array<{ name: string; paid: number; shouldPay: number; balance: number }>
    settlements: Array<{ from: string; to: string; amount: number }>
  } | null>(null)
  const [calculating, setCalculating] = useState(false)

  const fmt = (n: number) => '$' + n.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })

  const addPerson = () => {
    if (!newName.trim() || !newAmount) {
      toast({ title: 'Error', type: 'error', description: 'Nombre y monto son requeridos' })
      return
    }
    const amount = parseFloat(newAmount.replace('.', '').replace(',', '.'))
    if (isNaN(amount) || amount < 0) {
      toast({ title: 'Error', type: 'error', description: 'Monto inválido' })
      return
    }
    setPeople([...people, { id: Date.now().toString(), name: newName.trim(), amount }])
    setNewName('')
    setNewAmount('')
  }

  const removePerson = (id: string) => {
    setPeople(people.filter(p => p.id !== id))
  }

  const calculateSplit = async () => {
    if (people.length < 2) {
      toast({ title: 'Error', type: 'error', description: 'Se necesitan al menos 2 personas' })
      return
    }
    setCalculating(true)
    try {
      const res = await api.post('/split', {
        description: description || 'División de gastos',
        payers: people.map(p => ({ name: p.name, amount: p.amount })),
      })
      setResult(res.data)
    } catch (err: any) {
      toast({ title: 'Error', type: 'error', description: err.response?.data?.message || 'Error al calcular' })
    } finally {
      setCalculating(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dividir gastos</h1>
        <p className="text-muted-foreground mt-2">Calculá quién le debe a quién para que todos gasten lo mismo</p>
      </div>

      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Nueva división
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Descripción (opcional)</Label>
            <Input
              placeholder="Ej: Asado, Compra, Viaje..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Participantes</Label>
            {people.length > 0 && (
              <div className="rounded-lg border divide-y">
                {people.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 p-3">
                    <div className="flex-1">
                      <span className="text-sm font-medium">{p.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-primary">{fmt(p.amount)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removePerson(p.id)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <div className="p-3 bg-muted/30 flex items-center justify-between">
                  <span className="text-sm font-medium">Total</span>
                  <span className="font-bold">{fmt(people.reduce((s, p) => s + p.amount, 0))}</span>
                </div>
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <Input
                placeholder="Nombre"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addPerson()}
                className="flex-1"
              />
              <Input
                placeholder="Monto"
                type="number"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addPerson()}
                className="w-32"
              />
              <Button type="button" onClick={addPerson} size="icon">
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button onClick={calculateSplit} disabled={calculating || people.length < 2} className="w-full">
            {calculating ? 'Calculando...' : 'Calcular división'}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Summary */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
              <div className="flex gap-6 text-sm text-muted-foreground">
                <span>Total: <strong className="text-foreground">{fmt(result.total)}</strong></span>
                <span>Por persona: <strong className="text-foreground">{fmt(result.perPerson)}</strong></span>
                <span>Participantes: <strong className="text-foreground">{result.balances.length}</strong></span>
              </div>
            </CardHeader>
          </Card>

          {/* Balances */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle>Balances individuales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {result.balances.map((b, i) => {
                const status = b.balance > 0.01 ? 'positive' : b.balance < -0.01 ? 'negative' : 'even'
                return (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <span className="font-medium">{b.name}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">Pagó: {fmt(b.paid)}</span>
                      <span className={`font-semibold ${
                        status === 'positive' ? 'text-green-600' : status === 'negative' ? 'text-red-600' : 'text-muted-foreground'
                      }`}>
                        {status === 'positive' ? `+${fmt(b.balance)}` : status === 'negative' ? fmt(b.balance) : 'A mano'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Settlements */}
          {result.settlements.length > 0 && (
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Transferencias para igualar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.settlements.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <span className="font-medium text-sm">{s.from}</span>
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">{s.to}</span>
                    <span className="ml-auto font-bold text-primary">{fmt(s.amount)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {result.settlements.length === 0 && (
            <Card className="border-none shadow-lg bg-green-500/5">
              <CardContent className="p-6 text-center">
                <p className="text-lg font-medium text-green-700">¡Todos están a mano! No hay transferencias necesarias.</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
