import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#F5F3EE",
          surface: "#FFFCF7",
          green: "#284D2D",
          dark: "#233028",
          muted: "#69706A"
        }
      },
      boxShadow: {
        soft: "0 8px 30px rgba(35, 48, 40, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
