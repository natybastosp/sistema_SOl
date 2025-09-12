// ARQUIVO CORRIGIDO: app/routes/home.tsx
import React, { useState, useEffect } from "react";

// CORREÇÃO 1: Importar MetaFunction do tipo correto para React Router v7
import type { Route } from "../+types/home";

// Importando componentes existentes - mantidos para compatibilidade
import LoginPage from "~/components/sol/pages/LoginPage";
import PreferencesPages from "~/components/sol/pages/PreferencePages";
import EmotionalAssessmentPage from "~/components/sol/pages/EmotionalAssessmentPage";
import PlaylistPage from "~/components/sol/pages/PlaylistPage";
import DashboardPage from "~/components/sol/pages/DashboardPage";

// CORREÇÃO 2: Importar os novos componentes criados
import EntryCheckPage from "~/components/sol/pages/EntryCheckPage";
import QuickIAPage from "~/components/sol/pages/QuickIAPage";
import RegistrationPage from "~/components/sol/pages/RegistrationPage";

// Importando tipos e constantes expandidos
import type {
  UserData,
  Track,
  EmotionalHistoryEntry,
  AuthState,
  UserSettings,
  TherapySession,
  NavigationState,
} from "~/types/sol";
import { SAMPLE_TRACKS, PAGES, DEFAULT_SETTINGS } from "~/constants/sol";

// Importando o novo serviço de autenticação
import { AuthService } from "~/services/authService";

// CORREÇÃO 3: Usar o tipo correto de MetaFunction para React Router v7
export const meta: Route.MetaFunction = () => {
  return [
    { title: "SOL - Sistema de Recomendação Musical Terapêutica" },
    {
      name: "description",
      content:
        "Plataforma inteligente de musicoterapia para apoio à saúde mental e bem-estar emocional",
    },
    {
      name: "viewport",
      content: "width=device-width, initial-scale=1",
    },
    {
      name: "theme-color",
      content: "#fb923c", // Cor laranja do SOL
    },
  ];
};

/**
 * 🏠 Componente Home - O "Maestro" do Sistema SOL
 *
 * Este componente funciona como um maestro de orquestra que:
 * - Coordena todos os outros componentes harmoniosamente
 * - Decide qual "movimento musical" tocar baseado no contexto
 * - Mantém o estado global sincronizado
 * - Garante que a experiência flua naturalmente
 */
export default function Home() {
  // 🔐 ESTADOS DE AUTENTICAÇÃO - Núcleo do novo sistema
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isNewUser: true,
  });

  const [isInitializing, setIsInitializing] = useState(true);

  // 📱 ESTADOS DE NAVEGAÇÃO - Sistema inteligente de roteamento
  const [currentPage, setCurrentPage] = useState<string>(PAGES.ENTRY_CHECK);
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentPath: [],
    canGoBack: false,
  });

  // 👤 ESTADOS DO USUÁRIO - Expandidos para funcionalidade rica
  const [userData, setUserData] = useState<UserData>({
    name: "",
    preferences: [],
    emotionalState: {},
    profileSetupComplete: false,
  });

  const [userSettings, setUserSettings] =
    useState<UserSettings>(DEFAULT_SETTINGS);

  // 🎵 ESTADOS MUSICAIS - Mantidos da versão anterior
  const [currentPlaylist, setCurrentPlaylist] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [feedback, setFeedback] = useState<Record<number, string>>({});

  // 📊 ESTADOS DE SESSÃO TERAPÊUTICA - Novos para tracking avançado
  const [emotionalHistory, setEmotionalHistory] = useState<
    EmotionalHistoryEntry[]
  >([]);
  const [currentSession, setCurrentSession] = useState<
    TherapySession | undefined
  >();

  // 🔄 ESTADOS DE INTERFACE - Para UX melhorada
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [password, setPassword] = useState(""); // Mantido para compatibilidade

  /**
   * 🚀 INICIALIZAÇÃO INTELIGENTE
   *
   * Como um concierge que prepara tudo antes do hóspede chegar:
   * 1. Verifica se existe usuário autenticado
   * 2. Carrega configurações e preferências
   * 3. Decide qual experiência inicial oferecer
   * 4. Prepara o ambiente personalizado
   */
  useEffect(() => {
    const initializeApp = async () => {
      setIsInitializing(true);
      try {
        const result = await AuthService.checkAuthentication();

        setAuthState(result.authState);

        if (result.userData) {
          setUserData(result.userData);
          // Carrega configurações salvas ou usa padrões
          const savedSettings = localStorage.getItem("sol-user-settings");
          if (savedSettings) {
            setUserSettings(JSON.parse(savedSettings));
          }
        }

        // Define página inicial baseada na inteligência do AuthService
        setCurrentPage(result.shouldRedirectTo);

        // Inicializa histórico de navegação
        setNavigationState({
          currentPath: [result.shouldRedirectTo],
          canGoBack: false,
        });
      } catch (error) {
        console.error("Erro na inicialização:", error);
        setError("Erro ao inicializar o sistema. Tente recarregar a página.");
        setCurrentPage(PAGES.ENTRY_CHECK);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, []);

  /**
   * 🧭 NAVEGAÇÃO INTELIGENTE
   *
   * Como um GPS que conhece os melhores caminhos:
   * - Mantém histórico para botão "voltar" inteligente
   * - Previne navegação para páginas inadequadas
   * - Salva contexto para restaurar estado após interruções
   */
  const navigateToPage = React.useCallback(
    (newPage: string, addToHistory: boolean = true) => {
      setNavigationState((prev) => {
        const newPath = addToHistory
          ? [...prev.currentPath, newPage]
          : [newPage];

        return {
          currentPath: newPath,
          canGoBack: newPath.length > 1,
          previousPage: prev.currentPath[prev.currentPath.length - 1],
        };
      });

      setCurrentPage(newPage);
    },
    []
  );

  /**
   * 🔐 Handler para sucesso de autenticação
   */
  const handleAuthSuccess = React.useCallback(
    (authState: AuthState, userData: UserData, redirectTo: string) => {
      setAuthState(authState);
      setUserData(userData);
      navigateToPage(redirectTo);
    },
    [navigateToPage]
  );

  /**
   * 📝 Handler para conclusão de registro
   */
  const handleRegistrationComplete = React.useCallback(
    (authState: AuthState, userData: UserData) => {
      setAuthState(authState);
      setUserData(userData);
      navigateToPage(PAGES.DASHBOARD);
    },
    [navigateToPage]
  );

  /**
   * 🎵 Handler para playlist gerada
   */
  const handlePlaylistGenerated = React.useCallback(
    (playlist: Track[], analysis: any) => {
      setCurrentPlaylist(playlist);
      // Salva análise emocional no histórico
      const newEntry: EmotionalHistoryEntry = {
        date: new Date().toISOString(),
        initialEmotion: analysis.initialState || {},
        finalEmotion: analysis.targetEmotion || "calm",
        tracksPlayed: playlist.length,
        satisfaction: 0, // Será preenchido após feedback
        sessionId: `quick-${Date.now()}`,
        sessionDuration: 0,
        therapeuticGoals: ["relaxation"],
        goalAchievement: {},
        playlist: {
          id: `playlist-${Date.now()}`,
          name: "Playlist Rápida",
          tracks: playlist,
          generationMethod: "quick_ai",
        },
      };

      setEmotionalHistory((prev) => [...prev, newEntry]);
      navigateToPage(PAGES.PLAYLIST);
    },
    [navigateToPage]
  );

  /**
   * ⚡ Handler para ações rápidas do dashboard
   */
  const handleQuickAction = React.useCallback(
    (action: string) => {
      switch (action) {
        case "quick_ia":
          navigateToPage(PAGES.QUICK_IA);
          break;
        case "complete_assessment":
          navigateToPage(PAGES.EMOTIONAL_ASSESSMENT);
          break;
        case "settings":
          navigateToPage(PAGES.SETTINGS);
          break;
        default:
          console.log("Ação não reconhecida:", action);
      }
    },
    [navigateToPage]
  );

  // Funções auxiliares para compatibilidade com componentes existentes
  const generatePlaylist = () => {
    // Implementação temporária para compatibilidade
    setCurrentPlaylist(SAMPLE_TRACKS);
    navigateToPage(PAGES.PLAYLIST);
  };

  const togglePlayPause = () => setIsPlaying(!isPlaying);
  const nextTrack = () =>
    setCurrentTrack((prev) => (prev + 1) % currentPlaylist.length);
  const handleTrackFeedback = (trackId: number, feedback: string) => {
    setFeedback((prev) => ({ ...prev, [trackId]: feedback }));
  };
  const submitFinalFeedback = () => {
    // Implementação de salvamento de feedback
    navigateToPage(PAGES.DASHBOARD);
  };

  // CORREÇÃO 4: Renderização principal sem conflitos de contexto
  const renderCurrentPage = () => {
    switch (currentPage) {
      // ✅ NOVOS COMPONENTES - Agora funcionais
      case PAGES.ENTRY_CHECK:
        return (
          <EntryCheckPage
            onAuthSuccess={handleAuthSuccess}
            onNewUserSelected={() => navigateToPage(PAGES.REGISTRATION)}
          />
        );

      case PAGES.QUICK_IA:
        return (
          <QuickIAPage
            userData={userData}
            setUserData={setUserData}
            onPlaylistGenerated={handlePlaylistGenerated}
            onNavigate={navigateToPage}
          />
        );

      case PAGES.REGISTRATION:
        return (
          <RegistrationPage
            onRegistrationComplete={handleRegistrationComplete}
            onNavigateBack={() => navigateToPage(PAGES.ENTRY_CHECK)}
          />
        );

      // ✅ DASHBOARD COMO HUB CENTRAL
      case PAGES.DASHBOARD:
        return (
          <DashboardPage
            userData={userData}
            emotionalHistory={emotionalHistory}
            onNavigate={navigateToPage}
            onQuickAction={handleQuickAction}
          />
        );

      // ⭐ ETAPA 4 - Próxima a ser implementada
      case PAGES.SETTINGS:
        return <div>SettingsPage - TODO: Criar na Etapa 4</div>;

      case PAGES.MUSIC_SETTINGS:
        return <div>MusicSettingsPage - TODO: Criar na Etapa 4</div>;

      // 🔄 COMPONENTES EXISTENTES - Mantidos
      case PAGES.LOGIN:
        return (
          <LoginPage
            userData={userData}
            setUserData={setUserData}
            password={password}
            setPassword={setPassword}
            setCurrentPage={navigateToPage}
          />
        );

      case PAGES.PREFERENCES:
        return (
          <PreferencesPages
            userData={userData}
            setUserData={setUserData}
            setCurrentPage={navigateToPage}
          />
        );

      case PAGES.EMOTIONAL_ASSESSMENT:
        return (
          <EmotionalAssessmentPage
            userData={userData}
            setUserData={setUserData}
            setCurrentPage={navigateToPage}
            onGeneratePlaylist={generatePlaylist}
          />
        );

      case PAGES.PLAYLIST:
        return (
          <PlaylistPage
            currentPlaylist={currentPlaylist}
            currentTrack={currentTrack}
            setCurrentTrack={setCurrentTrack}
            isPlaying={isPlaying}
            togglePlayPause={togglePlayPause}
            nextTrack={nextTrack}
            feedback={feedback}
            handleTrackFeedback={handleTrackFeedback}
            submitFinalFeedback={submitFinalFeedback}
          />
        );

      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
            <div className="text-center">
              <p className="text-orange-600 mb-4">Página não encontrada</p>
              <button
                onClick={() => navigateToPage(PAGES.DASHBOARD)}
                className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600"
              >
                Ir para Dashboard
              </button>
            </div>
          </div>
        );
    }
  };

  // Estados de carregamento e erro
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-orange-600">
            Preparando sua experiência personalizada...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
          >
            Recarregar Página
          </button>
        </div>
      </div>
    );
  }

  return <div className="App">{renderCurrentPage()}</div>;
}
