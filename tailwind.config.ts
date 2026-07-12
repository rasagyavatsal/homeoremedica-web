import type { Config } from 'tailwindcss'

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
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        md: "2rem",
        lg: "2rem",
      },
      screens: {
        "2xl": "1440px",
      },
    },
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        serif: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        code: ['var(--font-mono)', 'monospace'],
      },
      letterSpacing: {
        display: '-0.01em',
      },
      lineHeight: {
        'display-lg': '1.0',
        'display-md': '1.04',
        'display-sm': '1.08',
      },
      screens: {
        'xs': '475px',
      },
      colors: {
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        surface: {
          DEFAULT: "hsl(var(--surface) / <alpha-value>)",
          bright: "hsl(var(--surface-bright) / <alpha-value>)",
          container: {
            low: "hsl(var(--surface-container-low) / <alpha-value>)",
            lowest: "hsl(var(--surface-container-lowest) / <alpha-value>)",
            high: "hsl(var(--surface-container-high) / <alpha-value>)",
          },
        },
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
          container: "hsl(var(--primary-container) / <alpha-value>)",
          fixed: {
            DEFAULT: "hsl(var(--primary-fixed) / <alpha-value>)",
            dim: "hsl(var(--primary-fixed-dim) / <alpha-value>)",
          },
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
          container: "hsl(var(--secondary-container) / <alpha-value>)",
          "on-container": "hsl(var(--on-secondary-container) / <alpha-value>)",
        },
        tertiary: {
          DEFAULT: "hsl(var(--tertiary) / <alpha-value>)",
          foreground: "hsl(var(--tertiary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        success: {
          DEFAULT: "hsl(var(--success) / <alpha-value>)",
          foreground: "hsl(var(--success-foreground) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "hsl(var(--warning) / <alpha-value>)",
          foreground: "hsl(var(--warning-foreground) / <alpha-value>)",
        },
        scrim: "hsl(var(--scrim) / <alpha-value>)",
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        'on-surface': "hsl(var(--on-surface) / <alpha-value>)",
        'on-surface-variant': "hsl(var(--on-surface-variant) / <alpha-value>)",
        'outline-variant': "hsl(var(--outline-variant) / <alpha-value>)",
      },
      /* Print corners: everything stays close to square. */
      borderRadius: {
        '2xl': "0.375rem",
        xl: "0.25rem",
        lg: "var(--radius)",
        md: "0.125rem",
        sm: "0.0625rem",
      },
      transitionDuration: {
        'DEFAULT': '300ms',
      },
      transitionTimingFunction: {
        'DEFAULT': 'ease-in-out',
      },
      gridTemplateColumns: {
        'cards': 'repeat(auto-fit, minmax(8.75rem, 1fr))',
      },
    },
  },
  plugins: [],
}
export default config
