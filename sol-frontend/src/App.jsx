// src/App.jsx

import React, { useState, useEffect } from "react";
import LoginPage from "./pages/LoginPage";
import PreferencesPage from "./pages/PreferencesPage";
import EmotionalAssessmentPage from "./pages/EmotionalAssessmentPage";
import PlaylistPage from "./pages/PlaylistPage";
import DashboardPage from "./pages/DashboardPage";
import useAuth from "./hooks/useAuth";

/**
 * Componente App Principal Refatorado
 *
 * Este é o "maestro" da aplicação. Ele orquestra qual página mostrar
 * e gerencia o fluxo geral da aplicação, mas não se preocupa com
 * detalhes específicos de cada página.
 *
 * Pense neste componente como o diretor de uma peça de teatro:
 * - Ele sabe qual ato está sendo representado
 * - Coordena as transições entre cenas
 * - Mas não atua nem dirige os atores individuais
 *
 * Benefícios desta abordagem:
 * - Código principal limpo e focado
 * - Fácil adição de novas páginas
 * - Fluxo de navegação centralizado
 * - Manutenção simplificada
 */
const App = () => {
  // Estado para controlar qual página mostrar
  // Em uma versão mais avançada, isso seria substituído por React Router
  const [currentPage, setCurrentPage] = useState("login");

  // Dados do usuário que passam entre páginas
  const [userPreferences, setUserPreferences] = useState([]);
  const [emotionalData, setEmotionalData] = useState(null);
  const [currentPlaylist, setCurrentPlaylist] = useState([]);

  // Hook de autenticação - nosso "porteiro digital"
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();

  // Efeito para redirecionar automaticamente usuários já logados
  // É como um GPS que sempre sabe onde você deveria estar
  useEffect(() => {
    if (isAuthenticated && currentPage === "login") {
      // Se o usuário já está logado, leva direto para as preferências
      // ou para o dashboard se já tem dados salvos
      const hasPreferences = userPreferences.length > 0;
      setCurrentPage(hasPreferences ? "dashboard" : "preferences");
    } else if (!isAuthenticated && currentPage !== "login") {
      // Se não está logado, volta para o login
      setCurrentPage("login");
    }
  }, [isAuthenticated, currentPage, userPreferences.length]);

  /**
   * Funções de navegação
   * Estas funções controlam o fluxo entre páginas de forma centralizada
   */

  // Sucesso no login - avança para preferências
  const handleLoginSuccess = () => {
    console.log("Login bem-sucedido, navegando para preferências");
    setCurrentPage("preferences");
  };

  // Preferências salvas - avança para avaliação emocional
  const handlePreferencesComplete = (preferences) => {
    console.log("Preferências selecionadas:", preferences);
    setUserPreferences(preferences);
    setCurrentPage("emotional-assessment");
  };

  // Avaliação emocional completa - avança para playlist
  const handleEmotionalAssessmentComplete = (emotionalState) => {
    console.log("Avaliação emocional completa:", emotionalState);
    setEmotionalData(emotionalState);
    setCurrentPage("playlist");
  };

  // Playlist finalizada - avança para dashboard
  const handlePlaylistComplete = (playlistData) => {
    console.log("Sessão de playlist finalizada:", playlistData);
    setCurrentPlaylist(playlistData);
    setCurrentPage("dashboard");
  };

  // Nova sessão - volta para avaliação emocional
  const handleNewSession = () => {
    console.log("Iniciando nova sessão");
    setEmotionalData(null);
    setCurrentPlaylist([]);
    setCurrentPage("emotional-assessment");
  };

  // Editar preferências - volta para página de preferências
  const handleEditPreferences = () => {
    console.log("Editando preferências");
    setCurrentPage("preferences");
  };

  // Logout - volta para login
  const handleLogout = () => {
    console.log("Fazendo logout");
    setCurrentPage("login");
    setUserPreferences([]);
    setEmotionalData(null);
    setCurrentPlaylist([]);
  };

  /**
   * Função para renderizar a página atual
   * Aqui decidimos qual "ato da peça" mostrar
   */
  const renderCurrentPage = () => {
    // Mostra loading enquanto verifica autenticação
    if (authLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      );
    }

    // Renderiza a página apropriada baseada no estado atual
    switch (currentPage) {
      case "login":
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;

      case "preferences":
        return (
          <PreferencesPage
            currentPreferences={userPreferences}
            onComplete={handlePreferencesComplete}
            onLogout={handleLogout}
            user={user}
          />
        );

      case "emotional-assessment":
        return (
          <EmotionalAssessmentPage
            userPreferences={userPreferences}
            onComplete={handleEmotionalAssessmentComplete}
            onBack={handleEditPreferences}
            user={user}
          />
        );

      case "playlist":
        return (
          <PlaylistPage
            emotionalData={emotionalData}
            userPreferences={userPreferences}
            onComplete={handlePlaylistComplete}
            onNewAssessment={handleNewSession}
            user={user}
          />
        );

      case "dashboard":
        return (
          <DashboardPage
            user={user}
            lastPlaylist={currentPlaylist}
            onNewSession={handleNewSession}
            onEditPreferences={handleEditPreferences}
            onLogout={handleLogout}
          />
        );

      default:
        // Fallback caso algo dê errado
        console.warn(`Página desconhecida: ${currentPage}`);
        return (
          <div className="min-h-screen flex items-center justify-center bg-red-50">
            <div className="text-center">
              <h2 className="text-xl font-bold text-red-600 mb-2">
                Erro de Navegação
              </h2>
              <p className="text-red-500 mb-4">
                Página não encontrada: {currentPage}
              </p>
              <button
                onClick={() => setCurrentPage("login")}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Voltar ao Login
              </button>
            </div>
          </div>
        );
    }
  };

  // Debug info (apenas em desenvolvimento)
  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <div className="App">
      {/* Informações de debug - só aparecem durante desenvolvimento */}
      {isDevelopment && (
        <div className="fixed top-0 right-0 bg-black text-white text-xs p-2 z-50 opacity-75">
          <div>Página: {currentPage}</div>
          <div>Autenticado: {isAuthenticated ? "Sim" : "Não"}</div>
          <div>Usuário: {user?.name || "N/A"}</div>
          <div>Preferências: {userPreferences.length}</div>
        </div>
      )}

      {/* Renderiza a página atual */}
      {renderCurrentPage()}
    </div>
  );
};

export default App;
