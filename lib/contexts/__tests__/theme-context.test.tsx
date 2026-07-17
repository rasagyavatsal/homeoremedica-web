import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent, screen, waitFor } from '@testing-library/react'

import { ThemeProvider, useTheme } from '../theme-context'
import { THEME_STORAGE_KEY, themePolicy } from '@/lib/theme'

function ThemeConsumer() {
  const { preference, resolvedTheme, toggleTheme } = useTheme()
  return (
    <>
      <output data-testid="preference">{preference}</output>
      <output data-testid="resolved-theme">{resolvedTheme}</output>
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

function dispatchLocalStorageEvent(init: StorageEventInit) {
  const event = new StorageEvent('storage', init)
  Object.defineProperty(event, 'storageArea', { value: localStorage })
  fireEvent(window, event)
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
    dispatchLocalStorageEvent({
      key: THEME_STORAGE_KEY,
      newValue: 'dark',
    })

    await waitFor(() => {
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark')
      expect(document.documentElement).toHaveClass('dark')
    })
  })

  it('falls back to the system theme when another document removes the stored preference', async () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark')
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    )

    localStorage.removeItem(THEME_STORAGE_KEY)
    dispatchLocalStorageEvent({
      key: THEME_STORAGE_KEY,
      oldValue: 'dark',
      newValue: null,
    })

    await waitFor(() => {
      expect(screen.getByTestId('preference')).toHaveTextContent('system')
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light')
      expect(document.documentElement).not.toHaveClass('dark')
    })
  })

  it('falls back to the system theme when another document clears local storage', async () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark')
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    )

    localStorage.clear()
    dispatchLocalStorageEvent({
      key: null,
      oldValue: null,
      newValue: null,
    })

    await waitFor(() => {
      expect(screen.getByTestId('preference')).toHaveTextContent('system')
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light')
      expect(document.documentElement).not.toHaveClass('dark')
    })
  })
})
