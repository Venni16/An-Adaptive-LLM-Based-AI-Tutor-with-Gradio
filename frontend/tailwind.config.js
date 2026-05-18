/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#07080e",
        cardBg: "rgba(17, 19, 30, 0.7)",
        accentViolet: "#8b5cf6",
        accentCyan: "#06b6d4",
      },
      fontFamily: {
        display: ["'Plus Jakarta Sans'", "sans-serif"],
        sans: ["'Inter'", "sans-serif"],
      },
      animation: {
        'pulse-slow': 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-slow': 'glow 12s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { transform: 'scale(1) translate(0px, 0px)', opacity: 0.35 },
          '33%': { transform: 'scale(1.2) translate(40px, -60px)', opacity: 0.55 },
          '66%': { transform: 'scale(0.85) translate(-30px, 40px)', opacity: 0.25 },
        }
      }
    },
  },
  plugins: [],
}
