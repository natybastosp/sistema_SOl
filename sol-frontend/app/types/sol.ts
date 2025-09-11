// 🔐 TIPOS DE AUTENTICAÇÃO - Base do novo sistema
export interface AuthState {
  isAuthenticated: boolean; // Se o usuário está logado
  isNewUser: boolean; // Se é a primeira vez que usa o sistema
  userId?: string; // ID único do usuário no backend
  token?: string; // JWT token para comunicação segura
  lastLoginDate?: string; // Para personalizar saudações
  loginMethod?: "email"; // Como o usuário preferiu entrar
}

// 👤 DADOS DO USUÁRIO
export interface UserData {
  // Campos básicos existentes - mantidos para compatibilidade
  name: string;
  preferences: string[]; // Gêneros musicais preferidos
  emotionalState: Record<string, number>; // Estado emocional atual

  // Novos campos para funcionalidade expandida
  id?: string; // ID único do usuário
  email?: string; // Email para login e comunicação
  age?: number; // Idade para personalização de recomendações
  profileSetupComplete?: boolean; // Se completou o setup inicial

  // Perfil emocional detalhado - para IA mais inteligente
  emotionalProfile?: {
    dominantEmotion: string; // Emoção mais comum do usuário
    responsePatterns: Record<string, number>; // Como responde a diferentes tipos de música
    preferredTherapyTypes: string[]; // Tipos de terapia musical que funcionam melhor
    progressMetrics: {
      sessionsCompleted: number;
      averageMoodImprovement: number;
      streakDays: number; // Dias consecutivos de uso
    };
  };

  // Configurações de descoberta musical
  discoverySettings?: {
    allowExplicitContent: boolean;
    preferredDecades: string[]; // Décadas musicais preferidas
    artistBlacklist: string[]; // Artistas que não quer ouvir
    genreWeights: Record<string, number>; // Peso de cada gênero nas recomendações
  };
}

// ⚙️ CONFIGURAÇÕES DO USUÁRIO - Sistema robusto de personalização
export interface UserSettings {
  notifications: {
    enabled: boolean;
    frequency: "daily" | "weekly" | "monthly" | "never";
    types: Array<
      "playlist_ready" | "mood_check" | "progress_update" | "new_features"
    >;
    quietHours: {
      start: string; // Formato HH:MM
      end: string; // Formato HH:MM
      enabled: boolean;
    };
  };

  privacy: {
    shareData: boolean; // Permitir compartilhamento para pesquisa
    publicProfile: boolean; // Perfil visível para outros usuários
    anonymousAnalytics: boolean; // Dados anônimos para melhorar sistema
    dataRetention: "minimal" | "standard" | "extended"; // Quanto tempo manter dados
  };

  therapy: {
    sessionGoal:
      | "relaxation"
      | "energy"
      | "focus"
      | "sleep"
      | "motivation"
      | "healing";
    preferredSessionLength: number; // Em minutos
    reminderFrequency: "never" | "daily" | "weekly" | "when_stressed";
    adaptiveDifficulty: boolean; // Se deve ajustar complexidade baseado no progresso
    emergencyProtocol: {
      enabled: boolean;
      triggerKeywords: string[]; // Palavras que ativam protocolo de crise
      contactInfo?: string; // Contato de emergência ou terapeuta
    };
  };

  music: {
    explicitContent: boolean;
    discoveryMode: boolean; // Se quer descobrir música nova ou só conhecidas
    preferredAudioQuality: "low" | "medium" | "high" | "lossless";
    crossfadeEnabled: boolean; // Transição suave entre músicas
    volumeNormalization: boolean; // Equalizar volume entre faixas
  };

  interface: {
    theme: "light" | "dark" | "warm" | "energetic" | "minimal";
    language: "pt-BR" | "en-US" | "es-ES"; // Suporte internacional futuro
    reducedMotion: boolean; // Para acessibilidade
    fontSize: "small" | "medium" | "large";
    colorBlindFriendly: boolean; // Ajustes para daltonismo
  };
}

// 🎵 TIPOS MUSICAIS - Existentes mantidos
export interface Track {
  id: number;
  title: string;
  artist: string;
  duration: string;
  emotion: string;
  // Novos campos para funcionalidade expandida
  spotifyId?: string; // ID do Spotify para reprodução real
  audioFeatures?: {
    danceability: number;
    energy: number;
    valence: number; // Positividade musical
    arousal: number; // Intensidade emocional
  };
  therapeuticTags?: string[]; // Tags como 'anxiolytic', 'energizing'
  userRating?: number; // Rating específico do usuário (1-5)
  therapeuticScore?: number; // Quão eficaz foi para o usuário
}

// 📊 HISTÓRICO EMOCIONAL - Expandido para análise mais rica
export interface EmotionalHistoryEntry {
  // Campos existentes mantidos
  date: string;
  initialEmotion: Record<string, number>;
  finalEmotion: string;
  tracksPlayed: number;
  satisfaction: number;

  // Novos campos para análise mais profunda
  sessionId: string; // ID único da sessão
  sessionDuration: number; // Duração em minutos
  environmentalFactors?: {
    timeOfDay: "morning" | "afternoon" | "evening" | "night";
    dayOfWeek: string;
    weatherMood?: "sunny" | "rainy" | "cloudy" | "stormy";
    location?: "home" | "work" | "commute" | "gym" | "other";
  };

  physiologicalData?: {
    heartRateVariability?: number; // Se integrado com wearables
    stressLevel?: number; // 1-10 escala
    sleepQuality?: number; // Qualidade do sono da noite anterior
  };

  therapeuticGoals: string[]; // Objetivos definidos para a sessão
  goalAchievement: Record<string, number>; // Quão bem atingiu cada objetivo

  playlist: {
    id: string;
    name: string;
    tracks: Track[];
    generationMethod:
      | "quick_ai"
      | "complete_assessment"
      | "manual"
      | "adaptive";
  };
}

// 😊 TIPOS DE EMOÇÃO - Mantidos existentes
export interface Emotion {
  name: string;
  key: string;
  color: string;
}

// 🧠 TIPOS DE ANÁLISE EMOCIONAL - Novos para IA mais sofisticada
export interface EmotionalAnalysis {
  dominant: string; // Emoção dominante
  secondary?: string; // Emoção secundária
  intensity: number; // Intensidade da emoção (0-100)
  stability: number; // Quão estável é o estado emocional

  recommendations: {
    immediate: string[]; // Ações imediatas recomendadas
    longTerm: string[]; // Estratégias de longo prazo
    musicTherapy: {
      approach: "iso-mood" | "contrasting" | "progressive" | "adaptive";
      targetEmotion: string;
      sessionLength: number;
      intensity: "gentle" | "moderate" | "intensive";
    };
  };

  riskFactors?: {
    severity: "low" | "medium" | "high" | "critical";
    indicators: string[];
    suggestedActions: string[];
  };
}

// 🎯 TIPOS DE SESSÃO TERAPÊUTICA - Novo sistema estruturado
export interface TherapySession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;

  objective: {
    primary: string; // Objetivo principal
    secondary?: string[]; // Objetivos secundários
    userDefined: string; // Objetivo definido pelo próprio usuário
  };

  initialAssessment: EmotionalAnalysis;
  finalAssessment?: EmotionalAnalysis;

  interventions: Array<{
    type: "music" | "breathing" | "meditation" | "movement";
    startTime: Date;
    duration: number;
    description: string;
    userResponse: number; // Como o usuário respondeu (1-5)
  }>;

  outcomes: {
    moodChange: number; // Mudança no humor (-100 to +100)
    goalAchievement: Record<string, number>; // Sucesso em cada objetivo
    userSatisfaction: number; // Satisfação geral (1-5)
    notes?: string; // Notas do usuário sobre a sessão
  };
}

// 🎮 CONTEXTO PRINCIPAL - Expandido para novo fluxo
export interface SolContextType {
  // Estados existentes mantidos
  currentPage: string;
  setCurrentPage: (page: string) => void;
  userData: UserData;
  setUserData: (userData: UserData | ((prev: UserData) => UserData)) => void;
  currentPlaylist: Track[];
  setCurrentPlaylist: (playlist: Track[]) => void;
  currentTrack: number;
  setCurrentTrack: (track: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  feedback: Record<number, string>;
  setFeedback: (
    feedback:
      | Record<number, string>
      | ((prev: Record<number, string>) => Record<number, string>)
  ) => void;
  emotionalHistory: EmotionalHistoryEntry[];
  setEmotionalHistory: (
    history:
      | EmotionalHistoryEntry[]
      | ((prev: EmotionalHistoryEntry[]) => EmotionalHistoryEntry[])
  ) => void;
  password: string;
  setPassword: (password: string) => void;

  // Novos estados para funcionalidade expandida
  authState: AuthState;
  setAuthState: (
    authState: AuthState | ((prev: AuthState) => AuthState)
  ) => void;

  userSettings: UserSettings;
  setUserSettings: (
    settings: UserSettings | ((prev: UserSettings) => UserSettings)
  ) => void;

  currentSession?: TherapySession;
  setCurrentSession: (session: TherapySession | undefined) => void;

  isLoading: boolean; // Para indicadores de carregamento
  setIsLoading: (loading: boolean) => void;

  error?: string; // Para exibição de erros
  setError: (error: string | undefined) => void;
}

// 🔄 TIPOS DE RESPOSTA DA API - Para integração com backend
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

// 📱 TIPOS DE NAVEGAÇÃO - Para roteamento inteligente
export interface NavigationState {
  currentPath: string[]; // Caminho de navegação como breadcrumb
  previousPage?: string; // Para botão voltar inteligente
  canGoBack: boolean;
  pendingNavigation?: string; // Navegação pendente após loading
}

// 🎨 TIPOS DE TEMA - Para personalização visual
export interface ThemeConfig {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
  emotions: Record<string, string>; // Cores específicas para cada emoção
  accessibility: {
    highContrast: boolean;
    colorBlindFriendly: boolean;
    reducedMotion: boolean;
  };
}
