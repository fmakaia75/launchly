import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      keyframes: {
        "float-y": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" }
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "0.85" }
        },
        "reveal-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0px)" }
        },
        "shine": {
          "0%": { transform: "translateX(-60%)" },
          "100%": { transform: "translateX(160%)" }
        }
      },
      animation: {
        "float-y": "float-y 7s ease-in-out infinite",
        "pulse-glow": "pulse-glow 6s ease-in-out infinite",
        "reveal-up": "reveal-up 800ms cubic-bezier(.16,1,.3,1) both",
        "shine": "shine 1.4s ease-in-out infinite"
      },
      boxShadow: {
        neon: "0 0 0 1px rgba(166,255,0,.35), 0 0 45px rgba(166,255,0,.18)",
        soft: "0 12px 40px rgba(0,0,0,.45)"
      }
    }
  },
  plugins: []
};

export default config;

