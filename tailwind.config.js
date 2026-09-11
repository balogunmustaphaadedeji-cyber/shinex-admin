/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#14532D",
        "primary-dark": "#0F3D21",
        secondary: "#22C55E",
        "secondary-dark": "#16A34A",
        surface: "#F3FBF6",
      },
    },
  },
  plugins: [],
};
