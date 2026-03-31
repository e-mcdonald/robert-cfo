/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0d0f14',
        'bg-card': '#161922',
        'bg-card-hover': '#1e2330',
        'accent-teal': '#00d4aa',
        'accent-amber': '#f59e0b',
        'text-primary': '#f0f2f7',
        'text-secondary': '#8892a4',
        'text-muted': '#4a5568',
        border: '#252d3d',
        red: '#f87171',
        green: '#34d399',
      },
      fontFamily: {
        mono: ['"DM Mono"', 'monospace'],
        heading: ['Syne', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
