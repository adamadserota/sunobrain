/**
 * Tailwind palette routes through CSS variables defined in index.css,
 * so changing [data-theme] on <html> re-skins the entire UI without
 * rebuilding. Variables are stored as space-separated RGB triplets so
 * that alpha utilities (`/20`, `/40`, etc.) still work.
 */
const rgb = (token) => `rgb(var(${token}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './**/*.{js,ts,jsx,tsx}',
    '!./node_modules/**',
    '!./dist/**',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'intel-primary': {
          DEFAULT: rgb('--color-accent-500'),
          50: rgb('--color-accent-50'),
          100: rgb('--color-accent-50'),
          200: rgb('--color-accent-300'),
          300: rgb('--color-accent-300'),
          400: rgb('--color-accent-400'),
          500: rgb('--color-accent-500'),
          600: rgb('--color-accent-600'),
          700: rgb('--color-accent-700'),
          800: rgb('--color-accent-700'),
          900: rgb('--color-accent-950'),
          950: rgb('--color-accent-950'),
        },
        obsidian: {
          DEFAULT: rgb('--color-bg'),
          surface: rgb('--color-surface'),
          raised: rgb('--color-raised'),
          border: rgb('--color-border'),
          muted: rgb('--color-text-500'),
          900: rgb('--color-bg'),
          800: rgb('--color-surface'),
          700: rgb('--color-raised'),
          accent: '#00FF41',
        },
        slate: {
          100: rgb('--color-text-100'),
          200: rgb('--color-text-200'),
          300: rgb('--color-text-300'),
          400: rgb('--color-text-400'),
          500: rgb('--color-text-500'),
        },
        'accent-fg': rgb('--color-accent-fg'),
        intel: {
          blue: '#1A56DB',
          secondary: '#7C3AED',
          signal: '#F97316',
        },
        research: {
          bg: '#FFFDF7',
          surface: '#FFF9ED',
          border: '#E8E0D0',
          muted: '#9C8E7C',
        },
        ivory: {
          50: '#FFFDF7',
          100: '#FFF9ED',
          200: '#FFF3DB',
          300: '#FFECC5',
          400: '#F5DDA8',
        },
      },
      borderRadius: {
        osint: '2.5rem',
      },
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
        display: ['Bangers', 'cursive'],
        body: ['Nunito', 'sans-serif'],
        mono: ['JetBrains Mono', 'IBM Plex Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.5s ease-out both',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      transitionTimingFunction: {
        magnetic: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
};
