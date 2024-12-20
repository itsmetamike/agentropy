import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      spacing: {
        'line': '1.20rem',
      },
      borderWidth: {
        'DEFAULT': '2px',
      },
      colors: {
        'text': 'var(--text-color)',
        'text-alt': 'var(--text-alt-color)',
        'bg': 'var(--bg-color)',
        'bg-alt': 'var(--bg-alt-color)',
        'hn-orange': '#ff6600',
      },
      fontWeight: {
        normal: '500',
        medium: '600',
        bold: '800',
      },
      maxWidth: {
        'content': '80ch',
      },
    },
  },
  plugins: [],
}

export default config;
