/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0.5" },
          "100%": { opacity: "1" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0.5" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.075s ease-out",
        "fade-out": "fade-out 0.075s ease-out",
      },
    },
  },
  plugins: [],
};
