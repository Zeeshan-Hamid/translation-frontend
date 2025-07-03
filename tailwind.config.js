/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4A90E2',
          light: '#6BA5E9',
          dark: '#3A73B8',
        },
        secondary: {
          DEFAULT: '#F6F8FA',
          dark: '#E1E4E8',
        },
        success: '#34D399',
        warning: '#FBBF24',
        error: '#F87171',
      },
      boxShadow: {
        card: '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}