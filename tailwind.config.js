

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f3f9',
          100: '#dce3f0',
          200: '#b8c7e0',
          300: '#8ea5cc',
          400: '#6683b5',
          500: '#4a6a9e',
          600: '#3a5480',
          700: '#2d4163',
          800: '#1e2d4d',
          900: '#1a2744',
          950: '#0f1a2e',
        },
        green: {
          50: '#edfcf2',
          100: '#d3f8e0',
          200: '#a9efc5',
          300: '#72e1a4',
          400: '#3acc7f',
          500: '#1db064',
          600: '#109050',
          700: '#0d7341',
          800: '#0e5b36',
          900: '#0c4b2e',
          950: '#042a19',
        },
      },
      fontFamily: {
        sans: ['Roboto', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}