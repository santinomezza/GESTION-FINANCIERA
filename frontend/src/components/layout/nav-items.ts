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
  Upload,
  Receipt,
  Users,
  Sparkles
} from 'lucide-react'

export interface NavItem {
  name: string
  href: string
  icon: typeof LayoutDashboard
  feature?: string
  businessOnly?: boolean
}

export const ALL_NAV_ITEMS: NavItem[] = [
  { name: 'General', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Ingresos', href: '/dashboard/income', icon: ArrowUpCircle, feature: 'income' },
  { name: 'Gastos', href: '/dashboard/expenses', icon: ArrowDownCircle, feature: 'expenses' },
  { name: 'Rentabilidad', href: '/dashboard/profitability', icon: PieChart, feature: 'profitability' },
  { name: 'Movimientos', href: '/dashboard/transactions', icon: ListOrdered, feature: 'transactions' },
  { name: 'Categorías', href: '/dashboard/categories', icon: Tags, feature: 'categories' },
  { name: 'Reportes', href: '/dashboard/reports', icon: FileText, feature: 'reports' },
  { name: 'Resumen', href: '/dashboard/summary', icon: PieChart, feature: 'summary' },
  { name: 'Dividir', href: '/dashboard/split', icon: Divide, feature: 'split' },
  { name: 'Ahorros', href: '/dashboard/savings', icon: PiggyBank, feature: 'savings' },
  { name: 'Subir Factura', href: '/dashboard/invoices/upload', icon: Upload, feature: 'invoice_upload', businessOnly: true },
  { name: 'Facturas', href: '/dashboard/invoices', icon: Receipt, feature: 'invoices', businessOnly: true },
  { name: 'Clientes', href: '/dashboard/clients', icon: Users, feature: 'clients', businessOnly: true },
]

const DEFAULT_FEATURES = ['transactions', 'categories', 'income', 'expenses']

export function getNavItems(workspaceType: 'PERSONAL' | 'BUSINESS', enabledFeatures?: string[]): NavItem[] {
  const features = enabledFeatures || DEFAULT_FEATURES
  const items: NavItem[] = []

  ALL_NAV_ITEMS.forEach((item) => {
    if (item.businessOnly && workspaceType !== 'BUSINESS') {
      return
    }
    if (!item.feature || features.includes(item.feature)) {
      items.push(item)
    }
  })

  items.push({ name: 'Configuración', href: '/dashboard/settings', icon: Settings })

  return items
}

export function getAllFeatures(): { id: string; name: string; icon: typeof Sparkles; description: string }[] {
  return [
    { id: 'income', name: 'Ingresos', icon: ArrowUpCircle, description: 'Registrar y gestionar ingresos' },
    { id: 'expenses', name: 'Gastos', icon: ArrowDownCircle, description: 'Registrar y gestionar gastos' },
    { id: 'transactions', name: 'Movimientos', icon: ListOrdered, description: 'Ver todos los movimientos' },
    { id: 'categories', name: 'Categorías', icon: Tags, description: 'Crear y gestionar categorías' },
    { id: 'reports', name: 'Reportes', icon: FileText, description: 'Generar reportes en Excel/CSV' },
    { id: 'profitability', name: 'Rentabilidad', icon: PieChart, description: 'Analizar rentabilidad' },
    { id: 'summary', name: 'Resumen', icon: PieChart, description: 'Ver resumen financiero' },
    { id: 'split', name: 'Dividir', icon: Divide, description: 'Dividir gastos entre personas' },
    { id: 'savings', name: 'Ahorros', icon: PiggyBank, description: 'Gestionar metas de ahorro' },
    { id: 'invoices', name: 'Facturas', icon: Receipt, description: 'Gestionar facturas' },
    { id: 'invoice_upload', name: 'Subir Factura', icon: Upload, description: 'Subir y procesar facturas' },
    { id: 'clients', name: 'Clientes', icon: Users, description: 'Gestionar cartera de clientes' },
  ]
}