import { AuthService } from "./authService";

export interface EmotionalInput {
  sadness?: number; // 0-10
  joy?: number; // 0-10
  anger?: number; // 0-10
  fear?: number; // 0-10
  estadoEmocional?: number; // 0-10 (deprecated - para compatibilidade)
  generoPreferido?: string;
}

export interface FuzzyAnalysisResult {
  intencao: string;
  confianca: number;
  descricao: string;
  valorIntencao: number;
  graus: {
    triste: number;
    ansioso: number;
    neutro: number;
    alegre: number;
  };
}

export interface MusicTrack {
  id: string;
  spotifyId: string;
  spotify_uri?: string; // Para Spotify Web Playback SDK
  name: string;
  artist: string;
  album?: string;
  duration: number;
  genre: string;
  position: number;
  scores: {
    sadness: number;
    joy: number;
    anger: number;
    fear: number;
  };
  audioFeatures: {
    energy: number;
    valence: number;
    danceability: number;
    acousticness: number;
  };
}

export interface PlaylistStats {
  totalMusicas: number;
  duracaoMinutos: number;
  valenciaMedia: number;
  energiaMedia: number;
  tristezaMedia: number;
  alegriaMedia: number;
}

export interface EmotionalRecommendation {
  id: string;
  fuzzyAnalysis: FuzzyAnalysisResult;
  playlist: MusicTrack[];
  stats: PlaylistStats;
  timestamp: string;
}

// SERVICE

export class EmotionalService {
  private static readonly API_BASE =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000/api"
      : "/api";

  /**
   * 🎯 Análise Emocional Completa
   */
  static async analyzeWithFuzzy(input: EmotionalInput): Promise<{
    success: boolean;
    data?: EmotionalRecommendation;
    error?: string;
  }> {
    try {
      // Se as 4 emoções não forem passadas, usar estadoEmocional para compatibilidade
      const sadness = input.sadness ?? input.estadoEmocional ?? 5;
      const joy =
        input.joy ?? (input.estadoEmocional ? 10 - input.estadoEmocional : 5);
      const anger = input.anger ?? 0;
      const fear = input.fear ?? 0;

      // Validação
      if (
        sadness < 0 ||
        sadness > 10 ||
        joy < 0 ||
        joy > 10 ||
        anger < 0 ||
        anger > 10 ||
        fear < 0 ||
        fear > 10
      ) {
        return {
          success: false,
          error: "Todas as emoções devem estar entre 0 e 10",
        };
      }

      console.log("🧠 Iniciando análise...", {
        sadness,
        joy,
        anger,
        fear,
        generoPreferido: input.generoPreferido,
      });

      // Token
      const token = AuthService.getToken();
      if (!token) {
        return {
          success: false,
          error: "Usuário não autenticado",
        };
      }

      // API Call
      const response = await fetch(`${this.API_BASE}/emotions/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sadness,
          joy,
          anger,
          fear,
          // 🔧 Normalizar gênero para minúsculas
          generoPreferido: input.generoPreferido
            ? input.generoPreferido.toLowerCase()
            : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `Erro ${response.status}`,
        };
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.message || "Erro na análise",
        };
      }

      // Mapear resposta do backend para o formato esperado pelo frontend
      const analysisData = result.data.analysis || {};
      const playlistData = result.data.playlist || [];

      const recommendation: EmotionalRecommendation = {
        id: result.data.analysisId || `analysis_${Date.now()}`,
        fuzzyAnalysis: {
          intencao: "Neutro", // Será calculado baseado em estadoEmocional
          confianca: analysisData.grauConfianca || 0.5,
          descricao: "Análise fuzzy realizada com sucesso",
          valorIntencao: analysisData.grauConfianca || 0.5,
          graus: {
            triste: 0,
            ansioso: 0,
            neutro: 5,
            alegre: 0,
          },
        },
        // Mapear playlist do backend
        playlist:
          playlistData.map((track: any, idx: number) => ({
            id: track.id || `track_${idx}`,
            spotifyId: track.spotifyId || "",
            spotify_uri: `spotify:track:${track.spotifyId}`, // Construir URI do Spotify
            name: track.title,
            artist: track.artist,
            duration: track.duration || 180000,
            genre: track.genre || "rock",
            position: idx + 1,
            scores: {
              sadness: 0,
              joy: 0,
              anger: 0,
              fear: 0,
            },
            audioFeatures: {
              energy: 0.5,
              valence: 0.5,
              danceability: 0.5,
              acousticness: 0.3,
            },
          })) || [],
        stats: {
          totalMusicas: playlistData.length || 0,
          duracaoMinutos: (playlistData.length || 0) * 3,
          valenciaMedia: 0.5,
          energiaMedia: 0.5,
          tristezaMedia: 0,
          alegriaMedia: 0,
        },
        timestamp: new Date().toISOString(),
      };

      console.log("✅ Análise completa!");
      console.log(`   Intenção: ${recommendation.fuzzyAnalysis.intencao}`);
      console.log(`   Músicas: ${recommendation.playlist.length}`);

      return {
        success: true,
        data: recommendation,
      };
    } catch (error: any) {
      console.error("❌ Erro:", error);
      return {
        success: false,
        error: "Erro de conexão. Verifique se o backend está rodando.",
      };
    }
  }

  /**
   * 🎨 Cor para Intenção
   */
  static getIntentionColor(intencao: string): {
    tailwind: string;
    hex: string;
    emoji: string;
  } {
    const colors: Record<string, any> = {
      calmante: { tailwind: "bg-blue-500", hex: "#3b82f6", emoji: "😌" },
      reflexiva: { tailwind: "bg-purple-500", hex: "#a855f7", emoji: "🤔" },
      neutra: { tailwind: "bg-gray-500", hex: "#6b7280", emoji: "😐" },
      estimulante: { tailwind: "bg-orange-500", hex: "#f97316", emoji: "⚡" },
      feliz: { tailwind: "bg-yellow-500", hex: "#eab308", emoji: "😊" },
    };

    return (
      colors[intencao.toLowerCase()] || {
        tailwind: "bg-gray-500",
        hex: "#6b7280",
        emoji: "🎵",
      }
    );
  }

  /**
   * ⏱️ Formatar Duração
   */
  static formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
}

export default EmotionalService;
