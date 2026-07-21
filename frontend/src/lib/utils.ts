import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMoney(amount: number, currency: string = 'ARS') {
  const locale = currency === 'ARS' ? 'es-AR' : 'es-ES';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(dateString: string | Date) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

export function formatDateTime(dateString: string | Date) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export const CURRENCY_LABELS: Record<string, string> = {
  'ARS': 'Pesos argentinos',
  'USD': 'Dólar estadounidense',
  'EUR': 'Euro',
  'BRL': 'Real brasileño',
  'CLP': 'Peso chileno',
  'COP': 'Peso colombiano',
  'MXN': 'Peso mexicano',
};

export function getCurrencyLabel(currency: string): string {
  return CURRENCY_LABELS[currency] || currency;
}
