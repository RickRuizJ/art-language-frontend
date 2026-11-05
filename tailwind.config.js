/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff9f8', 100: '#d9efec', 200: '#b4ddd7', 300: '#82c5bf',
          400: '#53aaa3', 500: '#32938f', 600: '#237b7b', 700: '#1d6266',
          800: '#1c5054', 900: '#193f45',
        },
        secondary: {
          50: '#f1f5f9', 100: '#e2eaf1', 200: '#c8d4e1', 300: '#a2b5c9',
          400: '#718da8', 500: '#4f708e', 600: '#385772', 700: '#2b455f',
          800: '#20354d', 900: '#14253d',
        },
        accent: {
          50: '#fff9f2', 100: '#fff0dc', 200: '#ffddb8', 300: '#f7c58a',
          400: '#e9a865', 500: '#d58d49', 600: '#b97639', 700: '#945a2d',
          800: '#744827', 900: '#613d27',
        },
        neutral: {
          50: '#f7f9fa', 100: '#eef2f4', 200: '#dde5e8', 300: '#c4d0d5',
          400: '#91a1a9', 500: '#6b7b85', 600: '#4d606b', 700: '#374a56',
          800: '#253744', 900: '#132735',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 15px 30px -5px rgba(0, 0, 0, 0.08)',
        'large': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 20px 50px -10px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
