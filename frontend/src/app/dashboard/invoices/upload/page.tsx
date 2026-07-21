'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, FileText, Loader2, ArrowLeft, CheckCircle } from 'lucide-react'
import api from '@/lib/api'
import { toast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'

export default function InvoiceUploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [extracted, setExtracted] = useState<any>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      if (selected.type !== 'application/pdf' && !selected.type.startsWith('image/')) {
        toast({ title: 'Error', description: 'Solo se permiten PDF o imágenes', type: 'error' })
        return
      }
      setFile(selected)
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await api.post('/invoices/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setExtracted(res.data.extracted)
      setFile(null)
      if (fileInput.current) fileInput.current.value = ''
      toast({ title: 'Factura procesada', description: `Factura #${res.data.invoice.invoiceNumber} creada`, type: 'success' })
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Error al procesar factura', type: 'error' })
    } finally {
      setUploading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subir Factura</h1>
          <p className="text-muted-foreground">Subí un PDF o imagen de factura para extraer datos automáticamente</p>
        </div>
      </div>

      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Subir archivo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Seleccioná tu factura</Label>
            <div className="flex gap-2">
              <Input
                ref={fileInput}
                type="file"
                accept="application/pdf,image/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-input"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-dashed"
                onClick={() => fileInput.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Seleccionar archivo
              </Button>
            </div>
          </div>

          {file && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium truncate">{file.name}</span>
              <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)}KB</span>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Procesar Factura
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {extracted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Datos extraídos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Fecha', value: extracted.fecha },
                  { label: 'Cliente', value: extracted.cliente },
                  { label: 'CUIT', value: extracted.cuit },
                  { label: 'Razón Social', value: extracted.razonSocial },
                  { label: 'N° Ticket', value: extracted.numeroTicket },
                  { label: 'Neto', value: `$${extracted.neto?.toLocaleString('es-AR')}` },
                  { label: 'IVA %', value: extracted.ivaPorcentaje ? `${extracted.ivaPorcentaje}%` : '-' },
                  { label: 'Total', value: `$${extracted.total?.toLocaleString('es-AR')}` },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-medium">{item.value || '-'}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Confianza: {(extracted.confidence * 100).toFixed(0)}%
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
