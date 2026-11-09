/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./index.tsx",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
      },
      letterSpacing: {
        widest: '.15em',
      },
      colors: {
        // Tech-Agri Pro Palette (single source of truth — was duplicated in a
        // runtime CDN tailwind.config in index.html, now removed)
        tech: {
          bg: '#1B2D2E',       // Deep Teal-Grey
          card: '#1F3234',     // Dark Card
          cardHover: '#24373A',
          cyan: '#4DD0E1',     // Accent
          cyanDark: '#0097A7',
          amber: '#FFC107',    // Highlight 2
          amberDark: '#FFA000',
          primary: '#ECEFF1',  // Text Primary
          secondary: '#B0BEC5',// Text Secondary
          border: '#2A4042',   // Subtle borders
        },
        // Legacy palette mapped to the new theme
        agro: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4DD0E1',
          500: '#00BCD4',
          600: '#0097A7',
          700: '#00838F',
          800: '#006064',
          900: '#1B2D2E',
          950: '#0F1C1D',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 2s linear infinite',
        'marquee': 'marquee 12s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scan: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      }
    },
  },
  plugins: [],
}
