/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}','./components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#C0001A',
        'primary-dark': '#8B0000',
        'primary-light': '#FF3355',
        'primary-pale': '#FFF0F2',
        bg: '#FFF8F0',
      },
      fontFamily: {
        sans: ['Hind Siliguri', 'sans-serif'],
      },
      animation: {
        heartbeat: 'heartbeat 1.5s ease-in-out infinite',
        fadeIn: 'fadeIn 0.3s ease-out',
        slideDown: 'slideDown 0.3s ease-out',
      },
      keyframes: {
        heartbeat: {
          '0%,100%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.3)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.15)' },
          '56%': { transform: 'scale(1)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', maxHeight: '0' },
          to: { opacity: '1', maxHeight: '500px' },
        },
      },
    },
  },
  plugins: [],
}
