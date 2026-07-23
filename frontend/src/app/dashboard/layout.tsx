'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import { Sidebar } from '@/components/layout/sidebar'
import { Loader2, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuthStore()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        {/* Background mesh */}
        <div className="absolute inset-0 bg-hero-mesh opacity-60" />
        <div className="bg-orb bg-orb-primary w-96 h-96 -top-32 -left-32" />
        <div className="bg-orb bg-orb-accent w-80 h-80 -bottom-24 -right-24" />

        <div className="relative z-10 flex flex-col items-center gap-4">
          {/* Animated logo */}
          <div className="relative">
            <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div className="absolute inset-0 w-16 h-16 gradient-primary rounded-2xl animate-pulse-ring opacity-60" />
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <p className="text-sm font-semibold text-foreground/80">GESTIONAR2</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Cargando tu panel...
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-background relative flex">
      {/* Global background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="bg-orb bg-orb-primary w-[600px] h-[600px] -top-48 -right-48 animate-float" style={{ animationDelay: '0s' }} />
        <div className="bg-orb bg-orb-accent  w-[500px] h-[500px] -bottom-32 -left-32 animate-float" style={{ animationDelay: '2s' }} />
        <div className="bg-orb bg-orb-blue   w-[400px] h-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-[17rem] min-h-screen relative z-10">
        <div className="p-3 sm:p-4 lg:p-6 xl:p-8 max-w-[1600px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  )
}
