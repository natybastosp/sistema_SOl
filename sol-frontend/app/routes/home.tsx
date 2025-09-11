import React, { useState, useEffect } from "react";
import type { MetaFunction } from "react-router";

// Importando componentes existentes - mantidos para compatibilidade
import LoginPage from "~/components/sol/pages/LoginPage";
import PreferencesPages from "~/components/sol/pages/PreferencePages";
import EmotionalAssessmentPage from "~/components/sol/pages/EmotionalAssessmentPage";
import PlaylistPage from "~/components/sol/pages/PlaylistPage";
import DashboardPage from "~/components/sol/pages/DashboardPage";

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

export const meta: MetaFunction = () => {
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
          : [newPage]; // Substitui histórico para navegação direta

        return {
          currentPath: newPath,
          previousPage: prev.currentPath[prev.currentPath.length - 1],
          canGoBack: newPath.length > 1,
        };
      });

      setCurrentPage(newPage);
    },
    []
  );

  const goBack = React.useCallback(() => {
    setNavigationState((prev) => {
      if (prev.currentPath.length <= 1) return prev;

      const newPath = prev.currentPath.slice(0, -1);
      const targetPage = newPath[newPath.length - 1];

      setCurrentPage(targetPage);

      return {
        currentPath: newPath,
        previousPage: prev.currentPath[prev.currentPath.length - 2],
        canGoBack: newPath.length > 1,
      };
    });
  }, []);

  /**
   * 🎵 GERENCIAMENTO DE PLAYLIST - Melhorado com contexto terapêutico
   */
  const generatePlaylist = React.useCallback(() => {
    const dominantEmotion = Object.entries(userData.emotionalState).reduce(
      (a, b) =>
        userData.emotionalState[a[0]] > userData.emotionalState[b[0]] ? a : b
    )[0];

    // Filtra músicas baseado na emoção dominante e configurações do usuário
    let filteredTracks = SAMPLE_TRACKS.filter(
      (track) => track.emotion === dominantEmotion || track.emotion === "calm"
    );

    // Aplicar filtros das configurações do usuário
    if (!userSettings.music.explicitContent) {
      // Filtrar conteúdo explícito se necessário
      // Por enquanto, todas as nossas sample tracks são limpas
    }

    setCurrentPlaylist(filteredTracks);
    setCurrentTrack(0);

    // Criar nova sessão terapêutica
    const newSession: TherapySession = {
      id: `session_${Date.now()}`,
      userId: userData.id || "anonymous",
      startTime: new Date(),
      objective: {
        primary:
          dominantEmotion === "sadness"
            ? "comfort"
            : dominantEmotion === "anxiety"
              ? "calm"
              : dominantEmotion === "anger"
                ? "release"
                : "balance",
        userDefined: `Melhorar estado de ${dominantEmotion}`,
      },
      initialAssessment: {
        dominant: dominantEmotion,
        intensity: Math.max(...Object.values(userData.emotionalState)),
        stability: 50, // Valor padrão, seria calculado com mais dados
        recommendations: {
          immediate: ["ouvir_playlist", "respiracao_profunda"],
          longTerm: ["pratica_regular", "acompanhamento_progresso"],
          musicTherapy: {
            approach: "iso-mood",
            targetEmotion: "calm",
            sessionLength: 15,
            intensity: "moderate",
          },
        },
      },
      interventions: [],
      outcomes: {
        moodChange: 0,
        goalAchievement: {},
        userSatisfaction: 0,
      },
    };

    setCurrentSession(newSession);
  }, [userData, userSettings]);

  /**
   * 🎮 CONTROLES DE REPRODUÇÃO - Mantidos com melhorias
   */
  const togglePlayPause = React.useCallback(() => {
    setIsPlaying(!isPlaying);

    // Registra intervenção na sessão atual
    if (currentSession) {
      const intervention = {
        type: "music" as const,
        startTime: new Date(),
        duration: 0, // Será calculado quando parar
        description: isPlaying ? "Pausou reprodução" : "Iniciou reprodução",
        userResponse: 3, // Neutro por padrão
      };

      setCurrentSession((prev) =>
        prev
          ? {
              ...prev,
              interventions: [...prev.interventions, intervention],
            }
          : undefined
      );
    }
  }, [isPlaying, currentSession]);

  const nextTrack = React.useCallback(() => {
    if (currentTrack < currentPlaylist.length - 1) {
      setCurrentTrack(currentTrack + 1);
    }
  }, [currentTrack, currentPlaylist.length]);

  /**
   * 📝 SISTEMA DE FEEDBACK - Expandido para aprendizado da IA
   */
  const handleTrackFeedback = React.useCallback(
    (trackId: number, rating: string) => {
      setFeedback((prev) => ({ ...prev, [trackId]: rating }));

      // Registra feedback na sessão atual
      if (currentSession) {
        const track = currentPlaylist.find((t) => t.id === trackId);
        if (track) {
          const intervention = {
            type: "music" as const,
            startTime: new Date(Date.now() - 30000), // Aproximação de quando começou
            duration: 30, // Estimativa
            description: `Avaliou "${track.title}" como ${rating}`,
            userResponse:
              rating === "positive" ? 5 : rating === "negative" ? 1 : 3,
          };

          setCurrentSession((prev) =>
            prev
              ? {
                  ...prev,
                  interventions: [...prev.interventions, intervention],
                }
              : undefined
          );
        }
      }
    },
    [currentPlaylist, currentSession]
  );

  /**
   * 🏁 FINALIZAÇÃO DE SESSÃO - Nova funcionalidade
   */
  const submitFinalFeedback = React.useCallback(
    (finalEmotion: string) => {
      if (!currentSession) return;

      // Calcula mudança no humor
      const initialDominant = currentSession.initialAssessment.dominant;
      const moodChange =
        finalEmotion === "better" ? 20 : finalEmotion === "same" ? 0 : -10;

      // Finaliza sessão
      const completedSession: TherapySession = {
        ...currentSession,
        endTime: new Date(),
        finalAssessment: {
          dominant:
            finalEmotion === "better"
              ? "calm"
              : finalEmotion === "worse"
                ? initialDominant
                : initialDominant,
          intensity: currentSession.initialAssessment.intensity + moodChange,
          stability: 60,
          recommendations: {
            immediate: [],
            longTerm: [],
            musicTherapy: {
              approach: "progressive",
              targetEmotion: "calm",
              sessionLength: 15,
              intensity: "gentle",
            },
          },
        },
        outcomes: {
          moodChange,
          goalAchievement: { primary: moodChange > 0 ? 0.8 : 0.3 },
          userSatisfaction:
            finalEmotion === "better" ? 5 : finalEmotion === "same" ? 3 : 2,
        },
      };

      // Adiciona ao histórico
      const newHistoryEntry: EmotionalHistoryEntry = {
        date: new Date().toLocaleDateString(),
        initialEmotion: userData.emotionalState,
        finalEmotion: finalEmotion,
        tracksPlayed: currentPlaylist.length,
        satisfaction: Object.values(feedback).filter((f) => f === "positive")
          .length,
        sessionId: completedSession.id,
        sessionDuration: Math.floor(
          (completedSession.endTime!.getTime() -
            completedSession.startTime.getTime()) /
            60000
        ),
        therapeuticGoals: [completedSession.objective.primary],
        goalAchievement: completedSession.outcomes.goalAchievement,
        playlist: {
          id: `playlist_${Date.now()}`,
          name: `Sessão ${initialDominant}`,
          tracks: currentPlaylist,
          generationMethod: "complete_assessment",
        },
      };

      setEmotionalHistory((prev) => [...prev, newHistoryEntry]);
      setCurrentSession(undefined);
      navigateToPage(PAGES.DASHBOARD);
    },
    [
      currentSession,
      userData.emotionalState,
      currentPlaylist,
      feedback,
      navigateToPage,
    ]
  );

  /**
   * 🎨 RENDERIZAÇÃO CONDICIONAL - Sistema inteligente de páginas
   */
  const renderCurrentPage = () => {
    // Mostrar loading durante inicialização
    if (isInitializing) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-orange-600 font-medium">
              Preparando sua experiência personalizada...
            </p>
          </div>
        </div>
      );
    }

    // Mostrar erro se houver
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

    // Sistema de roteamento principal
    switch (currentPage) {
      // TODO: Criar novos componentes nas próximas etapas
      case PAGES.ENTRY_CHECK:
        return <div>EntryCheckPage - TODO: Criar na Etapa 2</div>;

      case PAGES.QUICK_IA:
        return <div>QuickIAPage - TODO: Criar na Etapa 2</div>;

      case PAGES.REGISTRATION:
        return <div>RegistrationPage - TODO: Criar na Etapa 3</div>;

      case PAGES.SETTINGS:
        return <div>SettingsPage - TODO: Criar na Etapa 4</div>;

      // Componentes existentes adaptados
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

      case PAGES.DASHBOARD:
        return (
          <DashboardPage
            emotionalHistory={emotionalHistory}
            setCurrentPage={navigateToPage}
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

  return (
    <div className="App">
      {renderCurrentPage()}

      {/* TODO: Adicionar navegação global/breadcrumb em versões futuras */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded text-xs">
          Página: {currentPage} | Auth:{" "}
          {authState.isAuthenticated ? "Sim" : "Não"}
        </div>
      )}
    </div>
  );
}
