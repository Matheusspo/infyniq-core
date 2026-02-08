/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts}', // Isso diz ao Tailwind para ler seus componentes Angular
  ],
  theme: {
    extend: {
      colors: {
        // Cores personalizadas para a Repair Elevadores
        primary: '#1e40af',
        secondary: '#64748b',
        critical: '#ef4444',
      },
    },
  },
  plugins: [],
};
