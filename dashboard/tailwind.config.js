/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#080c14',
          card: '#0f172a',
          cardHover: '#131f37',
          border: '#1e293b',
          borderGlow: '#334155',
          accent: '#06b6d4',
          accentGlow: 'rgba(6, 182, 212, 0.2)',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
          violet: '#8b5cf6',
          slate: '#64748b'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'radarSweep 4s linear infinite',
        'laser-ping': 'laserPing 1.5s ease-out infinite'
      },
      keyframes: {
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        laserPing: {
          '0%': { opacity: '0.8', transform: 'scale(0.95)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
          '100%': { opacity: '0.8', transform: 'scale(0.95)' }
        }
      }
    },
  },
  plugins: [],
}
