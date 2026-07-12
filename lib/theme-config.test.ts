import { describe, it, expect } from 'vitest'
import { themeConfig } from './theme-config'

describe('Theme Configuration', () => {
  it('defines light and dark chrome colors', () => {
    expect(themeConfig.light.themeColor).toBeDefined()
    expect(themeConfig.light.backgroundColor).toBeDefined()
    expect(themeConfig.dark.themeColor).toBeDefined()
    expect(themeConfig.dark.backgroundColor).toBeDefined()
  })

  it('matches valid hex color formats', () => {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    expect(themeConfig.light.themeColor).toMatch(hexRegex)
    expect(themeConfig.light.backgroundColor).toMatch(hexRegex)
    expect(themeConfig.dark.themeColor).toMatch(hexRegex)
    expect(themeConfig.dark.backgroundColor).toMatch(hexRegex)
  })
})
