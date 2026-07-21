'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion } from 'framer-motion'

import api from '@/lib/api'
import { toast } from '@/components/ui/use-toast'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react'

const forgotPasswordSchema = z.object({
    email: z.string().email('Email inválido'),
})

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [emailSent, setEmailSent] = useState(false)

    const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>({
        resolver: zodResolver(forgotPasswordSchema),
    })

    const onSubmit = async (data: ForgotPasswordForm) => {
        setIsLoading(true)
        try {
            await api.post('/auth/forgot-password', { email: data.email })
            setEmailSent(true)
            toast({
                title: 'Correo enviado',
                description: 'Si el email existe, recibirás un correo con instrucciones para recuperar tu contraseña.',
                type: 'success'
            })
        } catch (err: any) {
            toast({
                title: 'Error',
                description: err.response?.data?.message || 'Error al solicitar recuperación de contraseña',
                type: 'error'
            })
        } finally {
            setIsLoading(false)
        }
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
                        Recuperá tu{' '}
                        <span className="text-gradient">acceso</span>
                    </h1>
                    <p className="text-white/60 text-base leading-relaxed mb-8">
                        Te enviaremos un enlace seguro a tu correo electrónico para que puedas restablecer tu contraseña.
                    </p>
                </motion.div>

                {/* Footer */}
                <div className="relative z-10 text-white/30 text-xs">
                    © 2025 GESTIONAR2 · Todos los derechos reservados
                </div>
            </div>

            {/* ── Right panel – Forgot password form ── */}
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
                        <h2 className="text-2xl font-bold text-foreground font-display tracking-tight">Recuperar contraseña</h2>
                        <p className="text-muted-foreground text-sm mt-1">
                            Ingresá tu email y te enviaremos un enlace para restablecer tu contraseña
                        </p>
                    </div>

                    {!emailSent ? (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {/* Email */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</label>
                                <Input
                                    type="email"
                                    placeholder="ejemplo@correo.com"
                                    {...register('email')}
                                    className={`
                    h-12 rounded-xl transition-all duration-200
                    ${errors.email ? 'border-red-500/60' : ''}
                  `}
                                />
                                {errors.email && (
                                    <p className="text-xs text-red-400">{errors.email.message}</p>
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
                                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
                                    : <><span>Enviar enlace</span><ArrowRight className="h-4 w-4" /></>
                                }
                            </button>
                        </form>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 rounded-xl bg-green-500/10 border border-green-500/20"
                        >
                            <p className="text-sm text-green-400 mb-4">
                                Te enviamos un correo con las instrucciones para recuperar tu contraseña. Revisá tu bandeja de entrada.
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Si no lo encontrás, revisá la carpeta de spam.
                            </p>
                        </motion.div>
                    )}

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