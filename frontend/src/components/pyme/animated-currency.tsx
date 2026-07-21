import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface AnimatedCurrencyProps {
  amount: number
  currency?: string
  className?: string
  prefix?: string
  duration?: number
}

export function AnimatedCurrency({ 
  amount, 
  currency = 'ARS', 
  className,
  prefix,
  duration = 1500
}: AnimatedCurrencyProps) {
  const [displayAmount, setDisplayAmount] = useState(0)

  useEffect(() => {
    let startTime: number | null = null
    const startValue = displayAmount
    const distance = amount - startValue

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setDisplayAmount(startValue + distance * easeOutQuart)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [amount, duration])

  const formatAmount = (value: number) => {
    return value.toLocaleString('es-AR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  }

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {prefix}{formatAmount(displayAmount)}
    </motion.span>
  )
}