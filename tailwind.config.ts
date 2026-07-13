import type { Config } from 'tailwindcss'

const spacing = {
  0: 'var(--space-0)', px: 'var(--space-px)', 0.5: 'var(--space-0-5)',
  1: 'var(--space-1)', 1.5: 'var(--space-1-5)', 2: 'var(--space-2)',
  2.5: 'var(--space-2-5)', 3: 'var(--space-3)', 4: 'var(--space-4)',
  5: 'var(--space-5)', 6: 'var(--space-6)', 7: 'var(--space-7)',
  8: 'var(--space-8)', 9: 'var(--space-9)', 10: 'var(--space-10)',
  12: 'var(--space-12)', 14: 'var(--space-14)', 16: 'var(--space-16)',
  18: 'var(--space-18)', 20: 'var(--space-20)', 24: 'var(--space-24)',
  28: 'var(--space-28)', 32: 'var(--space-32)', 36: 'var(--space-36)',
  40: 'var(--space-40)', 48: 'var(--space-48)', 56: 'var(--space-56)',
  64: 'var(--space-64)', 72: 'var(--space-72)', 80: 'var(--space-80)',
  96: 'var(--space-96)',
}

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: spacing[4], sm: spacing[6], lg: spacing[8] },
    },
    extend: {
      spacing,
      fontFamily: {
        display: ['var(--font-display)'], body: ['var(--font-body)'],
        sans: ['var(--font-body)'], code: ['var(--font-mono)'], mono: ['var(--font-mono)'],
      },
      fontSize: {
        micro: 'var(--font-size-micro)', xs: 'var(--font-size-xs)', sm: 'var(--font-size-sm)',
        base: 'var(--font-size-base)', lg: 'var(--font-size-lg)', xl: 'var(--font-size-xl)',
        '2xl': 'var(--font-size-2xl)', '3xl': 'var(--font-size-3xl)', '4xl': 'var(--font-size-4xl)',
        '5xl': 'var(--font-size-5xl)', '6xl': 'var(--font-size-6xl)',
      },
      letterSpacing: { display: 'var(--tracking-display)', label: 'var(--tracking-label)' },
      lineHeight: {
        tight: 'var(--line-height-tight)', title: 'var(--line-height-title)',
        relaxed: 'var(--line-height-body)',
      },
      colors: {
        border: 'hsl(var(--border) / <alpha-value>)', input: 'hsl(var(--input) / <alpha-value>)',
        ring: 'hsl(var(--ring) / <alpha-value>)', background: 'hsl(var(--background) / <alpha-value>)',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
        surface: { DEFAULT: 'hsl(var(--surface) / <alpha-value>)', bright: 'hsl(var(--surface-bright) / <alpha-value>)', container: {
          low: 'hsl(var(--surface-container-low) / <alpha-value>)',
          lowest: 'hsl(var(--surface-container-lowest) / <alpha-value>)',
          high: 'hsl(var(--surface-container-high) / <alpha-value>)',
        } },
        primary: { DEFAULT: 'hsl(var(--primary) / <alpha-value>)', foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
          container: 'hsl(var(--primary-container) / <alpha-value>)', fixed: { DEFAULT: 'hsl(var(--primary-fixed) / <alpha-value>)', dim: 'hsl(var(--primary-fixed-dim) / <alpha-value>)' } },
        secondary: { DEFAULT: 'hsl(var(--secondary) / <alpha-value>)', foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)',
          container: 'hsl(var(--secondary-container) / <alpha-value>)', 'on-container': 'hsl(var(--on-secondary-container) / <alpha-value>)' },
        tertiary: { DEFAULT: 'hsl(var(--tertiary) / <alpha-value>)', foreground: 'hsl(var(--tertiary-foreground) / <alpha-value>)' },
        destructive: { DEFAULT: 'hsl(var(--destructive) / <alpha-value>)', foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)' },
        success: { DEFAULT: 'hsl(var(--success) / <alpha-value>)', foreground: 'hsl(var(--success-foreground) / <alpha-value>)' },
        warning: { DEFAULT: 'hsl(var(--warning) / <alpha-value>)', foreground: 'hsl(var(--warning-foreground) / <alpha-value>)' },
        scrim: 'hsl(var(--scrim) / <alpha-value>)',
        muted: { DEFAULT: 'hsl(var(--muted) / <alpha-value>)', foreground: 'hsl(var(--muted-foreground) / <alpha-value>)' },
        accent: { DEFAULT: 'hsl(var(--accent) / <alpha-value>)', foreground: 'hsl(var(--accent-foreground) / <alpha-value>)' },
        popover: { DEFAULT: 'hsl(var(--popover) / <alpha-value>)', foreground: 'hsl(var(--popover-foreground) / <alpha-value>)' },
        card: { DEFAULT: 'hsl(var(--card) / <alpha-value>)', foreground: 'hsl(var(--card-foreground) / <alpha-value>)' },
        'on-surface': 'hsl(var(--on-surface) / <alpha-value>)',
        'on-surface-variant': 'hsl(var(--on-surface-variant) / <alpha-value>)',
        'outline-variant': 'hsl(var(--outline-variant) / <alpha-value>)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)', md: 'var(--radius)', lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)', '2xl': 'var(--radius-xl)', full: 'var(--radius-full)',
      },
      maxWidth: {
        reading: 'var(--layout-reading)', content: 'var(--layout-content)',
        wide: 'var(--layout-wide)', dialog: 'var(--layout-dialog)', popover: 'var(--layout-popover)',
        '6xl': 'var(--layout-content)', breadcrumb: 'var(--layout-breadcrumb)',
      },
      minHeight: { touch: 'var(--size-touch)', control: 'var(--size-control)', 'control-lg': 'var(--size-control-lg)', loading: 'var(--layout-loading)' },
      height: { header: 'var(--size-header)', control: 'var(--size-control)', 'control-sm': 'var(--size-control-sm)', 'control-lg': 'var(--size-control-lg)' },
      width: { control: 'var(--size-control)', 'control-sm': 'var(--size-control-sm)', 'control-lg': 'var(--size-control-lg)' },
      boxShadow: { soft: 'var(--shadow-soft)', overlay: 'var(--shadow-overlay)' },
      transitionDuration: { DEFAULT: 'var(--motion-duration-item)', calm: 'var(--motion-duration-section)' },
      transitionTimingFunction: { DEFAULT: 'var(--motion-ease-standard)', gentle: 'var(--motion-ease-gentle)' },
      screens: { xs: '475px' },
    },
  },
  plugins: [],
}

export default config
