/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F8F9FB",
        surface: "#FFFFFF",
        "surface-hover": "#F1F3F5",
        border: "#E2E5EA",
        accent: "#4F46E5",
        "accent-hover": "#4338CA",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
