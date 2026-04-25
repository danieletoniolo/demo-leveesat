/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'levee-dark': '#0a0a0b',
        'levee-panel': '#161618',
        'levee-border': '#27272a',
        'levee-critical': '#ef4444',
        'levee-moderate': '#eab308',
        'levee-normal': '#22c55e',
      },
      animation: {
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
