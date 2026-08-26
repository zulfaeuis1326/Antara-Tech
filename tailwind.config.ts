import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f6f5fb",
          100: "#f0eefa",
          400: "#9a9ab0",
          500: "#6b6b80",
          900: "#2b2b3c",
        },
        brand: {
          400: "#8b6bf0",
          500: "#6c4ce0",
          600: "#5a3ecb",
        },
        blue: { 500: "#3a8bfd" },
        gold: { 500: "#ffab3d" },
        pink: { 500: "#ff6f91" },
        teal: { 500: "#1fb89a" },
      },
      borderRadius: {
        xl2: "1.5rem",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        display: ["Sora", "ui-sans-serif", "system-ui"],
      },
      backgroundImage: {
        "grad-purple": "linear-gradient(135deg,#8b6bf0 0%,#6c4ce0 100%)",
        "grad-blue": "linear-gradient(135deg,#4facfe 0%,#3a8bfd 100%)",
        "grad-gold": "linear-gradient(135deg,#ffd36e 0%,#ffab3d 100%)",
        "grad-pink": "linear-gradient(135deg,#ff9a8b 0%,#ff6f91 100%)",
        "grad-teal": "linear-gradient(135deg,#3ecfb2 0%,#1fb89a 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
