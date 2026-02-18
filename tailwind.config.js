/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cute: {
          blue: '#93C5FD',
          yellow: '#FEF08A',
          navy: '#1E3A8A',
          'light-blue': '#DBEAFE',
          'light-yellow': '#FEF9C3',
        }
      }
    },
  },
  plugins: [],
}
