/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      colors: {
        posyandu: {
          cream: '#FCF9F4',      // Warm paper surface (inspirasi Diskusi.AI #FCF7F1)
          sand: '#F5EFE6',       // Warm border/secondary surface (#FFF4E7 tint)
          mint: '#F0FDFA',       // Soft teal wash (teal-50)
          teal: '#0D9488',       // Brand primary (teal-600)
          tealDark: '#0F766E',   // Brand header/deep (teal-700 - serasi dengan Beranda)
          emerald: '#10B981',    // Active/Verified badge
          amber: '#F59E0B',      // Warm accent
          coral: '#F43F5E',      // Balita perempuan / warm blush
          sky: '#3B82F6',        // Balita laki-laki / trust accent
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        }
      },
      boxShadow: {
        'warm-card': '0 14px 34px -10px rgba(15, 118, 110, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04)',
        'teal-cta': '0 10px 22px -5px rgba(13, 148, 136, 0.38)',
      }
    },
  },
  plugins: [],
}