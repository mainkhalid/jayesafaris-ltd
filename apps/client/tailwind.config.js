/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        'dark-gray-custom' : '#2A2928',
        'dark-olive-custom': '#3D3D00',
        'dark-olive' : '#202815',
        'dark-olive-2' : '#151b0e',
      }
    },
  },
  plugins: [],
}