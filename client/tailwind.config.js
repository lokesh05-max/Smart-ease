/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // User requested palette: Warmth, Stability, Sophistication
        cloud: {
          50: '#FAF9F8',
          100: '#F3F2F0',
          200: '#E3E1DE',
          300: '#CECBC8', // Exact "Cloud" #CECBC8
          400: '#B5B1AC',
          500: '#9B9690',
        },
        zeus: {
          DEFAULT: '#28221E', // Exact "Zeus" #28221E
          700: '#443A34',
          800: '#362E29',
          900: '#28221E', // Exact "Zeus" #28221E
          950: '#1C1714',
        },
        kabul: {
          DEFAULT: '#614E41', // Exact "Kabul" #614E41
          300: '#8C7565',
          400: '#746052',
          500: '#614E41', // Exact "Kabul" #614E41
          600: '#503F34',
          700: '#3F3128',
        },
        shadow: {
          DEFAULT: '#7F6951', // Exact "Shadow" #7F6951
          100: '#F5F1EC',
          200: '#E6DCCF',
          300: '#BAA38A',
          400: '#998168',
          500: '#7F6951', // Exact "Shadow" #7F6951
          600: '#6A5641',
          700: '#544332',
        },
        // Mapped primary and warm neutrals
        primary: {
          50: '#F5F1EC',
          100: '#EAE1D6',
          200: '#D5C4B0',
          300: '#BAA38A',
          400: '#998168',
          500: '#7F6951', // Shadow
          600: '#614E41', // Kabul
          700: '#503F34',
          800: '#362E29',
          900: '#28221E', // Zeus
        },
      }
    },
  },
  plugins: [],
}
