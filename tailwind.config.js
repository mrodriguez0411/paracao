/** @type {import('tailwindcss').Config} */
const base = require('./tailwind.config-bak.js')

module.exports = {
  ...base,
  theme: {
    ...base.theme,
    extend: {
      ...(base.theme?.extend || {}),
      fontFamily: {
        oswald: ['Oswald', 'ui-sans-serif', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial'],
      },
    },
  },
}
