import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [

    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf2f0',
          100: '#fbe2de',
          200: '#f8c9c1',
          300: '#f2a497',
          400: '#e87260',
          500: '#db4934',
          600: '#c5321f',
          700: '#9C2007', // Original SmartOnse Primary Crimson
          800: '#8B1A05', // Dark Crimson
          900: '#6f190a',
          950: '#3e0802',
        },
      },
    },
  },
  plugins: [],
};
export default config;
