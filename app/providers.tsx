"use client"

import { AuthProvider } from '@/lib/contexts/auth-context'
import { ThemeProvider } from '@/lib/contexts/theme-context'

export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  )
}
