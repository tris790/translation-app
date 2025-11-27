/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./engine/**/*.{html,tsx,ts,jsx,js}",
    "./example/**/*.{html,tsx,ts,jsx,js}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
