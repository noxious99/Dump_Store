const colors = require('tailwindcss/colors');
/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        handwritten: ['Caveat', 'cursive'],
      },
      fontSize: {
        header: '1.25 rem'
      },
      colors: {
        ...colors,
        primary: '#550000',
        dark: "#0c0c0c",
        grey: '#1D1D1D',
        error: '#dc2626',
        btn: {
          red: {
            DEFAULT: "#802828",
            active: "#993333"
          },
          green: {
            DEFAULT: "#052E16",
            active: "#14532D"
          }
        }
      }
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
