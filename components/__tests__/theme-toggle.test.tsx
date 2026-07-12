import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { renderToString } from 'react-dom/server'

import { ThemeProvider } from '@/lib/contexts/theme-context'
import { ThemeToggle } from '../theme-toggle'

function setMatchMedia(matches: boolean) {
  globalThis.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
    document.documentElement.style.colorScheme = ''
    setMatchMedia(false)
  })

  it('uses the system theme when no preference is stored', async () => {
    setMatchMedia(true)

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    )

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true)
      expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument()
    })
  })

  it('persists a manual toggle and updates the document theme', async () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    )

    expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /switch to dark mode/i }))

    await waitFor(() => {
      expect(localStorage.getItem('homeoremedica-theme')).toBe('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
      expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument()
    })
  })

  it('renders the animated theme icon', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    )

    expect(screen.getByTestId('theme-toggle-icon')).toBeInTheDocument()
  })

  it('does not render the theme icon on the server to prevent hydration mismatch', () => {
    const html = renderToString(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )

    expect(html).not.toContain('theme-toggle-icon')
  })
})
