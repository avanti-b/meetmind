import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class" as const,
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        body: ["'Outfit'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        black:   "#0c0b0a",
        graphite:"#1c1a18",
        carbon:  "#252220",
        stone:   "#2e2b28",
        ash:     "#3d3935",
        mist:    "#6b6560",
        silver:  "#a8b0bc",
        cream:   "#f5f0eb",
        white:   "#faf8f5",
        ember: {
          DEFAULT: "#c4702a",
          dim:     "#8a4d1c",
          bright:  "#e8a060",
          glow:    "rgba(196,112,42,0.15)",
          pulse:   "rgba(196,112,42,0.06)",
        },
      },
      animation: {
        "ember-pulse": "ember-pulse 2.5s ease-in-out infinite",
        "drift-y":     "drift-y 6s ease-in-out infinite",
        "slow-rotate": "slow-rotate 20s linear infinite",
        "scan-line":   "scan-line 6s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
