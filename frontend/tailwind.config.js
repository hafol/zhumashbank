/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#10b981", // Emerald 500
                secondary: "#34d399", // Emerald 400
                danger: "#f87171", // Red 400
                dark: "#1e293b", // Slate 800
                light: "#f1f5f9", // Slate 100
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
