// src/components/common/Header.jsx

import React from "react";
import { ArrowLeft, User, Settings } from "lucide-react";
import SunLogo from "./SunLogo";

/**
 * @param {Object} props - Propriedades do componente
 * @param {string} props.pageTitle - Título da página atual
 * @param {boolean} props.showBackButton - Se deve mostrar botão voltar
 * @param {function} props.onBackClick - Função chamada ao clicar em voltar
 * @param {boolean} props.showUserActions - Se deve mostrar ações do usuário
 * @param {Object} props.user - Dados do usuário logado (opcional)
 */
const Header = ({
  pageTitle = "",
  showBackButton = false,
  onBackClick = () => {},
  showUserActions = false,
  user = null,
}) => {
  // Função para determinar o que mostrar no lado esquerdo do header
  const renderLeftSection = () => {
    if (showBackButton) {
      return (
        <button
          onClick={onBackClick}
          className="
            flex items-center gap-2 
            px-3 py-2 
            rounded-lg 
            text-gray-600 
            hover:text-gray-800 
            hover:bg-gray-100 
            transition-all duration-200
          "
          aria-label="Voltar para página anterior"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Voltar</span>
        </button>
      );
    }

    return <SunLogo size="small" />;
  };

  // Função para renderizar as ações do usuário no lado direito
  const renderUserActions = () => {
    if (!showUserActions || !user) return null;

    return (
      <div className="flex items-center gap-3">
        <span className="hidden md:inline text-sm text-gray-600">
          Olá, {user.name || "Usuário"}
        </span>
        <button
          className="
            p-2 
            rounded-lg 
            text-gray-600 
            hover:text-gray-800 
            hover:bg-gray-100 
            transition-all duration-200
          "
          aria-label="Configurações do usuário"
        >
          <Settings className="w-5 h-5" />
        </button>
        <button
          className="
            p-2 
            rounded-lg 
            text-gray-600 
            hover:text-gray-800 
            hover:bg-gray-100 
            transition-all duration-200
          "
          aria-label="Perfil do usuário"
        >
          <User className="w-5 h-5" />
        </button>
      </div>
    );
  };

  return (
    <header
      className="
      w-full 
      bg-white 
      border-b border-gray-200 
      px-6 py-4
      shadow-sm
    "
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Seção esquerda - Logo ou Botão Voltar */}
        <div className="flex items-center">{renderLeftSection()}</div>

        {/* Seção central - Título da Página */}
        {pageTitle && (
          <div className="flex-1 text-center">
            <h1 className="text-xl font-semibold text-gray-800">{pageTitle}</h1>
          </div>
        )}

        {/* Seção direita - Ações do Usuário */}
        <div className="flex items-center">{renderUserActions()}</div>
      </div>
    </header>
  );
};

export default Header;
