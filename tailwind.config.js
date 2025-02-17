/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    fontFamily: {
      display: ['Circular', 'Helvetica', 'Arial', 'sans-serif'],
      body: ['Circular', 'Helvetica', 'Arial', 'sans-serif']
    },
    extend: {
      colors: {
        primary: '#8d81f7',
        accent: '#a499ff',
        secondary: '#f5ea00',
        black: '#191414',
        white: '#edecf9',
        gray: '#B3B3B3',
        darkgray: '#282828'
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
