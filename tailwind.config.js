/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'school-green': '#004d25',
                'school-navy': '#002147',
            }
        },
    },
    plugins: [],
}
