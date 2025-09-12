import type { Emotion, Track } from "~/types/sol";

// Gêneros musicais existentes
export const GENRES = [
  "Rock",
  "Pop",
  "MPB",
  "Sertanejo",
  "Funk",
  "Jazz",
  "Clássica",
  "Eletrônica",
  "Reggae",
  "Hip Hop",
];

// Emoções existentes
export const EMOTIONS: Emotion[] = [
  { name: "Tristeza", key: "sadness", color: "bg-blue-500" },
  { name: "Ansiedade", key: "anxiety", color: "bg-orange-500" },
  { name: "Alegria", key: "joy", color: "bg-yellow-500" },
  { name: "Raiva", key: "anger", color: "bg-red-500" },
  { name: "Calma", key: "calm", color: "bg-green-500" },
];

// Tracks de exemplo
export const SAMPLE_TRACKS: Track[] = [
  {
    id: 1,
    title: "Música Relaxante 1",
    artist: "Artista Calmo",
    duration: "3:45",
    emotion: "calm",
  },
  {
    id: 2,
    title: "Energia Positiva",
    artist: "Artista Alegre",
    duration: "4:20",
    emotion: "joy",
  },
  {
    id: 3,
    title: "Reflexão Suave",
    artist: "Artista Contemplativo",
    duration: "5:10",
    emotion: "calm",
  },
  {
    id: 4,
    title: "Superação",
    artist: "Artista Motivacional",
    duration: "3:55",
    emotion: "joy",
  },
];

export const PAGES = {
  // 🚪 SISTEMA DE ENTRADA - Nova arquitetura
  ENTRY_CHECK: "entry-check", // Página inicial inteligente que decide o fluxo
  QUICK_IA: "quick-ia", // IA expressa para usuários existentes

  // 👤 SISTEMA DE CADASTRO - Reformulado
  REGISTRATION: "registration", // Formulário completo de novo usuário

  // 🏠 CENTRO DE COMANDO - Transformado em hub
  DASHBOARD: "dashboard", // Hub central de onde tudo acontece

  // ⚙️ SISTEMA DE CONFIGURAÇÕES - Novo
  SETTINGS: "settings", // Configurações gerais do usuário
  MUSIC_SETTINGS: "music-settings", // Configurações específicas de música

  // 🤖 SISTEMA DE IA - Mantido mas repurposado
  EMOTIONAL_ASSESSMENT: "emotional-assessment", // Agora é IA completa (não mais obrigatória)
  PLAYLIST: "playlist", // Página de reprodução musical

  // 🔄 PÁGINAS LEGADAS - Mantidas para compatibilidade
  LOGIN: "login", // Ainda usado dentro do ENTRY_CHECK
  PREFERENCES: "preferences", // Agora parte do REGISTRATION e MUSIC_SETTINGS
} as const;

// 🎯 TIPOS DE EXPERIÊNCIA DO USUÁRIO - Novo sistema de classificação
export const USER_EXPERIENCE_PATHS = {
  RETURNING_USER: "returning", // Usuário que já tem conta
  NEW_USER: "new", // Usuário criando conta pela primeira vez
  GUEST: "guest", // Usuário explorando sem conta (futuro)
} as const;

// ⚡ VELOCIDADE DE IA - Define tipos de interação com IA
export const IA_INTERACTION_TYPES = {
  QUICK: "quick", // Pergunta rápida, resposta imediata
  COMPLETE: "complete", // Questionário completo, análise profunda
  ADAPTIVE: "adaptive", // Se adapta baseado no histórico do usuário
} as const;

// 🎵 TIPOS DE PLAYLIST - Categorização expandida
export const PLAYLIST_TYPES = {
  THERAPEUTIC: "therapeutic", // Playlist gerada para bem-estar emocional
  DISCOVERY: "discovery", // Playlist para descobrir novos gostos
  ENERGY: "energy", // Playlist para aumentar energia
  RELAXATION: "relaxation", // Playlist para relaxamento
  FOCUS: "focus", // Playlist para concentração
} as const;

// 📊 CONFIGURAÇÕES PADRÃO - Configurações iniciais para novos usuários
export const DEFAULT_SETTINGS = {
  notifications: {
    enabled: true,
    frequency: "weekly" as const,
    types: ["playlist_ready", "mood_check", "progress_update"],
  },
  privacy: {
    shareData: false,
    publicProfile: false,
    anonymousAnalytics: true,
  },
  therapy: {
    sessionGoal: "relaxation" as const,
    preferredSessionLength: 15, // minutos
    reminderFrequency: "daily" as const,
  },
  music: {
    explicitContent: false,
    discoveryMode: true,
    preferredAudioQuality: "high" as const,
  },
} as const;

// 🎨 TEMAS VISUAIS - Para personalização futura
export const VISUAL_THEMES = {
  LIGHT: "light",
  DARK: "dark",
  WARM: "warm", // Tons quentes para relaxamento
  ENERGETIC: "energetic", // Cores vibrantes para energia
  MINIMAL: "minimal", // Design limpo e minimalista
} as const;
