"use client"

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'

import { useTheme } from '@/lib/contexts/theme-context'
import { MOTION_DURATIONS, MOTION_EASING } from '@/lib/motion/system'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export function ThemeToggle({ className }: Readonly<{ className?: string }>) {
  const { resolvedTheme, toggleTheme } = useTheme()
  const reducedMotion = useReducedMotion() ?? false
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const actionLabel = resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
  const Icon = resolvedTheme === 'dark' ? Moon : Sun

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        buttonVariants({ variant: 'outline', size: 'header-icon' }),
        className,
      )}
    >
      {mounted ? (
        <motion.div
          key={resolvedTheme}
          data-testid="theme-toggle-icon"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            type: 'tween',
            ease: MOTION_EASING,
            duration: reducedMotion ? MOTION_DURATIONS.reduced : MOTION_DURATIONS.item,
          }}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </motion.div>
      ) : (
        <div className="h-4 w-4" />
      )}
      <span className="sr-only" suppressHydrationWarning>
        {actionLabel}
      </span>
    </button>
  )
}
