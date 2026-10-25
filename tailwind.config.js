/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        finance: {
          income: '#10B981',    // emerald
          savings: '#06B6D4',   // cyan
          housing: '#6366F1',   // indigo
          food: '#F59E0B',      // amber
          transport: '#EC4899', // pink
          utilities: '#8B5CF6', // purple
          shopping: '#F97316',  // orange
          entertainment: '#14B8A6', // teal
          health: '#EF4444',    // red
          personal: '#84CC16',  // lime
          other: '#64748B'      // slate
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}
