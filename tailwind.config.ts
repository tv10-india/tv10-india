import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class', // Enables the Dark/Light toggle
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        tv10: {
          gold: '#FFC107',    // Bright Yellow (Map color)
          red: '#D32F2F',     // Deep Red (Play Button/Live)
          metal: '#37474F',   // Dark Grey ring (Header/Footer)
          silver: '#CFD8DC',  // Light Grey (Borders)
          cream: '#FAFAFA',   // Light Mode Background (Paper feel)
          dark: '#121212',    // Dark Mode Background
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      animation: {
        'ticker': 'ticker 30s linear infinite',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        }
      }
    },
  },
  plugins: [],
};
export default config;