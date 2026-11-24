/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        disha: {
          lightBg: '#F5F9F8',
          lightPrimary: '#087F70',
          lightSecondary: '#DFF5EE',
          lightCard: '#FFFFFF',
          lightText: '#172B2A',
          
          darkBg: '#101B20',
          darkPrimary: '#5CD6BD',
          darkSecondary: '#174B43',
          darkCard: '#203037',
          darkText: '#F1F5F9',
          
          emergency: '#DC2626',
          amber: '#D97706',
          green: '#16A34A',
          blue: '#2563EB',
        }
      },
      borderRadius: {
        'card': '16px',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans', 'Noto Sans Devanagari', 'Noto Sans Gurmukhi', 'Noto Sans Bengali', 'Noto Sans Tamil', 'Noto Sans Telugu', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
