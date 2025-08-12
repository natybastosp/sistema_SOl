// src/components/common/SunLogo.jsx

import React from "react";
import { Sun } from "lucide-react";

/**
 * @param {Object} props - Propriedades do componente
 * @param {'small'|'medium'|'large'} props.size - Tamanho do logo
 * @param {string} props.className - Classes CSS adicionais (opcional)
 */
const SunLogo = ({ size = "medium", className = "" }) => {
  const sizes = {
    small: {
      container: "w-12 h-12",
      icon: "w-6 h-6",
    },
    medium: {
      container: "w-16 h-16",
      icon: "w-8 h-8",
    },
    large: {
      container: "w-20 h-20",
      icon: "w-10 h-10",
    },
  };

  // Sempre validamos as props para evitar erros
  const currentSize = sizes[size] || sizes.medium;

  return (
    <div
      className={`
        ${currentSize.container} 
        bg-gradient-to-br from-orange-300 to-orange-400 
        rounded-full 
        mx-auto 
        flex items-center justify-center 
        shadow-lg
        ${className}
      `}
      aria-label="Logo SOL - Sistema de Recomendação Musical"
    >
      <Sun className={`${currentSize.icon} text-white`} />
    </div>
  );
};

export default SunLogo;
