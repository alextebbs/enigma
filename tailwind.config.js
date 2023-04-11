/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ], // remove unused styles in production
  darkMode: 'media', // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        body: ['"Inconsolata"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
