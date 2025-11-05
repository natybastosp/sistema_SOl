/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Cores personalizadas - Paleta SOL (Laranja/Marrom)
        sol: {
          light: "#FAFDF6", // Fundo muito claro
          pale: "#FDD26B", // Tom pálido
          primary: "#FFA500", // Laranja vibrante (PRINCIPAL)
          dark: "#B76004", // Laranja escuro
          darker: "#6F1A07", // Marrom escuro
        },
        // Paleta de Emoções
        emotion: {
          joy: "#FFD700", // Alegria
          sadness: "#4A90E2", // Tristeza
          anger: "#FF4444", // Raiva
          fear: "#9C27B0", // Medo
          surprise: "#00BCD4", // Surpresa
          calm: "#66BB6A", // Calma
        },
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "pulse-slow": "pulse 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
