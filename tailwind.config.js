/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta de colores médicos (verdes/azules suaves)
        medical: {
          blue: {
            50: '#e6f2ff',
            100: '#b3d9ff',
            200: '#80bfff',
            300: '#4da6ff',
            400: '#1a8cff',
            500: '#0073e6',
            600: '#005bb3',
            700: '#004280',
            800: '#002a4d',
            900: '#00111a',
          },
          green: {
            50: '#e6f7f0',
            100: '#b3e6d1',
            200: '#80d5b2',
            300: '#4dc493',
            400: '#1ab374',
            500: '#009955',
            600: '#007744',
            700: '#005533',
            800: '#003322',
            900: '#001111',
          },
        },
      },
    },
  },
  plugins: [],
};
