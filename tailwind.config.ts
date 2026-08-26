import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Palet utama Antara Tech — hangat, tidak korporat-biru-putih generik
        brand: {
          50: "#fef6f0",
          100: "#fde8da",
          200: "#fbcdb0",
          300: "#f7a978",
          400: "#f27f45",
          500: "#e85d2a", // aksen utama (terracotta)
          600: "#c9451c",
          700: "#a5341a",
          800: "#832b1c",
          900: "#6b2519",
        },
        teal: {
          400: "#3ecfb2",
          500: "#1fb89a",
          600: "#159480",
        },
        ink: {
          900: "#14161a", // dasar dark mode (abu gelap kebiruan, bukan hitam pekat)
          800: "#1c1f26",
          700: "#262a33",
        },
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
