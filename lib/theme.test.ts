// @vitest-environment jsdom
import { THEME_STORAGE_KEY, themePolicy, applyBootstrapTheme } from './theme'
import { describe, it, expect, beforeEach, vi } from 'vitest'

type SystemThemeListener = (e: { matches: boolean }) => void

function evaluateBootstrap() {
  applyBootstrapTheme()
}

function mockBootstrapMatchMedia(matchesDark: boolean) {
  Object.defineProperty(globalThis, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)' ? matchesDark : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

function mockSystemThemeMatchMedia(matchesDark: boolean) {
  const listeners: SystemThemeListener[] = []

  Object.defineProperty(globalThis, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)' ? matchesDark : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn((event: string, fn: SystemThemeListener) => {
        if (event === 'change') listeners.push(fn)
      }),
      removeEventListener: vi.fn((event: string, fn: SystemThemeListener) => {
        if (event === 'change') {
          const idx = listeners.indexOf(fn)
          if (idx > -1) listeners.splice(idx, 1)
        }
      }),
      dispatchEvent: vi.fn(),
    })),
  })

  return {
    triggerChange: (matchesDark: boolean) => {
      listeners.forEach(fn => fn({ matches: matchesDark }))
    },
  }
}

describe('createThemeBootstrapScript', () => {
  beforeEach(() => {
    document.documentElement.className = ''
    document.documentElement.style.cssText = ''
    localStorage.clear()
  })

  it('generates a valid bootstrap script string', () => {
    const script = themePolicy.createBootstrapScript()
    expect(script).toContain(THEME_STORAGE_KEY)
    expect(script).toContain('localStorage.getItem')
    expect(script).toContain('classList.toggle')
    expect(script).toContain('colorScheme')
  })

  it('applies dark theme when explicit dark preference is saved', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark')
    mockBootstrapMatchMedia(false) // System is light

    evaluateBootstrap()

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.style.colorScheme).toBe('dark')
  })

  it('applies light theme when explicit light preference is saved', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light')
    mockBootstrapMatchMedia(true) // System is dark

    evaluateBootstrap()

    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(document.documentElement.style.colorScheme).toBe('light')
  })

  it('falls back to system dark theme when no preference is saved', () => {
    mockBootstrapMatchMedia(true)

    evaluateBootstrap()

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.style.colorScheme).toBe('dark')
  })

  it('falls back to system light theme when no preference is saved', () => {
    mockBootstrapMatchMedia(false)

    evaluateBootstrap()

    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(document.documentElement.style.colorScheme).toBe('light')
  })

  it('falls back to system dark theme when an invalid preference is saved', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'purple')
    mockBootstrapMatchMedia(true)

    evaluateBootstrap()

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.style.colorScheme).toBe('dark')
  })
})

describe('themePolicy', () => {
  beforeEach(() => {
    document.documentElement.className = ''
    document.documentElement.style.cssText = ''
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('getPreference returns system by default', () => {
    expect(themePolicy.getPreference()).toBe('system')
  })

  it('setPreference updates localStorage and clears on system', () => {
    themePolicy.setPreference('dark')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')

    themePolicy.setPreference('system')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull()
  })

  it('resolveTheme returns explicit preference or system theme', () => {
    mockBootstrapMatchMedia(true) // System is dark
    expect(themePolicy.resolveTheme('light')).toBe('light')
    expect(themePolicy.resolveTheme('dark')).toBe('dark')
    expect(themePolicy.resolveTheme('system')).toBe('dark')
  })

  it('applyTheme updates DOM correctly', () => {
    themePolicy.applyTheme('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.style.colorScheme).toBe('dark')

    themePolicy.applyTheme('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(document.documentElement.style.colorScheme).toBe('light')
  })

  it('syncSystemTheme orchestrates subscription correctly', () => {
    const { triggerChange } = mockSystemThemeMatchMedia(false) // Initially light
    const callback = vi.fn()

    const cleanup = themePolicy.subscribeToSystem(callback)
    
    // Changing system to dark
    triggerChange(true)
    expect(callback).toHaveBeenCalledWith('dark')

    cleanup()
    
    // Changing after cleanup
    triggerChange(false)
    expect(callback).toHaveBeenCalledTimes(1) // Should not increase
  })

  describe('disableTransitionsTemporarily', () => {
    it('appends and removes a style tag to disable transitions', () => {
      vi.useFakeTimers()
      
      let rafCallbacks: FrameRequestCallback[] = []
      const rAFMock = vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb) => {
        rafCallbacks.push(cb)
        return 0
      })

      const getComputedStyleSpy = vi.spyOn(globalThis, 'getComputedStyle')

      themePolicy.disableTransitionsTemporarily()

      expect(getComputedStyleSpy).toHaveBeenCalledWith(expect.any(HTMLStyleElement))

      const styleElement = document.head.querySelector('style')
      expect(styleElement).not.toBeNull()
      expect(styleElement?.textContent).toContain('transition: none !important')

      // Execute first rAF
      const firstRafs = [...rafCallbacks]
      rafCallbacks = []
      firstRafs.forEach(cb => cb(performance.now()))

      // The style should still be there because it takes 2 rAFs to remove
      expect(document.head.querySelector('style')).not.toBeNull()

      // Execute second rAF
      const secondRafs = [...rafCallbacks]
      rafCallbacks = []
      secondRafs.forEach(cb => cb(performance.now()))

      // Now it should be removed
      expect(document.head.querySelector('style')).toBeNull()

      rAFMock.mockRestore()
      getComputedStyleSpy.mockRestore()
      vi.useRealTimers()
    })
  })
})
