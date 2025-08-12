// src/components/common/Button.jsx

import React from "react";

/**
 * @param {Object} props - Propriedades do componente
 * @param {'primary'|'secondary'|'outline'|'ghost'|'danger'} props.variant - Variação do botão
 * @param {'sm'|'md'|'lg'} props.size - Tamanho do botão
 * @param {boolean} props.disabled - Se o botão está desabilitado
 * @param {boolean} props.loading - Se está carregando (mostra spinner)
 * @param {React.ReactNode} props.children - Conteúdo do botão
 * @param {string} props.className - Classes CSS adicionais
 * @param {function} props.onClick - Função chamada no clique
 */
const Button = ({
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  children,
  className = "",
  onClick = () => {},
  ...props // Outras props que podem ser passadas para o elemento button
}) => {
  // Definimos as variações visuais do botão
  // Isso centraliza toda a lógica de aparência em um lugar
  const variants = {
    primary:
      "bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-lg hover:from-orange-500 hover:to-orange-600 hover:shadow-xl",
    secondary: "bg-gray-600 text-white hover:bg-gray-700",
    outline:
      "border-2 border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300",
    ghost: "text-gray-600 hover:text-gray-800 hover:bg-gray-100",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };

  // Definimos os tamanhos possíveis
  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  // Classes base que todos os botões compartilham
  const baseClasses = `
    inline-flex items-center justify-center
    font-semibold rounded-xl
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    transform hover:scale-105 disabled:hover:scale-100
  `;

  // Combinamos todas as classes
  const buttonClasses = `
    ${baseClasses}
    ${variants[variant] || variants.primary}
    ${sizes[size] || sizes.md}
    ${className}
  `;

  // Componente simples de loading spinner
  const LoadingSpinner = () => (
    <svg
      className="animate-spin -ml-1 mr-3 h-5 w-5 text-current"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  return (
    <button
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {children}
    </button>
  );
};

export default Button;
