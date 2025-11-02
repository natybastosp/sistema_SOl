/**
 * 🎨 Paleta de Cores do Sistema SOL
 *
 * Baseada em: https://coolors.co/
 * Inspiração: Bem-estar, energia, tranquilidade
 */

export const SOL_COLORS = {
  // Paleta Principal (Laranja/Marrom)
  light: "#FAFDF6", // #FAFDF6 - Fundo muito claro
  pale: "#FDD26B", // #FDD26B - Tom pálido
  primary: "#FFA500", // #FFA500 - Laranja vibrante (PRINCIPAL)
  dark: "#B76004", // #B76004 - Laranja escuro
  darker: "#6F1A07", // #6F1A07 - Marrom escuro

  // Paleta Complementar (Preto/Cinza)
  black: "#000000",
  darkGray: "#1F1F1F",
  mediumGray: "#4A4A4A",
  lightGray: "#A0A0A0",
  veryLightGray: "#E8E8E8",
  white: "#FFFFFF",

  // Paleta de Emoções (Secundária)
  joy: "#FFD700", // Alegria - Amarelo
  sadness: "#4A90E2", // Tristeza - Azul
  anger: "#FF4444", // Raiva - Vermelho
  fear: "#9C27B0", // Medo - Roxo
  surprise: "#00BCD4", // Surpresa - Ciano
  calm: "#66BB6A", // Calma - Verde

  // Paleta Semantic
  success: "#66BB6A",
  warning: "#FFA500",
  error: "#FF4444",
  info: "#4A90E2",
};

// Exportar como objeto para Tailwind
export const tailwindColorPalette = {
  "sol-light": SOL_COLORS.light,
  "sol-pale": SOL_COLORS.pale,
  "sol-primary": SOL_COLORS.primary,
  "sol-dark": SOL_COLORS.dark,
  "sol-darker": SOL_COLORS.darker,
  "sol-joy": SOL_COLORS.joy,
  "sol-sadness": SOL_COLORS.sadness,
  "sol-anger": SOL_COLORS.anger,
  "sol-fear": SOL_COLORS.fear,
  "sol-surprise": SOL_COLORS.surprise,
  "sol-calm": SOL_COLORS.calm,
};
