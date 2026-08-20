"use client"

import { Moon, Sun } from 'lucide-react'

import { useTheme } from '@/lib/contexts/theme-context'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'

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
