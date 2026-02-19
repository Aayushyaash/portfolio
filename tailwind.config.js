/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.html', './src/**/*.js'],
    theme: {
        extend: {
            colors: {
                bg: 'var(--color-bg)',
                surface: 'var(--color-surface)',
                surfaceHighlight: 'var(--color-surface-highlight)',
                border: 'var(--color-border)',
                muted: 'var(--color-muted)',
                accent: 'var(--color-accent)',
                accentBlue: 'var(--color-accent-blue)',
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
