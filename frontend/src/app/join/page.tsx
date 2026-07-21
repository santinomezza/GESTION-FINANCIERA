'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/useAuthStore'
import { toast } from '@/components/ui/use-toast'

export default function JoinPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, setWorkspaces, setActiveWorkspace } = useAuthStore()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const hasAttemptedJoin = useRef(false)

  useEffect(() => {
    const code = searchParams.get('code')
    if (!code) {
      setStatus('error')
      setMessage('Código de invitación inválido o faltante.')
      return
    }

    const join = async () => {
      try {
        const res = await api.post('/workspaces/join', { code })
        const workspaceId = res.data.workspaceId
        const alreadyOwner = res.data.alreadyOwner
        const alreadyMember = res.data.alreadyMember

        setStatus('success')
        if (alreadyOwner) {
          setMessage('Ya eres el dueño de este espacio de trabajo. Redirigiendo...')
          toast({ title: 'Acceso Directo', description: 'Ya eres el dueño de este espacio.', type: 'success' })
        } else if (alreadyMember) {
          setMessage('Ya eres miembro de este espacio de trabajo. Redirigiendo...')
          toast({ title: 'Acceso Directo', description: 'Ya eres miembro de este espacio.', type: 'success' })
        } else {
          setMessage('¡Te uniste al espacio de trabajo correctamente!')
          toast({ title: 'Bienvenido', description: 'Acceso al espacio de trabajo concedido.', type: 'success' })
        }

        const { data: workspaces } = await api.get('/workspaces')
        setWorkspaces(workspaces, undefined, workspaceId)

        const targetWorkspace = workspaces.find((w: any) => w.id === workspaceId)
        if (targetWorkspace) {
          setActiveWorkspace(targetWorkspace.id, targetWorkspace.memberRole)
        }

        setTimeout(() => router.push('/dashboard'), 1200)
      } catch (err: any) {
        setStatus('error')
        setMessage(err.response?.data?.message || 'El código de invitación no es válido o expiró.')
        toast({ title: 'Error', description: 'No se pudo procesar la invitación.', type: 'error' })
      }
    }

    if (isAuthenticated) {
      if (hasAttemptedJoin.current) return
      hasAttemptedJoin.current = true
      join()
    } else {
      router.push(`/login?redirect=${encodeURIComponent(`/join?code=${code}`)}`)
    }
  }, [searchParams, isAuthenticated, router, setWorkspaces, setActiveWorkspace])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#050d1a] via-[#0a1628] to-[#0d1f3a]" />
      <div className="bg-orb bg-orb-primary w-96 h-96 -top-32 -left-32 animate-float" />
      <div className="bg-orb bg-orb-accent  w-80 h-80 -bottom-24 -right-24 animate-float" style={{ animationDelay: '2s' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 glass-elevated p-10 max-w-sm w-full mx-4 text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-glow-sm">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg font-display">GESTIONAR2</span>
        </div>

        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-white/70 text-sm">Procesando tu invitación...</p>
          </div>
        )}

        {status === 'success' && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <div>
              <p className="text-white font-semibold">{message}</p>
              <p className="text-white/40 text-xs mt-1">Redirigiendo al panel...</p>
            </div>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 bg-rose-500/15 border border-rose-500/30 rounded-2xl flex items-center justify-center">
              <XCircle className="h-8 w-8 text-rose-400" />
            </div>
            <div>
              <p className="text-white font-semibold">Invitación inválida</p>
              <p className="text-white/50 text-sm mt-1">{message}</p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-2 px-6 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold shadow-glow-sm hover:shadow-glow transition-all"
            >
              Ir al panel
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
