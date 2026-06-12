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
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        fifa: {
          blue: "#003087",
          "blue-dark": "#001a4d",
          "blue-mid": "#0048a8",
          "blue-light": "#3d7dd6",
          black: "#0a0a0a",
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
          dark: "#2d3748",
        },
      },
      boxShadow: {
        card: "0 4px 24px rgba(0, 26, 77, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04)",
        "card-lg": "0 12px 40px rgba(0, 26, 77, 0.12)",
        nav: "0 4px 20px rgba(0, 0, 0, 0.25)",
      },
      backgroundImage: {
        "fifa-header":
          "linear-gradient(135deg, #001a4d 0%, #003087 50%, #0d1b2a 100%)",
        "page-mesh":
          "radial-gradient(ellipse at 0% 0%, rgba(0,98,51,0.06) 0%, transparent 50%), radial-gradient(ellipse at 100% 100%, rgba(210,16,52,0.05) 0%, transparent 50%), radial-gradient(ellipse at 50% 0%, rgba(0,48,135,0.08) 0%, transparent 60%)",
        "dz-stripe-h":
          "linear-gradient(90deg, #006233 33.33%, #ffffff 33.33% 66.66%, #d21034 66.66%)",
        "dz-stripe-v":
          "linear-gradient(180deg, #006233 33.33%, #ffffff 33.33% 66.66%, #d21034 66.66%)",
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
