// Tipos TypeScript para o Sistema SOL
// Este arquivo define as interfaces que nossos módulos usam para se comunicar

export interface EmotionalState {
  anger: number;     // Raiva (0-1)
  fear: number;      // Medo (0-1)
  joy: number;       // Alegria (0-1)
  sadness: number;   // Tristeza (0-1)
  surprise: number;  // Surpresa (0-1)
}

export interface MusicRecommendationRequest {
  userId: string;
  currentEmotion: EmotionalState;
  preferredGenres: string[];
  playlistSize?: number;
  algorithm?: 'fuzzy' | 'collaborative' | 'hybrid';
}

export interface FuzzyRule {
  id: string;
  conditions: string[];
  conclusion: string;
  weight: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
