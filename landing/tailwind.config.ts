import type { Config } from 'tailwindcss'

// Colors/effects map to the CSS variables declared in src/styles/global.css,
// which are copied verbatim from pos-ui-motion.prompt.md §2.1 (the source of truth).
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        'surface-2': 'var(--color-surface-2)',
        'surface-ink': 'var(--color-surface-ink)',
        border: 'var(--color-border)',
        text: 'var(--color-text)',
        'text-muted': 'var(--color-text-muted)',
        primary: 'var(--color-primary)',
        'primary-fg': 'var(--color-primary-fg)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)',
        'hero-overlay': 'var(--color-hero-overlay)',
        'hero-tint': 'var(--color-hero-tint)',
        espresso: 'var(--color-espresso)',
        cream: 'var(--color-cream)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        press: 'var(--shadow-press)',
      },
      borderRadius: {
        card: 'var(--radius-card)',
      },
      fontFamily: {
        display: ['Fraunces Variable', 'Fraunces', 'IBM Plex Sans Thai', 'ui-serif', 'Georgia', 'serif'],
        sans: ['Inter Variable', 'Inter', 'IBM Plex Sans Thai', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        thai: ['IBM Plex Sans Thai', 'ui-sans-serif', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.02em',
      },
      lineHeight: {
        display: '0.92',
      },
    },
  },
  plugins: [],
} satisfies Config
