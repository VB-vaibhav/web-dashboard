/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // ✅ Critical for your dark toggle to work
  theme: {
    extend: {},
  },
  plugins: [],
};
