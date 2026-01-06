/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Professional Navy Scale
                navy: {
                    900: '#0F172A',
                    800: '#1E293B',
                    700: '#334155',
                },
                // Refined Teal Accent
                teal: {
                    600: '#0EA5E9',
                    500: '#06B6D4',
                    400: '#22D3EE',
                },
                // Neutral Grays
                slate: {
                    50: '#F8FAFC',
                    100: '#F1F5F9',
                    200: '#E2E8F0',
                    300: '#CBD5E1',
                    600: '#475569',
                    900: '#0F172A',
                },
                // Legacy school colors (keep for now)
                'school-green': '#004d25',
                'school-navy': '#002147',
            },
            fontFamily: {
                sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
                heading: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
            },
            // Professional animations (remove bounce-slow, glow, float)
            animation: {
                'fade-in': 'fadeIn 0.4s ease-out forwards',
                'slide-up': 'slideUp 0.3s ease-out forwards',
                'slide-down': 'slideDown 0.2s ease-out forwards',
                'scale-in': 'scaleIn 0.3s ease-out forwards',
                'shimmer': 'shimmer 1.5s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(12px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-12px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.98)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
            },
            // Professional shadows (updated to teal accents)
            boxShadow: {
                'soft': '0 4px 24px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
                'elevated': '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.06)',
                'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
                'teal-glow': '0 4px 24px rgba(14, 165, 233, 0.2)',
            },
            backdropBlur: {
                'xs': '2px',
            },
        },
    },
    plugins: [],
}

