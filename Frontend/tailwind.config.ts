import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#f8f3ee",
        shell: "#f4efe9",
        sand: "#e8d7c1",
        bronze: "#b7835a",
        cocoa: "#3f312b",
        charcoal: "#1f1a17",
        gold: "#d8b57a",
        blush: "#f3e2d8",
      },
      boxShadow: {
        soft: "0 2px 18px rgba(70, 52, 39, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
