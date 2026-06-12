import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        display: ["var(--font-display)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        surface: {
          DEFAULT: "#ffffff",
          muted: "#f5f5f7",
          elevated: "#fafafa",
        },
        ink: {
          DEFAULT: "#1d1d1f",
          secondary: "#6e6e73",
          tertiary: "#86868b",
        },
        fifa: {
          navy: "#0b1f3a",
          deep: "#152a4a",
          gold: "#c9a227",
          "gold-light": "#e8c547",
        },
        dz: {
          green: "#006233",
          "green-light": "#00874a",
          red: "#d21034",
          white: "#ffffff",
        },
        line: {
          DEFAULT: "#d2d2d7",
          soft: "#e8e8ed",
        },
      },
      boxShadow: {
        apple: "0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
        "apple-lg": "0 8px 30px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
        table: "0 1px 0 rgba(0,0,0,0.04)",
      },
      borderRadius: {
        apple: "12px",
        "apple-lg": "18px",
      },
    },
  },
  plugins: [],
};

export default config;
