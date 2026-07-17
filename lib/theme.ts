export const THEME_STORAGE_KEY = 'homeoremedica-theme'

export type ThemePreference = 'system' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

const noop = () => undefined

function isResolvedTheme(value: string | null): value is ResolvedTheme {
  return value === 'light' || value === 'dark'
}

export function applyBootstrapTheme() {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    const isDark = stored === 'dark' || (stored !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    const root = document.documentElement
    root.classList.toggle('dark', isDark)
    root.style.colorScheme = isDark ? 'dark' : 'light'
  } catch (error) {}
}

export const themePolicy = {
  getPreference(): ThemePreference {
    const source = globalThis.window === undefined ? null : globalThis.localStorage

    if (!source) {
      return 'system'
    }

    const stored = source.getItem(THEME_STORAGE_KEY)
    return isResolvedTheme(stored) ? stored : 'system'
  },
  
  setPreference(preference: ThemePreference) {
    if (globalThis.window === undefined) return

    if (preference === 'system') {
      globalThis.localStorage.removeItem(THEME_STORAGE_KEY)
    } else {
      globalThis.localStorage.setItem(THEME_STORAGE_KEY, preference)
    }
  },

  getSystemTheme(): ResolvedTheme {
    if (globalThis.window === undefined) {
      return 'light'
    }

    return globalThis.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  },
  
  resolveTheme(preference: ThemePreference): ResolvedTheme {
    return preference === 'system' ? this.getSystemTheme() : preference
  },
  
  applyTheme(theme: ResolvedTheme) {
    if (globalThis.document === undefined) return
    const root = globalThis.document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.style.colorScheme = theme
  },

  subscribeToSystem(callback: (systemTheme: ResolvedTheme) => void): () => void {
    if (globalThis.window === undefined) return noop
    
    const media = globalThis.matchMedia('(prefers-color-scheme: dark)')
    
    // Support both modern MediaQueryListEvent and legacy Event
    const syncSystemTheme = (e?: MediaQueryListEvent | Event | { matches: boolean }) => {
      if (e && 'matches' in e) {
        callback(e.matches ? 'dark' : 'light')
      } else {
        callback(media.matches ? 'dark' : 'light')
      }
    }

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', syncSystemTheme as EventListener)
      return () => media.removeEventListener('change', syncSystemTheme as EventListener)
    }

    return noop
  },

  subscribeToPreference(callback: (preference: ThemePreference) => void): () => void {
    if (globalThis.window === undefined) return noop

    const syncPreference = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) return

      callback(isResolvedTheme(event.newValue) ? event.newValue : 'system')
    }

    globalThis.addEventListener('storage', syncPreference)
    return () => globalThis.removeEventListener('storage', syncPreference)
  },

  createBootstrapScript(): string {
    return `(() => {
  try {
    const stored = window.localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    const isDark = stored === 'dark' || (stored !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const root = document.documentElement;
    root.classList.toggle('dark', isDark);
    root.style.colorScheme = isDark ? 'dark' : 'light';
  } catch (error) {}
})();`
  },

  disableTransitionsTemporarily() {
    if (globalThis.document === undefined) return

    const css = globalThis.document.createElement('style')
    css.textContent = `* { -webkit-transition: none !important; -moz-transition: none !important; -o-transition: none !important; -ms-transition: none !important; transition: none !important; }`
    globalThis.document.head.appendChild(css)
    
    // Force browser layout repaint by reading a computed style; the result is
    // intentionally discarded.
    globalThis.getComputedStyle(css).getPropertyValue('opacity')

    globalThis.requestAnimationFrame(() => {
      globalThis.requestAnimationFrame(() => {
        if (globalThis.document.head.contains(css)) {
          css.remove()
        }
      })
    })
  }
}
