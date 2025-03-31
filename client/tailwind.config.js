/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        handwritten: ['Caveat', 'cursive'],
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
