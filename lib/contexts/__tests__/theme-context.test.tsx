import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent, screen } from '@testing-library/react'

import { ThemeProvider, useTheme } from '../theme-context'
import { themePolicy } from '@/lib/theme'

function ThemeConsumer() {
  const { toggleTheme } = useTheme()
  return <button onClick={toggleTheme}>Toggle</button>
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
})
