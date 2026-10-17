/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#050505',
        surface: '#0D0E12',
        tertiary: '#12141C',
        terminal: {
          border: '#1F2330',
          text: '#E2E8F0',
          muted: '#64748B',
          green: '#00FF66',
          red: '#FF3366',
          cyan: '#00E5FF',
          amber: '#FFB800',
          purple: '#A855F7',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', '"IBM Plex Mono"', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}
