/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'mystique': ['Cinzel', 'serif'],
        'elegant': ['Playfair Display', 'serif'],
      },
      colors: {
        mystique: {
          gold: '#D4AF37',
          bronze: '#CD7F32',
          copper: '#B87333',
          dark: '#1A1A2E',
          darker: '#16213E',
          deepest: '#0F0F23',
        },
        cosmic: {
          purple: '#4A00E0',
          blue: '#8E2DE2',
          pink: '#FF006E',
          orange: '#FF8500',
        }
      },
      backgroundImage: {
        'mystique-gradient': 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F0F23 100%)',
        'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #CD7F32 50%, #B87333 100%)',
        'cosmic-gradient': 'linear-gradient(135deg,rgb(6, 21, 58) 0%,rgb(8, 32, 59) 50%, #FF006E 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'sparkle': 'sparkle 3s linear infinite',
        'flip': 'flip 0.8s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.5)' },
          '100%': { boxShadow: '0 0 40px rgba(212, 175, 55, 0.8)' },
        },
        sparkle: {
          '0%, 100%': { opacity: 0 },
          '50%': { opacity: 1 },
        },
        flip: {
          '0%': { transform: 'rotateY(0deg)' },
          '50%': { transform: 'rotateY(90deg)' },
          '100%': { transform: 'rotateY(0deg)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
      },
    },
  },
  plugins: [],
}