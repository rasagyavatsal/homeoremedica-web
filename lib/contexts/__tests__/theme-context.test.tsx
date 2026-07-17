import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent, screen, waitFor } from '@testing-library/react'

import { ThemeProvider, useTheme } from '../theme-context'
import { THEME_STORAGE_KEY, themePolicy } from '@/lib/theme'

function ThemeConsumer() {
  const { resolvedTheme, toggleTheme } = useTheme()
  return (
    <>
      <output>{resolvedTheme}</output>
      <button onClick={toggleTheme}>Toggle</button>
    </>
  )
}

function setMatchMedia(matches: boolean) {
  globalThis.matchMedia = vi.fn().mockImplementation(query => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
    document.documentElement.style.colorScheme = ''
    vi.spyOn(themePolicy, 'disableTransitionsTemporarily')
    setMatchMedia(false)
  })

  it('calls disableTransitionsTemporarily when the theme is toggled', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    )

    // Clear calls from initial render
    vi.mocked(themePolicy.disableTransitionsTemporarily).mockClear()

    fireEvent.click(screen.getByRole('button'))

    expect(themePolicy.disableTransitionsTemporarily).toHaveBeenCalledTimes(1)
  })

  it('syncs the theme when another document changes the stored preference', async () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    )

    localStorage.setItem(THEME_STORAGE_KEY, 'dark')
    fireEvent(window, new StorageEvent('storage', {
      key: THEME_STORAGE_KEY,
      newValue: 'dark',
    }))

    await waitFor(() => {
      expect(screen.getByText('dark')).toBeInTheDocument()
      expect(document.documentElement).toHaveClass('dark')
    })
  })
})
