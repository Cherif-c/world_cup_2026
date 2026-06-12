import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        display: [
          "var(--font-display)",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        fifa: {
          blue: "#1e40af",
          "blue-dark": "#0f172a",
          "blue-mid": "#2563eb",
          "blue-light": "#60a5fa",
          midnight: "#0f172a",
        },
        dz: {
          green: "#047857",
          "green-bright": "#059669",
          red: "#dc2626",
          white: "#ffffff",
        },
        surface: {
          DEFAULT: "#ffffff",
          page: "#f8fafc",
          card: "#ffffff",
          muted: "#f1f5f9",
          elevated: "#ffffff",
        },
        ink: {
          DEFAULT: "#0f172a",
          secondary: "#475569",
          tertiary: "#94a3b8",
          onDark: "#f8fafc",
          "onDark-muted": "#94a3b8",
        },
        line: {
          DEFAULT: "#cbd5e1",
          soft: "#e2e8f0",
        },
      },
      boxShadow: {
        card: "0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)",
        "card-hover":
          "0 4px 12px rgba(15, 23, 42, 0.08), 0 2px 4px rgba(15, 23, 42, 0.04)",
        nav: "0 1px 0 rgba(15, 23, 42, 0.06)",
      },
      borderRadius: {
        card: "8px",
        "card-lg": "12px",
      },
    },
  },
  plugins: [],
};

export default config;
