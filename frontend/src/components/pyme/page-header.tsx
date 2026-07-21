import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  className?: string
}

export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-gradient">
        {title}
      </h1>
      {description && (
        <p className="text-muted-foreground text-lg font-medium">
          {description}
        </p>
      )}
    </div>
  )
}