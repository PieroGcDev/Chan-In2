/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#F57C00",
        "primary-dark": "#E65100",
        secondary: "#333333",
        "bg-light": "#F5F5F5",
      },
      borderRadius: {
        DEFAULT: "0.5rem",
      },
      // 👇 Agrega esto
      keyframes: {
        strongPulse: {
          "0%, 100%": { opacity: "0.1" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        strongPulse: "strongPulse 1s ease-in-out infinite",
      },
    },
  },
  plugins: [
    require('tailwindcss-filters')
  ],
};
