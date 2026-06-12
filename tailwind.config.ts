import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        pitch: {
          950: "#050a08",
          900: "#0a1410",
          800: "#122018",
          700: "#1a2e24",
        },
        gold: {
          400: "#f5c842",
          500: "#e8b020",
          600: "#c9920a",
        },
        turf: {
          400: "#3dd68c",
          500: "#22c55e",
          600: "#16a34a",
        },
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34,197,94,0.25), transparent)",
        "card-shine":
          "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)",
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease-out forwards",
        "pulse-soft": "pulseSoft 3s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
