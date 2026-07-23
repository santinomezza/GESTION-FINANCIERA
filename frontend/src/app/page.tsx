'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import { motion } from 'framer-motion'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuthStore()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    }
  }, [isAuthenticated, isLoading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#050d1a] via-[#0a1628] to-[#0d1f3a]" />
      <div className="bg-orb bg-orb-primary w-96 h-96 -top-32 -left-32 animate-float" />
      <div className="bg-orb bg-orb-accent  w-80 h-80 -bottom-24 -right-24 animate-float" style={{ animationDelay: '2s' }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 flex flex-col items-center gap-5"
      >
        {/* Animated logo */}
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-glow overflow-hidden">
            <img src="/logo.svg" alt="GESTIONAR2 Logo" className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0 w-20 h-20 rounded-3xl animate-pulse-ring opacity-50" />
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <h1 className="text-2xl font-bold text-white font-display tracking-tight">GESTIONAR2</h1>
          <p className="text-white/40 text-sm tracking-widest uppercase">Finanzas Inteligentes</p>
        </div>

        {/* Loading dots */}
        <div className="flex items-center gap-1.5 mt-2">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}
