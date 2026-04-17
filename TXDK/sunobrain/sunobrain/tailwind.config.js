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
          DEFAULT: '#D4AF37',
          50: '#FFF9E6',
          100: '#FFF0BF',
          200: '#FFE699',
          300: '#FFD966',
          400: '#F0C040',
          500: '#D4AF37',
          600: '#B8962E',
          700: '#9A7B24',
          800: '#7C611B',
          900: '#5E4813',
          950: '#3D2E0A',
        },
        obsidian: {
          DEFAULT: '#020617',
          surface: '#0A0F1E',
          raised: '#141B2D',
          border: '#1E293B',
          muted: '#475569',
          900: '#020617',
          800: '#0F172A',
          700: '#1E293B',
          accent: '#00FF41',
        },
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
