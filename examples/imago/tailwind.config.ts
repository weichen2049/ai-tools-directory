import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        lux: {
          bg: "#020202", // Deeper black
          surface: "#080808", // Very subtle contrast
          surface2: "#121212", // Slightly lighter for inputs
          text: "#f2f2f2", // Off-white, not harsh
          muted: "#888888", // Neutral gray
          accent: "#d4af37", // Gold remains for focus
          brand: "#ffffff", // Move towards monochrome brand
          brandSoft: "#cccccc",
          line: "rgba(255, 255, 255, 0.08)", // Very subtle borders
          lineStrong: "rgba(255, 255, 255, 0.15)"
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Cinzel", "serif"]
      },
      boxShadow: {
        lux: "0 20px 40px -10px rgba(0, 0, 0, 0.5)",
        "lux-soft": "0 4px 20px -5px rgba(0, 0, 0, 0.3)"
      },
      borderRadius: {
        lux: "2px", // Sharper, more premium corners
        "lux-lg": "4px"
      },
      backgroundImage: {
        "lux-noise": "var(--lux-noise)"
      }
    }
  },
  plugins: []
} satisfies Config;