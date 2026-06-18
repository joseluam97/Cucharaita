/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#1d4fd7',    // Azul principal
        'brand-secondary': '#479ee6',  // Azul secundario 1
        'brand-light': '#9fd7e0',      // Azul secundario 2
        'brand-cream': '#f2e8b5',      // Crema
        'brand-accent': '#f7c8a1',     // Melocotón (Énfasis)
        'brand-dark': '#2b2b2b',       // Textos oscuros
        'brand-white': '#ffffff',
        'brand-black': '#000000',
      },
      fontFamily: {
        'cooper': ['"Cooper Black"', '"Baloo 2"', 'serif'],
        'sans': ['"Quicksand"', '"Nunito"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}