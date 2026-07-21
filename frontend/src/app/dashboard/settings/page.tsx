'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import api from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, MessageCircle, Copy, Loader2, Link as LinkIcon, Smartphone, Unlink as UnlinkIcon, Plus, Building2, User, Trash2, Pencil, X, Check, Shield, DollarSign, FileText, PieChart, SplitSquareVertical as SplitIcon, PiggyBank, Users, Receipt, Tags, ListOrdered, Settings as SettingsIcon, Globe, Bell, Calendar } from 'lucide-react'
import InvitationManager from '@/components/dashboard/invitation-manager'
import { getAllFeatures } from '@/components/layout/nav-items'

export default function SettingsPage() {
  const { user, setUser, workspaces, setWorkspaces, activeWorkspaceId, setActiveWorkspace } = useAuthStore()
  const [telegramCode, setTelegramCode] = useState('')
  const [isLinking, setIsLinking] = useState(false)
  const [isUnlinking, setIsUnlinking] = useState(false)
  const [showNewWorkspace, setShowNewWorkspace] = useState(false)
  const [newWorkspaceName, setNewWorkspaceName] = useState('')
  const [newWorkspaceType, setNewWorkspaceType] = useState<'PERSONAL' | 'BUSINESS' | 'JOIN'>('BUSINESS')
  const [isCreating, setIsCreating] = useState(false)
  const [editingWorkspace, setEditingWorkspace] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const isLinked = !!user?.telegramId

  const updatePreference = async (key: string, value: any) => {
    try {
      const currentPrefs = user?.preferences || {}
      const { data } = await api.put('/users/me', {
        preferences: { ...currentPrefs, [key]: value }
      })
      setUser(data)
      toast({ title: 'Preferencia guardada' })
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.message || 'No se pudo guardar', type: 'error' })
    }
  }

  const updateNotificationPreference = async (key: string, value: boolean) => {
    try {
      const currentPrefs = user?.preferences || {}
      const currentNotifications = currentPrefs.notifications || { email: true, push: true, telegram: true }
      const { data } = await api.put('/users/me', {
        preferences: {
          ...currentPrefs,
          notifications: { ...currentNotifications, [key]: value }
        }
      })
      setUser(data)
      toast({ title: 'Preferencia guardada' })
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.message || 'No se pudo guardar', type: 'error' })
    }
  }

  const loadWorkspaces = async () => {
    try {
      const { data } = await api.get('/workspaces')
      setWorkspaces(data)
    } catch {
      toast({ title: 'Error', description: 'No se pudieron cargar los espacios', type: 'error' })
    }
  }

  useEffect(() => {
    loadWorkspaces()
  }, [])

  const handleLink = async () => {
    if (!telegramCode) return
    setIsLinking(true)
    try {
      const { data } = await api.post('/users/me/telegram/link', { telegramId: telegramCode })
      setUser(data)
      toast({ title: 'Telegram vinculado', description: 'Ya podés usar el bot.' })
      setTelegramCode('')
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Código inválido', type: 'error' })
    } finally {
      setIsLinking(false)
    }
  }

  const handleUnlink = async () => {
    setIsUnlinking(true)
    try {
      const { data } = await api.post('/users/me/telegram/unlink')
      setUser(data)
      toast({ title: 'Telegram desvinculado' })
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.message || 'No se pudo desvincular', type: 'error' })
    } finally {
      setIsUnlinking(false)
    }
  }

  const handleCopyBot = () => {
    navigator.clipboard.writeText('@GESTIONATEBOT')
    toast({ title: 'Copiado al portapapeles' })
  }

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) {
      toast({ title: 'Error', description: 'Ingresá un nombre', type: 'error' })
      return
    }
    setIsCreating(true)
    try {
      await api.post('/workspaces', { name: newWorkspaceName.trim(), type: newWorkspaceType })
      toast({ title: 'Espacio creado', description: `"${newWorkspaceName}" fue creado exitosamente` })
      setNewWorkspaceName('')
      setShowNewWorkspace(false)
      loadWorkspaces()
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.message || 'No se pudo crear', type: 'error' })
    } finally {
      setIsCreating(false)
    }
  }

  const handleJoinWorkspace = async () => {
    let finalCode = newWorkspaceName.trim()
    if (!finalCode) {
      toast({ title: 'Error', description: 'Ingresá el código o enlace', type: 'error' })
      return
    }

    if (finalCode.includes('join?code=')) {
      try {
        const url = new URL(finalCode)
        finalCode = url.searchParams.get('code') || finalCode
      } catch (e) {
        finalCode = finalCode.split('?code=')[1] || finalCode
      }
    }

    setIsCreating(true)
    try {
      await api.post('/workspaces/join', { code: finalCode })
      toast({ title: 'Éxito', description: `Te uniste al espacio correctamente` })
      setNewWorkspaceName('')
      setShowNewWorkspace(false)
      loadWorkspaces()
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Código inválido o expirado', type: 'error' })
    } finally {
      setIsCreating(false)
    }
  }

  const handleStartEdit = (workspaceId: string, currentName: string) => {
    setEditingWorkspace(workspaceId)
    setEditName(currentName)
  }

  const handleSaveEdit = async (workspaceId: string) => {
    if (!editName.trim()) {
      toast({ title: 'Error', description: 'El nombre no puede estar vacío', type: 'error' })
      return
    }
    try {
      await api.patch(`/workspaces/${workspaceId}`, { name: editName.trim() })
      toast({ title: 'Nombre actualizado', description: `Ahora se llama "${editName}"` })
      setEditingWorkspace(null)
      setEditName('')
      loadWorkspaces()
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.message || 'No se pudo actualizar', type: 'error' })
    }
  }

  const handleDeleteWorkspace = async (workspaceId: string, workspaceName: string) => {
    if (!window.confirm(`¿Estás seguro de que querés eliminar "${workspaceName}"? Se borrarán todos sus datos (transacciones, facturas, clientes).`)) {
      return
    }
    setIsDeleting(workspaceId)
    try {
      await api.delete(`/workspaces/${workspaceId}`)
      toast({ title: 'Espacio eliminado', description: `"${workspaceName}" fue eliminado` })
      if (activeWorkspaceId === workspaceId) {
        const remaining = workspaces.filter(w => w.id !== workspaceId)
        if (remaining.length > 0) {
          setActiveWorkspace(remaining[0].id)
        }
      }
      loadWorkspaces()
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.message || 'No se pudo eliminar', type: 'error' })
    } finally {
      setIsDeleting(null)
    }
  }

  const personalWorkspaces = workspaces.filter(w => w.type === 'PERSONAL')
  const businessWorkspaces = workspaces.filter(w => w.type === 'BUSINESS')

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Administrá tus espacios de trabajo y vinculaciones.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Espacios de Trabajo
                </CardTitle>
                <CardDescription>Gestioná tus espacios personales y negocios</CardDescription>
              </div>
              <Button onClick={() => setShowNewWorkspace(!showNewWorkspace)} size="sm" className="rounded-xl">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <AnimatePresence>
              {showNewWorkspace && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 border border-border/50 rounded-xl bg-muted/20 space-y-3"
                >
                  <div className="flex gap-2">
                    <Button
                      variant={newWorkspaceType === 'PERSONAL' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNewWorkspaceType('PERSONAL')}
                      className="flex-1 rounded-xl"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Personal
                    </Button>
                    <Button
                      variant={newWorkspaceType === 'BUSINESS' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNewWorkspaceType('BUSINESS')}
                      className="flex-1 rounded-xl"
                    >
                      <Building2 className="h-4 w-4 mr-2" />
                      Negocio
                    </Button>
                    <Button
                      variant={newWorkspaceType === 'JOIN' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNewWorkspaceType('JOIN')}
                      className="flex-1 rounded-xl"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Unirse
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder={
                        newWorkspaceType === 'JOIN'
                          ? 'Ej: A1B2C3D4'
                          : newWorkspaceType === 'PERSONAL'
                            ? 'Ej: Mis finanzas'
                            : 'Ej: Mi negocio'
                      }
                      value={newWorkspaceName}
                      onChange={(e) => setNewWorkspaceName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (newWorkspaceType === 'JOIN' ? handleJoinWorkspace() : handleCreateWorkspace())}
                      className="rounded-xl"
                    />
                    <Button onClick={newWorkspaceType === 'JOIN' ? handleJoinWorkspace : handleCreateWorkspace} disabled={isCreating} className="rounded-xl">
                      {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : newWorkspaceType === 'JOIN' ? 'Unirse' : 'Crear'}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {personalWorkspaces.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <User className="h-3.5 w-3.5" />
                  Personal
                </h4>
                <div className="space-y-2">
                  {personalWorkspaces.map(ws => (
                    <motion.div
                      key={ws.id}
                      layout
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${activeWorkspaceId === ws.id
                          ? 'bg-emerald-500/10 border-emerald-500/30 shadow-sm'
                          : 'bg-muted/20 border-border/30 hover:bg-muted/40'
                        }`}
                    >
                      <button
                        onClick={() => setActiveWorkspace(ws.id)}
                        className="flex items-center gap-2.5 flex-1 min-w-0"
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                          <User className="h-4 w-4 text-emerald-600" />
                        </div>
                        {editingWorkspace === ws.id ? (
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(ws.id)}
                            className="h-8 rounded-lg"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span className="font-medium truncate">{ws.name}</span>
                        )}
                      </button>
                      <div className="flex items-center gap-1">
                        {editingWorkspace === ws.id ? (
                          <>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleSaveEdit(ws.id)}>
                              <Check className="h-4 w-4 text-emerald-600" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingWorkspace(null)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            {activeWorkspaceId === ws.id && (
                              <span className="text-[10px] bg-emerald-500/20 text-emerald-700 px-2 py-1 rounded-full font-medium mr-1">Activo</span>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleStartEdit(ws.id, ws.name)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {businessWorkspaces.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5" />
                  Negocios
                </h4>
                <div className="space-y-2">
                  {businessWorkspaces.map(ws => (
                    <motion.div
                      key={ws.id}
                      layout
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${activeWorkspaceId === ws.id
                          ? 'bg-blue-500/10 border-blue-500/30 shadow-sm'
                          : 'bg-muted/20 border-border/30 hover:bg-muted/40'
                        }`}
                    >
                      <button
                        onClick={() => setActiveWorkspace(ws.id)}
                        className="flex items-center gap-2.5 flex-1 min-w-0"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-blue-600" />
                        </div>
                        {editingWorkspace === ws.id ? (
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(ws.id)}
                            className="h-8 rounded-lg"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span className="font-medium truncate">{ws.name}</span>
                        )}
                      </button>
                      <div className="flex items-center gap-1">
                        {editingWorkspace === ws.id ? (
                          <>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleSaveEdit(ws.id)}>
                              <Check className="h-4 w-4 text-emerald-600" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingWorkspace(null)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            {activeWorkspaceId === ws.id && (
                              <span className="text-[10px] bg-blue-500/20 text-blue-700 px-2 py-1 rounded-full font-medium mr-1">Activo</span>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleStartEdit(ws.id, ws.name)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteWorkspace(ws.id, ws.name)}
                              disabled={isDeleting === ws.id}
                            >
                              {isDeleting === ws.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                            </Button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {workspaces.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Building2 className="h-14 w-14 mx-auto mb-4 opacity-30" />
                <p className="font-medium">No tenés espacios de trabajo</p>
                <p className="text-sm mt-1">Creá uno para comenzar a registrar movimientos</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-500" />
              Integración Telegram
            </CardTitle>
            <CardDescription>Conectá tu cuenta para usar el bot</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLinked ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-emerald-700">Cuenta vinculada</h4>
                  <p className="text-sm text-emerald-600/80 mt-1">@{user.telegramUsername || user.telegramId}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 text-red-600 border-red-200 hover:bg-red-50 rounded-xl"
                    onClick={handleUnlink}
                    disabled={isUnlinking}
                  >
                    {isUnlinking ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UnlinkIcon className="h-4 w-4 mr-2" />}
                    Desvincular
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-primary/5 rounded-xl p-4 space-y-2">
                  <h4 className="font-medium text-sm">¿Cómo vincular?</h4>
                  <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
                    <li>Buscá <button onClick={handleCopyBot} className="text-primary font-medium hover:underline inline-flex items-center">@GESTIONATEBOT <Copy className="h-3 w-3" /></button></li>
                    <li>Enviá <span className="font-mono bg-muted px-1 rounded text-xs">/start</span></li>
                    <li>Copiá tu ID y pegalo ací:</li>
                  </ol>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ej: 123456789"
                    value={telegramCode}
                    onChange={(e) => setTelegramCode(e.target.value)}
                    className="font-mono text-center rounded-xl"
                  />
                  <Button onClick={handleLink} disabled={!telegramCode || isLinking} className="rounded-xl">
                    {isLinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <LinkIcon className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <InvitationManager />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-500" />
              Herramientas del Sistema
            </CardTitle>
            <CardDescription>Activá o desactivá las herramientas que querés usar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {getAllFeatures().map((feature) => {
                const currentWorkspace = workspaces.find(w => w.id === activeWorkspaceId)
                const isEnabled = (currentWorkspace?.enabledFeatures || ['transactions', 'categories', 'income', 'expenses']).includes(feature.id)
                const Icon = feature.icon

                return (
                  <div key={feature.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{feature.name}</p>
                        <p className="text-xs text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={isEnabled ? 'default' : 'outline'}
                      onClick={async () => {
                        if (!currentWorkspace) return
                        const newFeatures = isEnabled
                          ? (currentWorkspace.enabledFeatures || []).filter(f => f !== feature.id)
                          : [...(currentWorkspace.enabledFeatures || []), feature.id]
                        try {
                          await api.patch(`/workspaces/${currentWorkspace.id}`, { enabledFeatures: newFeatures })
                          loadWorkspaces()
                          toast({ title: isEnabled ? 'Herramienta desactivada' : 'Herramienta activada' })
                        } catch (error: any) {
                          toast({ title: 'Error', description: error.response?.data?.message, type: 'error' })
                        }
                      }}
                    >
                      {isEnabled ? 'Activado' : 'Activar'}
                    </Button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nombre</label>
              <p className="font-semibold text-lg">{user?.name}</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</label>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Rol</label>
              <p className="font-medium capitalize">{user?.role?.toLowerCase()}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-green-500" />
              Preferencias
            </CardTitle>
            <CardDescription>Configurá tu experiencia en la aplicación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Moneda
                </Label>
                <Select
                  value={user?.preferences?.currency || 'USD'}
                  onValueChange={(value) => updatePreference('currency', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar moneda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - Dólar estadounidense</SelectItem>
                    <SelectItem value="ARS">ARS - Peso argentino</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - Libra esterlina</SelectItem>
                    <SelectItem value="UYU">UYU - Peso uruguayo</SelectItem>
                    <SelectItem value="MXN">MXN - Peso mexicano</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Formato de fecha
                </Label>
                <Select
                  value={user?.preferences?.dateFormat || 'DD/MM/YYYY'}
                  onValueChange={(value) => updatePreference('dateFormat', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar formato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-500" />
              Notificaciones
            </CardTitle>
            <CardDescription>Configurá cómo querés recibir las notificaciones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Notificaciones por email</Label>
                  <p className="text-xs text-muted-foreground">Recibí resúmenes y alertas por email</p>
                </div>
                <Button
                  size="sm"
                  variant={user?.preferences?.notifications?.email ? 'default' : 'outline'}
                  onClick={() => updateNotificationPreference('email', !user?.preferences?.notifications?.email)}
                  className="w-20"
                >
                  {user?.preferences?.notifications?.email ? 'ON' : 'OFF'}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Notificaciones push</Label>
                  <p className="text-xs text-muted-foreground">Alertas en tiempo real en la app</p>
                </div>
                <Button
                  size="sm"
                  variant={user?.preferences?.notifications?.push ? 'default' : 'outline'}
                  onClick={() => updateNotificationPreference('push', !user?.preferences?.notifications?.push)}
                  className="w-20"
                >
                  {user?.preferences?.notifications?.push ? 'ON' : 'OFF'}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Notificaciones por Telegram</Label>
                  <p className="text-xs text-muted-foreground">Mensajes directos por Telegram</p>
                </div>
                <Button
                  size="sm"
                  variant={user?.preferences?.notifications?.telegram ? 'default' : 'outline'}
                  onClick={() => updateNotificationPreference('telegram', !user?.preferences?.notifications?.telegram)}
                  className="w-20"
                >
                  {user?.preferences?.notifications?.telegram ? 'ON' : 'OFF'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}