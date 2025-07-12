/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,js}",
    "./node_modules/flowbite/**/*.js"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#32a850',
          100: '#32a850',
          200: '#32a850',
          300: '#32a850',
          400: '#32a850',
          500: '#32a850',
          600: '#32a850',
          700: '#32a850',
          800: '#32a850',
          900: '#2b6643',
          950: '#4c0519'
        }
      }
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
}

