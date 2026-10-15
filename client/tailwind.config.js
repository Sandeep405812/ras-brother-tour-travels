/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0A1128',
          navy: '#1C2541',
          slate: '#3A506B',
          accent: '#5BC0BE',
          gold: '#E5A93B',
          goldDark: '#C68A27',
          goldLight: '#FDE68A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
