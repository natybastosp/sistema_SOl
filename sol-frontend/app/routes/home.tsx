import { useState, useEffect } from "react";
import type { MetaFunction } from "react-router";

// Componentes conectados
import LoginPage from "~/components/sol/pages/LoginPage";
import PreferencesPages from "~/components/sol/pages/PreferencePages";
import EmotionalAssessmentPage from "~/components/sol/pages/EmotionalAssessmentPage";
import PlaylistPage from "~/components/sol/pages/PlaylistPage";
import DashboardPage from "~/components/sol/pages/DashboardPage";

// Tipos e constantes
import type { UserData } from "~/types/sol";
import { PAGES } from "~/constants/sol";

// Serviços
import { AuthService } from "~/services/authService";

export const meta: MetaFunction = () => {
  return [
    { title: "SOL - Sistema de Recomendação Musical Terapêutica" },
    {
      name: "description",
      content:
        "Plataforma inteligente de musicoterapia para apoio à saúde mental e bem-estar emocional",
    },
  ];
};

export default function Home() {
  // Estados de navegação
  const [currentPage, setCurrentPage] = useState<string>(PAGES.LOGIN);
  const [isInitializing, setIsInitializing] = useState(true);

  // Estados do usuário
  const [userData, setUserData] = useState<UserData>({
    id: "",
    name: "",
    email: "",
    preferences: [],
    emotionalState: {},
  });

  // Estado da playlist atual
  const [currentPlaylistData, setCurrentPlaylistData] = useState<any>(null);

  /**
   * ✅ Verificar autenticação ao carregar
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await AuthService.checkAuthentication();

        if (result.authState.isAuthenticated && result.userData) {
          console.log("✅ Usuário autenticado:", result.userData);
          setUserData(result.userData);
          setCurrentPage(result.shouldRedirectTo);
        } else {
          console.log("❌ Usuário não autenticado");
          setCurrentPage(PAGES.LOGIN);
        }
      } catch (error) {
        console.error("❌ Erro ao verificar autenticação:", error);
        setCurrentPage(PAGES.LOGIN);
      } finally {
        setIsInitializing(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * 🎵 Callback quando playlist é gerada
   */
  const handlePlaylistGenerated = (playlistData: any) => {
    console.log("🎵 Playlist recebida no Home:", playlistData);
    setCurrentPlaylistData(playlistData);
  };

  /**
   * 🎨 Renderizar página atual
   */
  const renderCurrentPage = () => {
    // Loading inicial
    if (isInitializing) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-orange-600 font-medium">Carregando SOL...</p>
          </div>
        </div>
      );
    }

    // Renderizar componente baseado na página atual
    switch (currentPage) {
      case PAGES.LOGIN:
        return (
          <LoginPage
            setCurrentPage={setCurrentPage}
            setUserData={setUserData}
          />
        );

      case PAGES.PREFERENCES:
        return (
          <PreferencesPages
            userData={userData}
            setUserData={setUserData}
            setCurrentPage={setCurrentPage}
          />
        );

      case PAGES.EMOTIONAL_ASSESSMENT:
        return (
          <EmotionalAssessmentPage
            userData={userData}
            setUserData={setUserData}
            setCurrentPage={setCurrentPage}
            onPlaylistGenerated={handlePlaylistGenerated}
          />
        );

      case PAGES.PLAYLIST:
        return (
          <PlaylistPage
            playlistData={currentPlaylistData}
            setCurrentPage={setCurrentPage}
          />
        );

      case PAGES.DASHBOARD:
        return (
          <DashboardPage userData={userData} setCurrentPage={setCurrentPage} />
        );

      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
            <div className="text-center">
              <p className="text-orange-600 mb-4">Página não encontrada</p>
              <button
                onClick={() => setCurrentPage(PAGES.DASHBOARD)}
                className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600"
              >
                Ir para Dashboard
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="App">
      {renderCurrentPage()}

      {/* Debug Info (somente em desenvolvimento) */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-3 rounded-lg text-xs shadow-lg">
          <p className="font-bold mb-1">🔍 Debug Info</p>
          <p>Página: {currentPage}</p>
          <p>Usuário: {userData.name || "Não autenticado"}</p>
          <p>
            Playlist:{" "}
            {currentPlaylistData ? "✅ Carregada" : "❌ Não carregada"}
          </p>
        </div>
      )}
    </div>
  );
}
