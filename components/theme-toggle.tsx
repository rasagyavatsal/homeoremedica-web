"use client"

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'

import { useTheme } from '@/lib/contexts/theme-context'
import { MOTION_DURATIONS, MOTION_EASING } from '@/lib/motion/system'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'

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

/**
 * Menu-row variant of the theme toggle for account dropdowns. Keeps the menu
 * open after switching so the visible theme change reads as feedback.
 */
export function ThemeMenuItem() {
  const { resolvedTheme, toggleTheme } = useTheme()
  const actionLabel = resolvedTheme === 'dark' ? 'Use light mode' : 'Use dark mode'
  const Icon = resolvedTheme === 'dark' ? Sun : Moon

  return (
    <DropdownMenuItem
      className="cursor-pointer"
      onSelect={(event) => {
        event.preventDefault();
        toggleTheme();
      }}
    >
      <Icon className="mr-2 h-4 w-4" />
      {actionLabel}
    </DropdownMenuItem>
  )
}
