// ====================================
// TIPOS PARA ANÁLISE EMOCIONAL
// ====================================

export interface EmotionalState {
  anger: number; // Raiva (0-10)
  fear: number; // Medo (0-10)
  joy: number; // Alegria (0-10)
  sadness: number; // Tristeza (0-10)
  surprise: number; // Surpresa (0-10)
}

export interface EmotionalAnalysisResult {
  primary: string; // Emoção dominante
  secondary?: string; // Emoção secundária
  intensity: number; // Intensidade geral (0-1)
  confidence: number; // Confiança da análise (0-1)
}

// ====================================
// TIPOS PARA RECOMENDAÇÃO MUSICAL
// ====================================

export interface MusicRecommendationRequest {
  userId: string;
  currentEmotion: EmotionalState;
  preferredGenres: string[];
  playlistSize?: number;
  algorithm?: "fuzzy" | "collaborative" | "hybrid";
}

export interface MusicRecommendationResult {
  playlistId: string;
  musics: RecommendedMusic[];
  confidence: number;
  algorithm: string;
  reasoning: string;
}

export interface RecommendedMusic {
  musicId: string;
  name: string;
  artist: string;
  emotionalScore: number;
  matchReason: string;
}

// ====================================
// TIPOS PARA LÓGICA FUZZY
// ====================================

export interface FuzzySet {
  name: string;
  membershipFunction: (value: number) => number;
}

export interface FuzzyRule {
  id: string;
  conditions: FuzzyCondition[];
  conclusion: FuzzyConclusion;
  weight: number;
}

export interface FuzzyCondition {
  variable: string;
  fuzzySet: string;
  value: number;
}

export interface FuzzyConclusion {
  variable: string;
  fuzzySet: string;
}

// ====================================
// TIPOS PARA API
// ====================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
