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
          blue: "#059669",
          "blue-dark": "#0c1220",
          "blue-mid": "#047857",
          "blue-light": "#34d399",
          midnight: "#070b12",
        },
        accent: {
          emerald: "#059669",
          "emerald-bright": "#10b981",
          gold: "#d97706",
          charcoal: "#111827",
        },
        dz: {
          green: "#006233",
          "green-bright": "#00a651",
          red: "#d21034",
          "red-dark": "#a00c28",
          white: "#ffffff",
        },
        surface: {
          DEFAULT: "#ffffff",
          page: "#eef2f6",
          card: "#ffffff",
          muted: "#f4f7fa",
        },
        ink: {
          DEFAULT: "#0a0a0a",
          secondary: "#4a5568",
          tertiary: "#718096",
          onDark: "#f7fafc",
          "onDark-muted": "#94a3b8",
        },
        line: {
          DEFAULT: "#cbd5e0",
          soft: "#e2e8f0",
        },
      },
      boxShadow: {
        card: "0 4px 24px rgba(12, 18, 32, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04)",
        "card-lg": "0 12px 40px rgba(12, 18, 32, 0.14)",
        nav: "0 4px 24px rgba(0, 0, 0, 0.35)",
        glow: "0 0 0 1px rgba(5, 150, 105, 0.2), 0 8px 28px rgba(5, 150, 105, 0.14)",
      },
      backgroundImage: {
        "fifa-header":
          "linear-gradient(135deg, #070b12 0%, #0c1220 45%, #111827 100%)",
        "dz-stripe-h":
          "linear-gradient(90deg, #006233 33.33%, #ffffff 33.33% 66.66%, #d21034 66.66%)",
        "dz-stripe-v":
          "linear-gradient(180deg, #006233 33.33%, #ffffff 33.33% 66.66%, #d21034 66.66%)",
        "prob-1": "linear-gradient(135deg, #047857 0%, #059669 100%)",
        "prob-n": "linear-gradient(135deg, #4a5568 0%, #718096 100%)",
        "prob-2": "linear-gradient(135deg, #d21034 0%, #a00c28 100%)",
      },
      borderRadius: {
        card: "10px",
        "card-lg": "14px",
      },
    },
  },
  plugins: [],
};

export default config;
