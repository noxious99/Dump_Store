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
        header: '1 rem'
      },
      colors: {
        ...colors,
        primary: '#6366F1',
        primaryForeground: '#F8FAFC',
        secondary: '#0EA5E9',
        foreground: '#FAFAFB',
        foregroundDark: '#0F172A',
        heading: '#ffffff',
        dark: "#0c0c0c",
        grey: '#1D1D1D',
        greyLite: '#f1f1fe',
        greyPrimary: '#F1FAFE',
        error: '#db2525',
        warning: '#F59E0B',
        success: '#84CC16',
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
