/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        surface: "#171717",
        surfaceHover: "#262626",
        border: "#262626",
        amber: {
          400: "#fbbf24",
          500: "#f59e0b",
        },
        text: {
          main: "#f5f5f5",
          muted: "#a3a3a3",
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      }
    },
  },
  plugins: [],
}
