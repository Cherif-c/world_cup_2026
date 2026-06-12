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
          blue: "#003087",
          "blue-dark": "#001a4d",
          "blue-mid": "#0048a8",
          "blue-light": "#3d7dd6",
          midnight: "#0d1b2a",
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
          page: "#e8edf4",
          card: "#ffffff",
          muted: "#f4f7fb",
        },
        ink: {
          DEFAULT: "#0a0a0a",
          secondary: "#4a5568",
          tertiary: "#718096",
          onDark: "#f7fafc",
          "onDark-muted": "#a0aec0",
        },
        line: {
          DEFAULT: "#cbd5e0",
          soft: "#e2e8f0",
        },
      },
      boxShadow: {
        card: "0 4px 24px rgba(0, 26, 77, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04)",
        "card-lg": "0 12px 40px rgba(0, 26, 77, 0.12)",
        nav: "0 4px 20px rgba(0, 0, 0, 0.25)",
        glow: "0 0 0 1px rgba(0, 48, 135, 0.15), 0 8px 24px rgba(0, 48, 135, 0.12)",
      },
      backgroundImage: {
        "fifa-header":
          "linear-gradient(135deg, #001a4d 0%, #003087 55%, #0d1b2a 100%)",
        "dz-stripe-h":
          "linear-gradient(90deg, #006233 33.33%, #ffffff 33.33% 66.66%, #d21034 66.66%)",
        "dz-stripe-v":
          "linear-gradient(180deg, #006233 33.33%, #ffffff 33.33% 66.66%, #d21034 66.66%)",
        "prob-1": "linear-gradient(135deg, #003087 0%, #0048a8 100%)",
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
