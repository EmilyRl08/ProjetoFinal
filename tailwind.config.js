/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sophisticated: {
          bg: '#FBFBFA',       // Off-white
          text: '#1C1C1C',     // Grafite Escuro
          primary: '#5B1A24',  // Vinho / Bordeaux
          accent: '#A3704C',   // Dourado Queimado / Bronze
          gray: '#707070',     // Cinza Neutro
          border: '#E5E5E0'    // Borda Suave
        }
      }
    },
  },
  plugins: [],
}