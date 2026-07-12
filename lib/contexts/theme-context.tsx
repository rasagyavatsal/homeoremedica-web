"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import {
  themePolicy,
  type ResolvedTheme,
  type ThemePreference,
} from '@/lib/theme'

type ThemeContextValue = {
  preference: ThemePreference
  resolvedTheme: ResolvedTheme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [preference, setPreference] = useState<ThemePreference>(() => themePolicy.getPreference())
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => themePolicy.resolveTheme(preference))

  // Sync preference changes to resolvedTheme and apply to DOM
  useEffect(() => {
    const newResolved = themePolicy.resolveTheme(preference)
    setResolvedTheme(newResolved)
    themePolicy.disableTransitionsTemporarily()
    themePolicy.applyTheme(newResolved)
  }, [preference])

  // Sync with system theme changes
  useEffect(() => {
    return themePolicy.subscribeToSystem((systemTheme) => {
      // We only need to re-resolve if preference is system
      // We do it by reading the latest preference state in a functional update,
      // but the simplest way is to check the current dependency `preference`
      if (preference === 'system') {
        setResolvedTheme(systemTheme)
        themePolicy.disableTransitionsTemporarily()
        themePolicy.applyTheme(systemTheme)
      }
    })
  }, [preference])

  const toggleTheme = useCallback(() => {
    const newPreference = resolvedTheme === 'dark' ? 'light' : 'dark'
    themePolicy.setPreference(newPreference)
    setPreference(newPreference)
  }, [resolvedTheme])

  const value = useMemo(
    () => ({ preference, resolvedTheme, toggleTheme }),
    [preference, resolvedTheme, toggleTheme]
  )

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}
