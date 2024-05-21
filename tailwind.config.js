/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')
const animation = require('tailwindcss/defaultTheme')

module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      animation: {
        'bounce-once': 'bounceOnce .3s ease-out',
      },
      keyframes: {
        bounceOnce: {
          '0%': { right: '-100px' },
          '100%': { right: '0' },
        }
      }
    },
    colors: {
      ...colors,
      primary: '#0B2870',
      secondary: 'rgba(232,234,241,1)',
      'secondary-50': 'rgba(232,234,241,.5)',
      mila_orange: '#ff5406',
    },
  },
  plugins: [],
}

