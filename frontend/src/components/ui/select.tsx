'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectContextValue {
  value: string
  onValueChange: (v: string) => void
  open: boolean
  setOpen: (v: boolean) => void
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

function useSelect() {
  const ctx = React.useContext(SelectContext)
  if (!ctx) throw new Error('Select compound components')
  return ctx
}

function Select({ value, onValueChange, children }: { value: string; onValueChange: (v: string) => void; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  )
}

function SelectTrigger({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  const { open, setOpen } = useSelect()
  return (
    <button
      type="button"
      onClick={() => { setOpen(!open); onClick?.() }}
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm',
        'ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  )
}

function SelectValue({ placeholder, children }: { placeholder?: string; children?: React.ReactNode }) {
  const { value } = useSelect()
  return <span className="truncate">{children || value || placeholder || 'Seleccionar...'}</span>
}

function SelectContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const { open, setOpen, value, onValueChange } = useSelect()
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [setOpen])

  if (!open) return null

  return (
    <div
      ref={ref}
      className={cn(
        'absolute z-50 top-full mt-1 w-full rounded-md border bg-popover p-1 shadow-md',
        className
      )}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === SelectItem) {
          const childValue = (child.props as any).value
          return React.cloneElement(child as React.ReactElement<any>, {
            onSelect: () => {
              onValueChange(childValue)
              setOpen(false)
            }
          })
        }
        return child
      })}
    </div>
  )
}

function SelectItem({ value, children, onSelect, className }: { value: string; children: React.ReactNode; onSelect?: () => void; className?: string }) {
  const { value: selectedValue, setOpen } = useSelect()
  return (
    <div
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none',
        'hover:bg-accent',
        selectedValue === value && 'bg-accent font-medium',
        className
      )}
      onClick={() => {
        onSelect?.()
        setOpen(false)
      }}
    >
      {children}
    </div>
  )
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }