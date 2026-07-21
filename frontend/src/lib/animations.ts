// Centralized framer-motion animation variants for GESTIONAR2
import type { Variants } from 'framer-motion'

// Fade in from bottom
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
}

// Fade in from left
export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.06,
      duration: 0.45,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
}

// Scale in
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      type: 'spring',
      stiffness: 260,
      damping: 20,
    },
  }),
}

// Stagger container
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

// Hover lift with glow
export const hoverLift = {
  rest: { y: 0, scale: 1 },
  hover: {
    y: -4,
    scale: 1.02,
    transition: {
      duration: 0.3,
      type: 'spring',
      stiffness: 400,
      damping: 25,
    },
  },
  tap: { scale: 0.98 },
}

// Card entrance
export const cardEntrance: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      type: 'spring',
      stiffness: 260,
      damping: 24,
    },
  }),
}

// Sidebar nav item
export const navItem: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.04,
      duration: 0.35,
      ease: 'easeOut',
    },
  }),
}

// Page transition
export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 12 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.25, ease: 'easeIn' },
  },
}

// Pulse glow for balance cards
export const pulseGlow: Variants = {
  rest: { boxShadow: '0 0 0 0 rgba(0, 0, 0, 0)' },
  hover: {
    boxShadow: '0 0 30px rgba(16, 185, 129, 0.15)',
    transition: { duration: 0.4 },
  },
}

// Modal overlay
export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

// Modal content
export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.2 } },
}
