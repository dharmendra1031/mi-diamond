import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0B1A2F",
          50: "#F2F5F9",
          100: "#DCE3EE",
          200: "#A9B6CC",
          300: "#7689AB",
          400: "#445D89",
          500: "#1F3460",
          600: "#152544",
          700: "#0B1A2F",
          800: "#07111F",
          900: "#040A14",
        },
        gold: {
          DEFAULT: "#C9A24A",
          50: "#FBF6E9",
          100: "#F4E8C2",
          200: "#E9D38A",
          300: "#DCBB58",
          400: "#C9A24A",
          500: "#A8842F",
          600: "#866921",
          700: "#634D17",
          800: "#41320E",
          900: "#221A06",
        },
        silver: {
          50: "#F8F8F6",
          100: "#ECECE7",
          200: "#D8D8CF",
          300: "#BFC0B4",
          400: "#A8AA9C",
          500: "#7F8375",
          600: "#62675C",
          700: "#464B43",
          800: "#30342F",
          900: "#1D211D",
        },
        cream: "#FBF8F2",
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 18px 50px -30px rgba(11, 26, 47, 0.38)",
        gold: "0 16px 38px -18px rgba(201, 162, 74, 0.55)",
        premium: "0 28px 80px -44px rgba(11, 26, 47, 0.65)",
      },
    },
  },
  plugins: [],
} satisfies Config;
