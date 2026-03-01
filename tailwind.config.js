/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.html', './src/**/*.js'],
    theme: {
        extend: {
            colors: {
                bg: 'var(--color-bg, #09090b)',
                surface: 'var(--color-surface, #18181b)',
                surfaceHighlight: 'var(--color-surface-highlight, #27272a)',
                border: 'var(--color-border, #3F3F46)',
                muted: 'var(--color-muted, #A1A1AA)',
                accent: 'var(--color-accent, #FACC15)',
                accentBlue: 'var(--color-accent-blue, #60A5FA)',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            boxShadow: {
                glow: '0 0 20px rgba(250, 204, 21, 0.15)',
            },
        },
    },
    plugins: [],
};
