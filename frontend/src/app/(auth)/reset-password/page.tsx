'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion } from 'framer-motion'

import api from '@/lib/api'
import { toast } from '@/components/ui/use-toast'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Sparkles, ArrowLeft, ArrowRight, Lock } from 'lucide-react'

const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Token requerido'),
    newPassword: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [token, setToken] = useState('')

    useEffect(() => {
        const tokenParam = searchParams.get('token')
        if (tokenParam) {
            setToken(tokenParam)
        }
    }, [searchParams])

    const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordForm>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            token: token,
        }
    })

    const onSubmit = async (data: ResetPasswordForm) => {
        setIsLoading(true)
        try {
            await api.post('/auth/reset-password', {
                token: data.token || token,
                newPassword: data.newPassword,
            })
            setIsSuccess(true)
            toast({
                title: 'Contraseña actualizada',
                description: 'Tu contraseña ha sido restablecida exitosamente.',
                type: 'success'
            })

            // Redirigir al login después de 3 segundos
            setTimeout(() => {
                router.push('/auth/login')
            }, 3000)
        } catch (err: any) {
            toast({
                title: 'Error',
                description: err.response?.data?.message || 'Error al restablecer la contraseña. El token puede ser inválido o haber expirado.',
                type: 'error'
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (!token && !isSuccess) {
        return (
            <div className="min-h-screen flex bg-background overflow-hidden">
                <div className="hidden lg:flex lg:w-1/2 relative flex-col items-start justify-between p-12 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#050d1a] via-[#0a1628] to-[#0d1f3a]" />
                    <div className="absolute inset-0 bg-hero-mesh opacity-80" />
                    <div className="bg-orb bg-orb-primary  w-80 h-80 top-0 left-0 animate-float" style={{ animationDelay: '0s' }} />
                    <div className="bg-orb bg-orb-accent   w-64 h-64 bottom-16 right-0 animate-float" style={{ animationDelay: '2s' }} />
                    <div className="bg-orb bg-orb-blue     w-56 h-56 top-1/2 left-1/3 animate-float" style={{ animationDelay: '4s' }} />

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
                        transition={{ duration: 0.7, delay: 0.15 }}
                        className="relative z-10 max-w-md"
                    >
                        <h1 className="text-4xl font-bold text-white font-display leading-tight mb-4">
                            Enlace <span className="text-gradient">inválido</span>
                        </h1>
                        <p className="text-white/60 text-base leading-relaxed">
                            El enlace de recuperación no es válido o ha expirado. Por favor, solicitá uno nuevo.
                        </p>
                    </motion.div>

                    <div className="relative z-10 text-white/30 text-xs">
                        © 2025 GESTIONAR2 · Todos los derechos reservados
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative">
                    <div className="absolute inset-0 lg:hidden bg-background overflow-hidden">
                        <div className="bg-orb bg-orb-primary w-64 h-64 -top-16 -left-16 animate-float" />
                        <div className="bg-orb bg-orb-accent  w-56 h-56 -bottom-12 -right-12 animate-float" style={{ animationDelay: '2s' }} />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative z-10 w-full max-w-sm"
                    >
                        <div className="lg:hidden flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-glow-sm">
                                <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-foreground font-bold text-lg font-display">GESTIONAR2</span>
                        </div>

                        <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20">
                            <p className="text-sm text-red-400 mb-4">
                                El enlace de recuperación no es válido o ha expirado.
                            </p>
                            <Link href="/auth/forgot-password" className="text-primary font-semibold hover:text-primary/80 transition-colors flex items-center gap-1">
                                <ArrowLeft className="h-4 w-4" />
                                Solicitar nuevo enlace
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        )
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen flex bg-background overflow-hidden">
                <div className="hidden lg:flex lg:w-1/2 relative flex-col items-start justify-between p-12 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#050d1a] via-[#0a1628] to-[#0d1f3a]" />
                    <div className="absolute inset-0 bg-hero-mesh opacity-80" />
                    <div className="bg-orb bg-orb-primary  w-80 h-80 top-0 left-0 animate-float" style={{ animationDelay: '0s' }} />
                    <div className="bg-orb bg-orb-accent   w-64 h-64 bottom-16 right-0 animate-float" style={{ animationDelay: '2s' }} />
                    <div className="bg-orb bg-orb-blue     w-56 h-56 top-1/2 left-1/3 animate-float" style={{ animationDelay: '4s' }} />

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
                        transition={{ duration: 0.7, delay: 0.15 }}
                        className="relative z-10 max-w-md"
                    >
                        <h1 className="text-4xl font-bold text-white font-display leading-tight mb-4">
                            Contraseña <span className="text-gradient">actualizada</span>
                        </h1>
                        <p className="text-white/60 text-base leading-relaxed">
                            Tu contraseña ha sido restablecida exitosamente. Ahora podés iniciar sesión con tu nueva contraseña.
                        </p>
                    </motion.div>

                    <div className="relative z-10 text-white/30 text-xs">
                        © 2025 GESTIONAR2 · Todos los derechos reservados
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative">
                    <div className="absolute inset-0 lg:hidden bg-background overflow-hidden">
                        <div className="bg-orb bg-orb-primary w-64 h-64 -top-16 -left-16 animate-float" />
                        <div className="bg-orb bg-orb-accent  w-56 h-56 -bottom-12 -right-12 animate-float" style={{ animationDelay: '2s' }} />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative z-10 w-full max-w-sm"
                    >
                        <div className="lg:hidden flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-glow-sm">
                                <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-foreground font-bold text-lg font-display">GESTIONAR2</span>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 rounded-xl bg-green-500/10 border border-green-500/20"
                        >
                            <p className="text-sm text-green-400 mb-4">
                                Tu contraseña ha sido actualizada exitosamente.
                            </p>
                            <p className="text-xs text-muted-foreground mb-4">
                                Redirigiendo al inicio de sesión...
                            </p>
                            <Link href="/auth/login" className="text-primary font-semibold hover:text-primary/80 transition-colors flex items-center gap-1">
                                <ArrowLeft className="h-4 w-4" />
                                Ir al inicio de sesión
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex bg-background overflow-hidden">
            {/* ── Left panel – Branding ── */}
            <div className="hidden lg:flex lg:w-1/2 relative flex-col items-start justify-between p-12 overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#050d1a] via-[#0a1628] to-[#0d1f3a]" />
                <div className="absolute inset-0 bg-hero-mesh opacity-80" />

                {/* Animated orbs */}
                <div className="bg-orb bg-orb-primary  w-80 h-80 top-0 left-0 animate-float" style={{ animationDelay: '0s' }} />
                <div className="bg-orb bg-orb-accent   w-64 h-64 bottom-16 right-0 animate-float" style={{ animationDelay: '2s' }} />
                <div className="bg-orb bg-orb-blue     w-56 h-56 top-1/2 left-1/3 animate-float" style={{ animationDelay: '4s' }} />

                {/* Grid overlay */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `
              linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)
            `,
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

                {/* Hero text */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.15 }}
                    className="relative z-10 max-w-md"
                >
                    <h1 className="text-4xl font-bold text-white font-display leading-tight mb-4">
                        Nueva <span className="text-gradient">contraseña</span>
                    </h1>
                    <p className="text-white/60 text-base leading-relaxed mb-8">
                        Creá una contraseña segura para proteger tu cuenta. Asegurate de usar una combinación de letras, números y símbolos.
                    </p>
                </motion.div>

                {/* Footer */}
                <div className="relative z-10 text-white/30 text-xs">
                    © 2025 GESTIONAR2 · Todos los derechos reservados
                </div>
            </div>

            {/* ── Right panel – Reset password form ── */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative">
                {/* Mobile background */}
                <div className="absolute inset-0 lg:hidden bg-background overflow-hidden">
                    <div className="bg-orb bg-orb-primary w-64 h-64 -top-16 -left-16 animate-float" />
                    <div className="bg-orb bg-orb-accent  w-56 h-56 -bottom-12 -right-12 animate-float" style={{ animationDelay: '2s' }} />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="relative z-10 w-full max-w-sm"
                >
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-glow-sm">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-foreground font-bold text-lg font-display">GESTIONAR2</span>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-foreground font-display tracking-tight">Restablecer contraseña</h2>
                        <p className="text-muted-foreground text-sm mt-1">
                            Ingresá tu nueva contraseña
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Hidden token field */}
                        <input type="hidden" {...register('token')} value={token} />

                        {/* New Password */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nueva contraseña</label>
                            <div className="relative">
                                <Input
                                    type="password"
                                    placeholder="Mínimo 6 caracteres"
                                    {...register('newPassword')}
                                    className={`
                    h-12 rounded-xl pr-12 transition-all duration-200
                    ${errors.newPassword ? 'border-red-500/60' : ''}
                  `}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    <Lock className="h-4 w-4" />
                                </div>
                            </div>
                            {errors.newPassword && (
                                <p className="text-xs text-red-400">{errors.newPassword.message}</p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="
                w-full h-12 mt-2 rounded-xl font-semibold text-sm text-white
                gradient-primary shadow-glow-sm
                hover:shadow-glow hover:-translate-y-0.5
                active:translate-y-0 active:shadow-glow-sm
                transition-all duration-200
                disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
                flex items-center justify-center gap-2
              "
                        >
                            {isLoading
                                ? <><Loader2 className="h-4 w-4 animate-spin" /> Actualizando...</>
                                : <><span>Restablecer contraseña</span><ArrowRight className="h-4 w-4" /></>
                            }
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        <Link href="/auth/login" className="text-primary font-semibold hover:text-primary/80 transition-colors flex items-center justify-center gap-1">
                            <ArrowLeft className="h-4 w-4" />
                            Volver al inicio de sesión
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    )
}