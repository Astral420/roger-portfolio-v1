/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        'bg-elevated': 'rgb(var(--bg-elevated) / <alpha-value>)',
        'bg-overlay': 'rgb(var(--bg-overlay) / <alpha-value>)',
        border: 'rgb(var(--border-c) / <alpha-value>)',
        'border-strong': 'rgb(var(--border-strong) / <alpha-value>)',
        primary: 'rgb(var(--text-primary) / <alpha-value>)',
        secondary: 'rgb(var(--text-secondary) / <alpha-value>)',
        tertiary: 'rgb(var(--text-tertiary) / <alpha-value>)',
        accent: {
          from: '#6366F1',
          to: '#3B82F6',
          DEFAULT: '#6366F1',
        },
      },
      fontFamily: {
        sans: ['Kanit', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'hero': ['clamp(3rem, 9vw, 7.5rem)', { lineHeight: '0.98', letterSpacing: '-0.03em' }],
        'display': ['clamp(2.25rem, 5vw, 4rem)', { lineHeight: '1.04', letterSpacing: '-0.025em' }],
        'section-title': ['clamp(1.75rem, 3.4vw, 2.75rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
      },
      maxWidth: {
        content: '1180px',
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(135deg, #6366F1 0%, #3B82F6 100%)',
        'accent-gradient-soft': 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(59,130,246,0.15) 100%)',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(99,102,241,0.15), 0 8px 30px -8px rgba(99,102,241,0.35)',
        'glow-sm': '0 0 0 1px rgba(99,102,241,0.12), 0 4px 16px -4px rgba(99,102,241,0.25)',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        marqueeLeft: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        marqueeRight: {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
        breathe: {
          '0%, 100%': { transform: 'translateY(0px) scale(1)' },
          '50%': { transform: 'translateY(-6px) scale(1.01)' },
        },
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
      },
      animation: {
        'marquee-left': 'marqueeLeft 32s linear infinite',
        'marquee-right': 'marqueeRight 32s linear infinite',
        breathe: 'breathe 4.5s ease-in-out infinite',
        blink: 'blink 1s step-start infinite',
      },
    },
  },
  plugins: [],
}
