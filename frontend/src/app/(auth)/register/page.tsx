'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion } from 'framer-motion'
import Cookies from 'js-cookie'

import api from '@/lib/api'
import { useAuthStore } from '@/store/useAuthStore'
import { toast } from '@/components/ui/use-toast'
import { Input } from '@/components/ui/input'
import { Loader2, Sparkles, Eye, EyeOff, ArrowRight, User, Building2, CheckCircle2, Share2, Users } from 'lucide-react'

const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  workspaceType: z.enum(['PERSONAL', 'BUSINESS', 'JOIN']).default('PERSONAL'),
  workspaceName: z.string().max(100).optional(),
  invitationCode: z.string().optional(),
})

type RegisterForm = z.infer<typeof registerSchema>

const BENEFITS = [
  'Control total de ingresos y gastos',
  'Gráficos de rentabilidad en tiempo real',
  'Alertas y límites por categoría',
  'Reportes automáticos con IA',
]

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
  const { setUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { workspaceType: 'PERSONAL' }
  })

  const workspaceType = watch('workspaceType') || 'PERSONAL'

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true)
    try {
      const res = await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
        workspaceType: data.workspaceType === 'JOIN' ? 'PERSONAL' : data.workspaceType,
        workspaceName: data.workspaceType === 'BUSINESS'
          ? (data.workspaceName || 'Negocio 1')
          : undefined,
      })
      Cookies.set('access_token', res.data.accessToken)
      Cookies.set('refresh_token', res.data.refreshToken)
      Cookies.set('user_id', res.data.user.id)
      setUser(res.data.user)

      let joined = false;
      if (data.workspaceType === 'JOIN' && data.invitationCode) {
        let finalCode = data.invitationCode.trim()
        if (finalCode.includes('join?code=')) {
          try {
            const url = new URL(finalCode)
            finalCode = url.searchParams.get('code') || finalCode
          } catch (e) {
            finalCode = finalCode.split('?code=')[1] || finalCode
          }
        }

        try {
          await api.post('/workspaces/join', { code: finalCode })
          joined = true;
          toast({ title: 'Cuenta creada', description: '¡Te has unido al negocio exitosamente!', type: 'success' })
        } catch (err: any) {
          toast({ title: 'Cuenta creada', description: 'Cuenta creada, pero el código de invitación es inválido.', type: 'error' })
        }
      } else {
        toast({ title: 'Cuenta creada', description: '¡Bienvenido a GESTIONAR2!', type: 'success' })
      }

      try {
        const { data: workspaces } = await api.get('/workspaces')
        useAuthStore.getState().setWorkspaces(workspaces)
      } catch {
        // Workspaces may not be available
      }

      router.push(redirect)
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || err.message || 'Error al registrar usuario',
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-background overflow-hidden">
      {/* ── Left panel – Branding ── */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col items-start justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#050d1a] via-[#0a1628] to-[#0d1f3a]" />
        <div className="absolute inset-0 bg-hero-mesh opacity-80" />

        <div className="bg-orb bg-orb-accent   w-72 h-72 top-0 right-0 animate-float" style={{ animationDelay: '1s' }} />
        <div className="bg-orb bg-orb-primary  w-64 h-64 bottom-0 left-0 animate-float" style={{ animationDelay: '3s' }} />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.8) 1px,transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 flex items-center gap-3"
        >
          <div className="w-11 h-11 gradient-primary rounded-xl flex items-center justify-center shadow-glow">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg font-display tracking-tight leading-none">GESTIONAR2</p>
            <p className="text-white/50 text-[11px] tracking-widest uppercase mt-0.5">Finanzas Inteligentes</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.15 }}
          className="relative z-10 max-w-sm"
        >
          <h1 className="text-4xl font-bold text-white font-display leading-tight mb-3">
            Empezá gratis,{' '}
            <span className="text-gradient">hoy mismo</span>
          </h1>
          <p className="text-white/55 text-sm leading-relaxed mb-8">
            Creá tu cuenta en segundos y comenzá a tomar el control total de tus finanzas.
          </p>

          <div className="space-y-3">
            {BENEFITS.map((b, i) => (
              <motion.div
                key={b}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.08, duration: 0.35 }}
                className="flex items-center gap-3"
              >
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                <span className="text-white/65 text-sm">{b}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="relative z-10 text-white/25 text-xs">
          © 2025 GESTIONAR2 · Todos los derechos reservados
        </div>
      </div>

      {/* ── Right panel – Register form ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative overflow-y-auto">
        {/* Mobile background */}
        <div className="absolute inset-0 lg:hidden bg-background overflow-hidden">
          <div className="bg-orb bg-orb-accent  w-64 h-64 -top-16 -right-16 animate-float" />
          <div className="bg-orb bg-orb-primary w-56 h-56 -bottom-12 -left-12 animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative z-10 w-full max-w-sm py-8"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-glow-sm">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-foreground font-bold text-lg font-display">GESTIONAR2</span>
          </div>

          <div className="mb-7">
            <h2 className="text-2xl font-bold text-foreground font-display tracking-tight">Crear cuenta</h2>
            <p className="text-muted-foreground text-sm mt-1">Completá el formulario para comenzar</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nombre completo</label>
              <Input
                placeholder="Tu nombre completo"
                {...register('name')}
                className={`h-11 rounded-xl transition-all duration-200 ${errors.name ? 'border-red-500/60' : ''}`}
              />
              {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</label>
              <Input
                type="email"
                placeholder="ejemplo@correo.com"
                {...register('email')}
                className={`h-11 rounded-xl transition-all duration-200 ${errors.email ? 'border-red-500/60' : ''}`}
              />
              {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contraseña</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  {...register('password')}
                  className={`h-11 rounded-xl pr-12 transition-all duration-200 ${errors.password ? 'border-red-500/60' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
            </div>

            {/* Workspace Type */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tipo de cuenta</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'PERSONAL', label: 'Personal', sub: 'Propio', Icon: User },
                  { value: 'BUSINESS', label: 'Empresa', sub: 'Negocio', Icon: Building2 },
                  { value: 'JOIN', label: 'Unirse', sub: 'Con código', Icon: Users },
                ].map(({ value, label, sub, Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setValue('workspaceType', value as 'PERSONAL' | 'BUSINESS' | 'JOIN')}
                    className={`
                      flex flex-col items-center justify-center text-center gap-1 p-2 rounded-xl border-2 transition-all duration-200
                      ${workspaceType === value
                        ? 'border-primary/60 bg-primary/10 shadow-glow-sm'
                        : 'border-border bg-card hover:border-primary/30 hover:bg-accent'
                      }
                    `}
                  >
                    <div className={`p-1.5 rounded-lg ${workspaceType === value ? 'bg-primary/20' : 'bg-secondary'}`}>
                      <Icon className={`h-4 w-4 ${workspaceType === value ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <span className={`text-xs font-semibold ${workspaceType === value ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Business name */}
            {workspaceType === 'BUSINESS' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1.5"
              >
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nombre del negocio</label>
                <Input
                  placeholder="Ej: Mi Empresa S.A."
                  {...register('workspaceName')}
                  className="h-11 rounded-xl transition-all duration-200"
                />
              </motion.div>
            )}

            {/* Invitation Code */}
            {workspaceType === 'JOIN' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1.5"
              >
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Código de invitación</label>
                <Input
                  placeholder="Ej: A1B2C3D4"
                  {...register('invitationCode')}
                  className="h-11 rounded-xl transition-all duration-200 font-mono"
                />
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="
                w-full h-12 mt-1 rounded-xl font-semibold text-sm text-white
                gradient-primary shadow-glow-sm
                hover:shadow-glow hover:-translate-y-0.5
                active:translate-y-0 active:shadow-glow-sm
                transition-all duration-200
                disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
                flex items-center justify-center gap-2
              "
            >
              {isLoading
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Creando cuenta...</>
                : <><span>Crear cuenta</span><ArrowRight className="h-4 w-4" /></>
              }
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            ¿Ya tenés una cuenta?{' '}
            <Link href={`/login?redirect=${encodeURIComponent(redirect)}`} className="text-primary font-semibold hover:text-primary/80 transition-colors">
              Iniciá sesión
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
