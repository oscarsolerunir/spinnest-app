/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    fontFamily: {
      display: ['Atkinson Hyperlegible', 'Helvetica', 'Arial', 'sans-serif'],
      body: ['Atkinson Hyperlegible', 'Helvetica', 'Arial', 'sans-serif']
    },
    extend: {
      colors: {
        primary: '#8D81F7',
        accent: '#A499FF',
        secondary: '#81F7B6',
        dark: '#17161A',
        darkaccent: '#262529',
        light: '#EDECF9',
        lightaccent: '#FCFBFF',
        neutral: '#A3A2AD',
        neutralaccent: '#D9D9E0'
      },
      spacing: {
        128: '32rem',
        144: '36rem'
      },
      borderRadius: {
        '4xl': '2rem'
      }
    }
  },
  plugins: []
}
