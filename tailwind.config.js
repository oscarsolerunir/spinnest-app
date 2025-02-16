/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    fontFamily: {
      display: ['Gilroy', 'sans-serif'],
      body: ['Graphik', 'sans-serif']
    },
    extend: {
      colors: {
        cyan: '#9cdbff',
        primary: '#1DA1F2',
        secondary: '#14171A',
        accent: '#657786',
        background: '#E1E8ED',
        surface: '#F5F8FA'
      },
      margin: {
        96: '24rem',
        128: '32rem'
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
