/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores corporativos de ValorApp
        'primary': '#0000D0',      // Azul corporativo
        'primary-light': '#3333E0', // Azul más claro para degradados
        'primary-dark': '#0000A0',  // Azul más oscuro
        'secondary': '#FF3184',    // Rosa vibrante
        'secondary-dark': '#E0106A', // Rosa más oscuro para degradados
        'light-gray': '#F5F5F5',
        'medium-gray': '#D9D9D9',
        'dark-gray': '#333333',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
        'poppins': ['Poppins', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #0000D0 0%, #3333E0 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #FF3184 0%, #E0106A 100%)',
      },
      boxShadow: {
        'pink-glow': '0 10px 30px rgba(255, 49, 132, 0.3)',
        'pink-glow-lg': '0 15px 40px rgba(255, 49, 132, 0.5)',
        'blue-glow': '0 10px 30px rgba(0, 0, 208, 0.3)',
      },
    },
  },
  plugins: [],
}
