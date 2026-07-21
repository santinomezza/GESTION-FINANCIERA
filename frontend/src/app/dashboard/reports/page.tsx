'use client'

import { useState } from 'react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/useAuthStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from '@/components/ui/use-toast'

export default function ReportsPage() {
  const { activeWorkspaceId } = useAuthStore()
  const [isExportingCSV, setIsExportingCSV] = useState(false)
  const [isExportingExcel, setIsExportingExcel] = useState(false)
  
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    type: '',
  })

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const isCsv = format === 'csv'
      if (isCsv) setIsExportingCSV(true)
      else setIsExportingExcel(true)

      const queryParams = new URLSearchParams()
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom)
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo)
      if (filters.type) queryParams.append('type', filters.type)
      if (activeWorkspaceId) queryParams.append('workspaceId', activeWorkspaceId)

      const response = await api.get(`/reports/export/${format}?${queryParams.toString()}`, {
        responseType: 'blob'
      })

      // Descargar archivo
      const blob = new Blob([response.data])
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `gestionar2_reporte_${new Date().toISOString().split('T')[0]}.${isCsv ? 'csv' : 'xlsx'}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(downloadUrl)

      toast({ title: 'Reporte generado con éxito', type: 'success' })
    } catch (error) {
      toast({ title: 'Error al exportar', description: 'Intenta nuevamente', type: 'error' })
    } finally {
      setIsExportingCSV(false)
      setIsExportingExcel(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
          <p className="text-muted-foreground">Exporta tus movimientos para analizarlos en detalle.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Filtros de Exportación</CardTitle>
              <CardDescription>Personaliza los datos que quieres exportar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fecha Desde</label>
                  <Input 
                    type="date" 
                    value={filters.dateFrom}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fecha Hasta</label>
                  <Input 
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Movimiento</label>
                <select 
                  className="flex h-11 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background"
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="">Todos</option>
                  <option value="INCOME">Ingresos</option>
                  <option value="EXPENSE">Gastos</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <Card className="glass-card bg-primary/5 border-primary/20 hover:border-primary/50 transition-colors">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-primary font-semibold">
                    <FileSpreadsheet className="h-5 w-5" />
                    Exportar a Excel
                  </div>
                  <p className="text-sm text-muted-foreground">Incluye gráficos y formato enriquecido</p>
                </div>
                <Button onClick={() => handleExport('excel')} disabled={isExportingExcel} className="shrink-0 bg-green-600 hover:bg-green-700">
                  {isExportingExcel ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                  .XLSX
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card className="glass-card hover:border-primary/30 transition-colors">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 font-semibold">
                    <FileText className="h-5 w-5" />
                    Exportar a CSV
                  </div>
                  <p className="text-sm text-muted-foreground">Formato plano compatible con cualquier sistema</p>
                </div>
                <Button variant="outline" onClick={() => handleExport('csv')} disabled={isExportingCSV} className="shrink-0">
                  {isExportingCSV ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                  .CSV
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
