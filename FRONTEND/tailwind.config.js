/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        deepteal: "#2B4343",
        warmcoal: "#DC6F4A",
        softmint: "#EFF3F1",
        mint: "#719482",
        charcoal: "#292929",
      },
    },
  },
  plugins: [],
};
