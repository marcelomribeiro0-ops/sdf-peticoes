import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f6f7f9",
          100: "#eceef2",
          200: "#d5d9e0",
          300: "#b0b7c3",
          400: "#838d9d",
          500: "#5f6a7a",
          600: "#4a5364",
          700: "#3a4250",
          800: "#272d38",
          900: "#171a21",
        },
      },
    },
  },
  plugins: [],
};
export default config;
