'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { Invitation, WorkspaceMember } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import api from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Copy,
    Trash2,
    Plus,
    Users,
    CheckCircle2,
    Loader2,
    Share2,
    Clock,
    UserPlus,
    Pencil,
    X,
    Check,
    ExternalLink,
    UserCog
} from 'lucide-react'

type ExpirationOption = '15' | '30' | 'never'

export default function InvitationManager() {
    const { activeWorkspaceId, workspaces } = useAuthStore()
    const [invitations, setInvitations] = useState<Invitation[]>([])
    const [members, setMembers] = useState<WorkspaceMember[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [generatedLink, setGeneratedLink] = useState<string | null>(null)

    const [displayName, setDisplayName] = useState('')
    const [role, setRole] = useState<'VIEWER' | 'ADMIN' | 'ACCOUNTANT' | 'PARTNER'>('VIEWER')
    const [expiration, setExpiration] = useState<string>('15')

    const [editingInvitation, setEditingInvitation] = useState<string | null>(null)
    const [editRole, setEditRole] = useState<string>('')
    const [editExpiresIn, setEditExpiresIn] = useState<string>('15')
    const [editDisplayName, setEditDisplayName] = useState<string>('')

    const [editingMember, setEditingMember] = useState<string | null>(null)
    const [editMemberRole, setEditMemberRole] = useState<string>('')

    const currentWorkspace = workspaces.find(w => w.id === activeWorkspaceId)
    const isBusiness = currentWorkspace?.type === 'BUSINESS'

    const loadData = async () => {
        if (!activeWorkspaceId) return

        setIsLoading(true)
        try {
            const [invitationsRes, membersRes] = await Promise.all([
                api.get(`/invitations?workspaceId=${activeWorkspaceId}`),
                api.get(`/workspace-members`)
            ])
            setInvitations(invitationsRes.data)
            setMembers(membersRes.data)
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'No se pudieron cargar los datos',
                type: 'error'
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [activeWorkspaceId])

    const handleCreate = async () => {
        if (!activeWorkspaceId) return

        setIsCreating(true)
        try {
            const expiresAt = expiration === 'never'
                ? new Date('9999-12-31T00:00:00.000Z')
                : new Date(Date.now() + parseInt(expiration) * 24 * 60 * 60 * 1000)

            const { data } = await api.post('/invitations', {
                role,
                displayName: displayName || undefined,
                maxUses: 1,
                expiresAt
            })

            setInvitations([data, ...invitations])
            const link = `${window.location.origin}/join?code=${data.code}`
            setGeneratedLink(link)
            toast({
                title: 'Invitación creada',
                description: 'El enlace está listo para compartir'
            })

            setDisplayName('')
            setRole('VIEWER')
            setExpiration('15')
            setShowForm(false)
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'No se pudo crear la invitación',
                type: 'error'
            })
        } finally {
            setIsCreating(false)
        }
    }

    const handleCopyLink = (link: string) => {
        navigator.clipboard.writeText(link)
        toast({ title: 'Enlace copiado al portapapeles' })
    }

    const handleShare = async (link: string) => {
        const shareData = {
            title: 'Invitación a GESTIONAR',
            text: `Te invito a unirte a mi espacio de trabajo en GESTIONAR.`,
            url: link
        }

        try {
            if (navigator.share) {
                await navigator.share(shareData)
            } else {
                await navigator.clipboard.writeText(link)
                toast({ title: 'Enlace copiado al portapapeles' })
            }
        } catch (error) {
            // User cancelled or error
        }
    }

    const handleUpdateInvitation = async (id: string) => {
        try {
            const expiresAt = editExpiresIn === 'never'
                ? new Date('9999-12-31T00:00:00.000Z')
                : new Date(Date.now() + parseInt(editExpiresIn) * 24 * 60 * 60 * 1000)

            const { data } = await api.patch(`/invitations/${id}`, {
                role: editRole,
                expiresAt: expiresAt.toISOString(),
                displayName: editDisplayName || undefined
            })

            setInvitations(invitations.map(inv => inv.id === id ? { ...inv, ...data } : inv))
            setEditingInvitation(null)
            toast({ title: 'Invitación actualizada' })
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'No se pudo actualizar',
                type: 'error'
            })
        }
    }

    const handleDeleteInvitation = async (id: string) => {
        if (!window.confirm('¿Estás seguro de que querés eliminar esta invitación?')) {
            return
        }

        try {
            await api.delete(`/invitations/${id}`)
            setInvitations(invitations.filter(inv => inv.id !== id))
            toast({ title: 'Invitación eliminada' })
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'No se pudo eliminar',
                type: 'error'
            })
        }
    }

    const handleUpdateMemberRole = async (id: string) => {
        try {
            const { data } = await api.patch(`/workspace-members/${id}/role`, {
                role: editMemberRole
            })

            setMembers(members.map(m => m.id === id ? { ...m, ...data } : m))
            setEditingMember(null)
            toast({ title: 'Rol actualizado' })
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'No se pudo actualizar el rol',
                type: 'error'
            })
        }
    }

    const handleRemoveMember = async (id: string) => {
        if (!window.confirm('¿Estás seguro de que querés eliminar este miembro?')) {
            return
        }

        try {
            await api.delete(`/workspace-members/${id}`)
            setMembers(members.filter(m => m.id !== id))
            toast({ title: 'Miembro eliminado' })
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'No se pudo eliminar',
                type: 'error'
            })
        }
    }

    const formatDate = (dateString: string) => {
        if (dateString.startsWith('9999')) return 'Nunca'
        const date = new Date(dateString)
        return date.toLocaleDateString('es-AR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getRoleLabel = (role: string) => {
        const labels: Record<string, string> = {
            OWNER: 'Propietario',
            ADMIN: 'Administrador',
            ACCOUNTANT: 'Contador',
            PARTNER: 'Socio',
            VIEWER: 'Visualizador'
        }
        return labels[role] || role
    }

    const isExpired = (expiresAt: string) => {
        if (expiresAt.startsWith('9999')) return false
        return new Date(expiresAt) < new Date()
    }

    const isExhausted = (inv: Invitation) => {
        return inv.maxUses > 0 && inv.usesCount >= inv.maxUses
    }

    const getMemberName = (member: WorkspaceMember) => {
        return member.displayName || member.user?.name || member.user?.email || 'Usuario'
    }

    if (!isBusiness) {
        return null
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-6">
            <Card className="glass-card">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-blue-500" />
                                Invitar Miembros
                            </CardTitle>
                            <CardDescription>
                                Creá un enlace de invitación para compartir con tu equipo
                            </CardDescription>
                        </div>
                        <Button
                            onClick={() => setShowForm(!showForm)}
                            size="sm"
                            className="rounded-xl"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Nueva Invitación
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <AnimatePresence>
                        {showForm && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="p-4 border border-border/50 rounded-xl bg-muted/20 space-y-3"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium">Nombre</Label>
                                        <Input
                                            placeholder="Ej: Juan Pérez"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            className="rounded-xl"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium">Rol</Label>
                                        <Select value={role} onValueChange={(value: any) => setRole(value)}>
                                            <SelectTrigger className="rounded-xl">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="VIEWER">Visualizador</SelectItem>
                                                <SelectItem value="ACCOUNTANT">Contador</SelectItem>
                                                <SelectItem value="PARTNER">Socio</SelectItem>
                                                <SelectItem value="ADMIN">Administrador</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium">Expira en</Label>
                                        <Select value={expiration} onValueChange={(value) => setExpiration(value)}>
                                            <SelectTrigger className="rounded-xl">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="15">15 días</SelectItem>
                                                <SelectItem value="30">30 días</SelectItem>
                                                <SelectItem value="never">Nunca</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleCreate}
                                        disabled={isCreating}
                                        className="flex-1 rounded-xl"
                                    >
                                        {isCreating ? (
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        ) : (
                                            <UserPlus className="h-4 w-4 mr-2" />
                                        )}
                                        Generar Invitación
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowForm(false)
                                            setGeneratedLink(null)
                                        }}
                                        className="rounded-xl"
                                    >
                                        Cancelar
                                    </Button>
                                </div>

                                <AnimatePresence>
                                    {generatedLink && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
                                        >
                                            <p className="text-xs font-medium text-emerald-700 mb-2">Enlace generado:</p>
                                            <div className="flex gap-2">
                                                <Input
                                                    readOnly
                                                    value={generatedLink}
                                                    className="rounded-xl bg-white/50 text-xs font-mono"
                                                />
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleCopyLink(generatedLink)}
                                                    className="rounded-xl"
                                                >
                                                    <Copy className="h-4 w-4 mr-1" />
                                                    Copiar
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleShare(generatedLink)}
                                                    className="rounded-xl"
                                                >
                                                    <Share2 className="h-4 w-4 mr-1" />
                                                    Compartir
                                                </Button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserCog className="h-5 w-5 text-purple-500" />
                        Miembros del Espacio
                    </CardTitle>
                    <CardDescription>
                        Administrá los miembros actuales y sus roles
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                        </div>
                    ) : members.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p className="font-medium">No hay miembros</p>
                            <p className="text-sm mt-1">Invitá a alguien para comenzar</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <AnimatePresence>
                                {members.map((member) => (
                                    <motion.div
                                        key={member.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="p-4 rounded-xl border border-border/30 bg-muted/20 hover:bg-muted/30 transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                                                <Users className="h-5 w-5 text-purple-600" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium text-sm">
                                                        {getMemberName(member)}
                                                    </span>
                                                    <span className="text-xs bg-purple-500/10 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                                                        {getRoleLabel(member.role)}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {member.user?.email}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 shrink-0">
                                                {editingMember === member.id ? (
                                                    <>
                                                        <Select value={editMemberRole} onValueChange={(value: any) => setEditMemberRole(value)}>
                                                            <SelectTrigger className="h-8 w-32 rounded-xl text-xs">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="VIEWER">Visualizador</SelectItem>
                                                                <SelectItem value="ACCOUNTANT">Contador</SelectItem>
                                                                <SelectItem value="PARTNER">Socio</SelectItem>
                                                                <SelectItem value="ADMIN">Administrador</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => handleUpdateMemberRole(member.id)}
                                                        >
                                                            <Check className="h-4 w-4 text-emerald-600" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => setEditingMember(null)}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => {
                                                                setEditingMember(member.id)
                                                                setEditMemberRole(member.role)
                                                            }}
                                                            title="Cambiar rol"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() => handleRemoveMember(member.id)}
                                                            title="Eliminar miembro"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Share2 className="h-5 w-5 text-blue-500" />
                        Invitaciones Pendientes
                    </CardTitle>
                    <CardDescription>
                        Gestioná los enlaces de invitación creados
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                        </div>
                    ) : invitations.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Share2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p className="font-medium">No hay invitaciones activas</p>
                            <p className="text-sm mt-1">Creá una para compartir con tu equipo</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <AnimatePresence>
                                {invitations.map((invitation) => {
                                    const expired = isExpired(invitation.expiresAt)
                                    const exhausted = isExhausted(invitation)
                                    const link = `${window.location.origin}/join?code=${invitation.code}`

                                    return (
                                        <motion.div
                                            key={invitation.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className={`p-4 rounded-xl border transition-all ${expired || exhausted
                                                    ? 'bg-muted/10 border-muted/30 opacity-60'
                                                    : 'bg-muted/20 border-border/30 hover:bg-muted/30'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${expired || exhausted
                                                        ? 'bg-muted/50'
                                                        : 'bg-blue-500/10'
                                                    }`}>
                                                    {expired || exhausted ? (
                                                        <Clock className="h-5 w-5 text-muted-foreground" />
                                                    ) : (
                                                        <ExternalLink className="h-5 w-5 text-blue-600" />
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <code className="text-sm font-mono font-semibold bg-muted/50 px-2 py-0.5 rounded">
                                                            {invitation.code}
                                                        </code>
                                                        {!expired && !exhausted && (
                                                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                        )}
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                                        <span className="font-medium">
                                                            {invitation.displayName || getRoleLabel(invitation.role)}
                                                        </span>
                                                        <span>•</span>
                                                        <span className="bg-blue-500/10 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                                            {getRoleLabel(invitation.role)}
                                                        </span>
                                                        <span>•</span>
                                                        <span className={expired ? 'text-red-600 font-medium' : ''}>
                                                            {expired ? 'Expirada' : `Expira: ${formatDate(invitation.expiresAt)}`}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1 shrink-0">
                                                    {!expired && !exhausted && (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                onClick={() => handleCopyLink(link)}
                                                                title="Copiar enlace"
                                                            >
                                                                <Copy className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                onClick={() => handleShare(link)}
                                                                title="Compartir"
                                                            >
                                                                <Share2 className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                    {editingInvitation === invitation.id ? (
                                                        <>
                                                            <Input
                                                                value={editDisplayName}
                                                                onChange={(e) => setEditDisplayName(e.target.value)}
                                                                placeholder="Nombre"
                                                                className="h-8 w-28 rounded-xl text-xs"
                                                            />
                                                            <Select value={editRole} onValueChange={(value: any) => setEditRole(value)}>
                                                                <SelectTrigger className="h-8 w-28 rounded-xl text-xs">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="VIEWER">Visualizador</SelectItem>
                                                                    <SelectItem value="ACCOUNTANT">Contador</SelectItem>
                                                                    <SelectItem value="PARTNER">Socio</SelectItem>
                                                                    <SelectItem value="ADMIN">Administrador</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <Select value={editExpiresIn} onValueChange={(value) => setEditExpiresIn(value)}>
                                                                <SelectTrigger className="h-8 w-20 rounded-xl text-xs">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="15">15 días</SelectItem>
                                                                    <SelectItem value="30">30 días</SelectItem>
                                                                    <SelectItem value="never">Nunca</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                onClick={() => handleUpdateInvitation(invitation.id)}
                                                            >
                                                                <Check className="h-4 w-4 text-emerald-600" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                onClick={() => setEditingInvitation(null)}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                onClick={() => {
                                                                    setEditingInvitation(invitation.id)
                                                                    setEditRole(invitation.role)
                                                                    setEditDisplayName(invitation.displayName || '')
                                                                    if (invitation.expiresAt.startsWith('9999')) {
                                                                        setEditExpiresIn('never')
                                                                    } else {
                                                                        const daysLeft = Math.max(1, Math.ceil((new Date(invitation.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                                                                        setEditExpiresIn(daysLeft <= 30 ? (daysLeft <= 15 ? '15' : '30') : 'never')
                                                                    }
                                                                }}
                                                                title="Editar"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                onClick={() => handleDeleteInvitation(invitation.id)}
                                                                title="Eliminar"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
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
        </motion.div>
    )
}