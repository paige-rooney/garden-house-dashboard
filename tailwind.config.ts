import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#FAF7EF",
          surface: "#FFFFFF",
          green: "#637D4F",
          rust: "#A64A0F",
          blue: "#3865A2",
          dark: "#2C3328",
          muted: "#6B7064",
        },
      },
      fontFamily: {
        sans: ["var(--font-body)", "Georgia", "serif"],
        heading: ["var(--font-display)", "Georgia", "serif"],
        alta: ["Alta", "var(--font-secondary)", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 30px rgba(44, 51, 40, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
