import { create } from 'zustand'

export type ToastType = 'default' | 'success' | 'error' | 'warning'

export interface Toast {
  id: string
  title?: string
  description?: string
  type?: ToastType
  duration?: number
}

interface ToastStore {
  toasts: Toast[]
  toast: (toast: Omit<Toast, 'id'>) => void
  dismiss: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  toast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9)
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }))

    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, toast.duration || 3000)
  },
  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))

export const toast = (props: Omit<Toast, 'id'>) => {
  useToastStore.getState().toast(props)
}
