/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#5B3FC6",
        "primary-dark": "#4A32A3",
        secondary: "#159A61",
        "secondary-dark": "#0F7A4C",
        surface: "#EFF7F2",
      },
    },
  },
  plugins: [],
};
