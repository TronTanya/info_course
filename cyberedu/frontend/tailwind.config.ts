import type { Config } from "tailwindcss";

/**
 * Tailwind CSS v4 — theme tokens live in app/design-tokens.css + app/design-system.css (@theme inline).
 * This file configures content paths and documents the design system entry points.
 */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
