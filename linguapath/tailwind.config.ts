import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Nunito", "ui-rounded", "system-ui", "sans-serif"],
        sans: ["Nunito", "ui-rounded", "system-ui", "sans-serif"],
        cjk: [
          "Nunito",
          '"Hiragino Kaku Gothic ProN"',
          '"Hiragino Sans"',
          '"Noto Sans JP"',
          '"Noto Sans KR"',
          '"Malgun Gothic"',
          '"Apple SD Gothic Neo"',
          "Meiryo",
          "sans-serif",
        ],
      },
      colors: {
        brand: {
          50: "#effefa",
          100: "#c9fdec",
          200: "#94f9d9",
          300: "#53f2c0",
          400: "#22e3a6",
          500: "#0cc78c",
          600: "#04a071",
          700: "#07805d",
          800: "#0b654c",
          900: "#0d5340",
          950: "#023021",
        },
        sun: {
          300: "#ffd75e",
          400: "#ffc62e",
          500: "#f5a623",
        },
        coral: {
          400: "#ff6b6b",
          500: "#f43f5e",
          600: "#e11d48",
        },
        grape: {
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
        },
      },
      boxShadow: {
        chunky: "0 4px 0 0 rgba(0,0,0,0.18)",
        "chunky-sm": "0 3px 0 0 rgba(0,0,0,0.18)",
        "chunky-lg": "0 6px 0 0 rgba(0,0,0,0.18)",
        pop: "0 8px 24px -8px rgba(4, 160, 113, 0.45)",
      },
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(-4deg)" },
          "50%": { transform: "rotate(4deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pop-in": {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        wiggle: "wiggle 0.5s ease-in-out",
        float: "float 3s ease-in-out infinite",
        "pop-in": "pop-in 0.25s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
