/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Design system typeface — see DESIGN.md
        sans: ['var(--font-nunito)', 'Nunito', 'system-ui', 'sans-serif'],
      },
      colors: {
        cream: '#FFFBEB',
        // Primary interactive accent (Play! button, active states)
        primary: {
          DEFAULT: '#4F46E5',
          dark:    '#3730A3',
        },
        // Semantic colours (unchanged)
        'kid-blue':   '#3B82F6',
        'kid-green':  '#22C55E',
        'kid-red':    '#EF4444',
        'kid-yellow': '#FBBF24',
        'kid-purple': '#8B5CF6',
        'kid-orange': '#F97316',
      },
      keyframes: {
        'star-burst': {
          '0%': { transform: 'scale(0) rotate(0deg)', opacity: '1' },
          '70%': { transform: 'scale(1.4) rotate(20deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        'float-up': {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '1' },
          '100%': { transform: 'translateY(-120px) scale(0.5)', opacity: '0' },
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '60%': { transform: 'scale(1.1)' },
          '80%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-8px)' },
          '40%': { transform: 'translateX(8px)' },
          '60%': { transform: 'translateX(-6px)' },
          '80%': { transform: 'translateX(6px)' },
        },
        'confetti-fall': {
          '0%': { transform: 'translateY(-20px) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
        'pulse-scale': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
        'glow': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(251, 191, 36, 0.4)' },
          '50%': { boxShadow: '0 0 30px rgba(251, 191, 36, 0.9)' },
        },
      },
      animation: {
        'star-burst': 'star-burst 0.5s ease-out forwards',
        'float-up': 'float-up 1s ease-out forwards',
        'wiggle': 'wiggle 0.5s ease-in-out infinite',
        'bounce-in': 'bounce-in 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97)',
        'shake': 'shake 0.5s ease-in-out',
        'confetti-fall': 'confetti-fall linear forwards',
        'pulse-scale': 'pulse-scale 1s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
