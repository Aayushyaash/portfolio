/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.html', './src/**/*.js'],
    theme: {
        extend: {
            colors: {
                bg: '#09090b',
                surface: '#18181b',
                surfaceHighlight: '#27272a',
                border: '#3F3F46',
                muted: '#A1A1AA',
                accent: 'var(--accent-color, #FACC15)',
                accentBlue: '#60A5FA',
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
