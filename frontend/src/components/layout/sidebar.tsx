'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  ArrowDownCircle,
  ArrowUpCircle,
  PieChart,
  ListOrdered,
  Tags,
  Settings,
  FileText,
  Divide,
  PiggyBank,
  Receipt,
  Users,
  ChevronDown,
  User,
  Plus,
  Sparkles,
  X,
  Menu,
  Building2,
  LogOut,
  TrendingUp,
} from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import { getNavItems } from './nav-items'
import { ThemeToggle } from '@/components/theme-toggle'
import { useEffect } from 'react'

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout, workspaces, activeWorkspaceId, setWorkspaces, setActiveWorkspace } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const [showWorkspaces, setShowWorkspaces] = useState(false)
  const workspaceRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        const { data } = await api.get('/workspaces')
        setWorkspaces(data)
      } catch {
        // Silently fail
      }
    }
    loadWorkspaces()
  }, [setWorkspaces])

  const currentActiveWorkspace = workspaces.find(w => w.id === activeWorkspaceId)
  const enabledFeatures = currentActiveWorkspace?.enabledFeatures || ['transactions', 'categories', 'income', 'expenses']
  const navItems = getNavItems(currentActiveWorkspace?.type || 'PERSONAL', enabledFeatures)

  const personalWorkspaces = workspaces.filter(w => w.type === 'PERSONAL')
  const businessWorkspaces = workspaces.filter(w => w.type === 'BUSINESS')

  const handleWorkspaceSelect = (workspaceId: string) => {
    setActiveWorkspace(workspaceId)
    setShowWorkspaces(false)
    setIsOpen(false)
  }

  const userInitial = user?.name?.charAt(0).toUpperCase() || 'U'

  const SidebarContent = () => (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ── Logo ── */}
      <div className="px-5 pt-6 pb-5 flex items-center gap-3">
        <div className="relative w-10 h-10 shrink-0">
          <div className="absolute inset-0 rounded-xl gradient-primary opacity-100 shadow-glow-sm" />
          <div className="absolute inset-0 rounded-xl flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-bold tracking-tight text-gradient-primary font-display leading-none">
            GESTIONAR2
          </h2>
          <p className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase mt-0.5">
            Finanzas Inteligentes
          </p>
        </div>
      </div>

      {/* ── Workspace Selector ── */}
      {workspaces.length > 0 && (
        <div className="px-4 mb-4" ref={workspaceRef}>
          <button
            type="button"
            onClick={() => setShowWorkspaces(!showWorkspaces)}
            className={cn(
              "w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl",
              "bg-white/5 hover:bg-white/8 border border-white/8 hover:border-white/14",
              "transition-all duration-200 text-sm group"
            )}
          >
            <span className="flex items-center gap-2.5 min-w-0">
              <span className={cn(
                "flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] font-bold",
                currentActiveWorkspace?.type === 'BUSINESS'
                  ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                  : "bg-gradient-to-br from-emerald-500 to-teal-600"
              )}>
                {currentActiveWorkspace?.type === 'BUSINESS'
                  ? <Building2 className="h-3.5 w-3.5" />
                  : <User className="h-3.5 w-3.5" />
                }
              </span>
              <span className="truncate font-medium text-foreground/90">
                {currentActiveWorkspace?.name || 'Seleccionar...'}
              </span>
            </span>
            <ChevronDown className={cn(
              "h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform duration-200",
              showWorkspaces && "rotate-180"
            )} />
          </button>

          <AnimatePresence>
            {showWorkspaces && (
              <motion.div
                initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
                animate={{ opacity: 1, y: 0, scaleY: 1 }}
                exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                style={{ transformOrigin: 'top' }}
                className="mt-2 rounded-xl overflow-hidden border border-white/8 bg-[rgba(10,14,26,0.92)] backdrop-blur-xl shadow-2xl"
              >
                {personalWorkspaces.length > 0 && (
                  <div>
                    <div className="px-3 py-2 flex items-center gap-1.5 border-b border-white/5">
                      <User className="h-3 w-3 text-emerald-400" />
                      <span className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-widest">Personal</span>
                    </div>
                    {personalWorkspaces.map(ws => (
                      <button
                        key={ws.id}
                        onClick={() => handleWorkspaceSelect(ws.id)}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-all duration-150",
                          activeWorkspaceId === ws.id
                            ? "bg-emerald-500/12 text-emerald-400"
                            : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                        )}
                      >
                        <span className="truncate flex-1 text-left">{ws.name}</span>
                        {activeWorkspaceId === ws.id && (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wide">
                            Activo
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {businessWorkspaces.length > 0 && (
                  <div>
                    <div className="px-3 py-2 flex items-center gap-1.5 border-b border-white/5">
                      <Building2 className="h-3 w-3 text-blue-400" />
                      <span className="text-[10px] font-bold text-blue-400/80 uppercase tracking-widest">Empresarial</span>
                    </div>
                    {businessWorkspaces.map(ws => (
                      <button
                        key={ws.id}
                        onClick={() => handleWorkspaceSelect(ws.id)}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-all duration-150",
                          activeWorkspaceId === ws.id
                            ? "bg-blue-500/12 text-blue-400"
                            : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                        )}
                      >
                        <span className="truncate flex-1 text-left">{ws.name}</span>
                        {activeWorkspaceId === ws.id && (
                          <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wide">
                            Activo
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                <div className="border-t border-white/5">
                  <button
                    onClick={() => { setShowWorkspaces(false); setIsOpen(false); window.location.href = '/dashboard/settings' }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Nuevo espacio de trabajo</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 overflow-y-auto scrollbar-thin space-y-0.5">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04, duration: 0.28, ease: 'easeOut' }}
            >
              <Link
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                  isActive
                    ? "text-white"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                {/* Active background */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-bg"
                    className="absolute inset-0 rounded-xl gradient-primary opacity-20"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.55 }}
                  />
                )}
                {/* Active border glow */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-border"
                    className="absolute inset-0 rounded-xl border border-primary/40"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.55 }}
                  />
                )}
                <Icon className={cn(
                  "relative h-4.5 w-4.5 shrink-0 transition-all duration-200",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground group-hover:scale-110"
                )} style={{ width: '1.125rem', height: '1.125rem' }} />
                <span className="relative text-sm font-medium leading-none">{item.name}</span>

                {/* Active right indicator */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-dot"
                    className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary"
                    transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
                  />
                )}
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* ── User Section ── */}
      <div className="mt-auto px-3 pb-5 pt-4 border-t border-white/6">
        <div className="flex items-center gap-3 px-2 py-2.5 mb-1">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-glow-sm">
              {userInitial}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[hsl(var(--background))]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-foreground/95">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => logout()}
            className="flex-1 flex items-center justify-center gap-2.5 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-red-400 hover:bg-red-400/8 transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            <span>Cerrar sesión</span>
          </button>
          <div className="shrink-0">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* ── Mobile Toggle Button ── */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="glass rounded-xl h-11 w-11 flex items-center justify-center shadow-card-dark border border-white/10 transition-all hover:border-white/20"
        >
          {isOpen
            ? <X className="h-5 w-5 text-foreground" />
            : <Menu className="h-5 w-5 text-foreground" />
          }
        </button>
      </div>

      {/* ── Mobile Backdrop ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar Panel ── */}
      {/* Desktop: always visible */}
      <aside className="hidden lg:flex fixed top-0 left-0 z-40 w-[17rem] h-screen flex-col glass-sidebar">
        <SidebarContent />
      </aside>

      {/* Mobile: drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 35 }}
            className="fixed top-0 left-0 z-50 w-[17rem] h-screen flex flex-col glass-sidebar lg:hidden"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}