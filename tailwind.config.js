/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./public/index.html"
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Nunito', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
                mono: ['Fira Code', 'Consolas', 'Monaco', 'monospace'],
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
                xl: 'calc(var(--radius) + 4px)',
            },
            colors: {
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))'
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))'
                },
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))'
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))'
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))'
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))'
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                ghibli: {
                    blue: 'hsl(var(--ghibli-blue))',
                    cream: 'hsl(var(--ghibli-cream))',
                    pink: 'hsl(var(--ghibli-pink))',
                    green: 'hsl(var(--ghibli-green))',
                    forest: 'hsl(var(--ghibli-forest))',
                    sky: 'hsl(var(--ghibli-sky))',
                    gold: 'hsl(var(--ghibli-gold))',
                },
                chart: {
                    '1': 'hsl(var(--chart-1))',
                    '2': 'hsl(var(--chart-2))',
                    '3': 'hsl(var(--chart-3))',
                    '4': 'hsl(var(--chart-4))',
                    '5': 'hsl(var(--chart-5))'
                }
            },
            boxShadow: {
                'ghibli': 'var(--shadow-soft)',
                'ghibli-card': 'var(--shadow-card)',
                'ghibli-hover': 'var(--shadow-hover)',
                'ghibli-glow': 'var(--shadow-glow)',
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                },
                'fade-in': {
                    from: { opacity: '0', transform: 'translateY(10px)' },
                    to: { opacity: '1', transform: 'translateY(0)' }
                },
                'slide-up': {
                    from: { opacity: '0', transform: 'translateY(20px)' },
                    to: { opacity: '1', transform: 'translateY(0)' }
                },
                'scale-pop': {
                    from: { transform: 'scale(0.95)', opacity: '0' },
                    to: { transform: 'scale(1)', opacity: '1' }
                },
                'shimmer': {
                    from: { backgroundPosition: '200% 0' },
                    to: { backgroundPosition: '-200% 0' }
                },
                'pulse-soft': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' }
                }
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'fade-in': 'fade-in 0.4s ease-out',
                'slide-up': 'slide-up 0.3s ease-out',
                'scale-pop': 'scale-pop 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                'shimmer': 'shimmer 2s linear infinite',
                'pulse-soft': 'pulse-soft 2s ease-in-out infinite'
            },
            transitionTimingFunction: {
                'ghibli': 'cubic-bezier(0.4, 0, 0.2, 1)',
                'ghibli-bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            }
        }
    },
    plugins: [require("tailwindcss-animate")],
};
