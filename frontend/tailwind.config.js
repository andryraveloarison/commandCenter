/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Premium Palette
        premium: {
          deep: '#0a0a0f',
          'deep-light': '#14141d',
          surface: '#ffffff',
          'surface-light': '#f8f9fa',
          border: '#e2e8f0',
          accent: '#ff6b00', // Orange from Image 2
          'accent-purple': '#7000ff', // Purple from Image 1
          text: '#1a1a1a',
          'text-muted': '#64748b',
        },
        dark: {
          900: '#050505',
          800: '#0a0a0a',
          700: '#121212',
        },
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        'space-mono': ['Space Mono', 'monospace'],
      },
      boxShadow: {
        'premium': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'card':    '0 2px 12px rgba(32, 32, 96, 0.06)',
        'card-md': '0 6px 28px rgba(32, 32, 96, 0.10)',
        'card-lg': '0 12px 40px rgba(32, 32, 96, 0.14)',
        'glow-accent': '0 0 15px rgba(99, 102, 241, 0.35)',
      },
      borderRadius: {
        'sidebar': '32px',
      },
      backgroundImage: {
        'premium-gradient': 'linear-gradient(135deg, #0a0a0f 0%, #14141d 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
