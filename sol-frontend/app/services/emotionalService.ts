import { AuthService } from "./authService";

export interface EmotionalInput {
  sadness?: number; // 0-10
  joy?: number; // 0-10
  anger?: number; // 0-10
  fear?: number; // 0-10
  surprise?: number; // 0-10
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
    surprise: number;
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
      // Se as 5 emoções não forem passadas, usar estadoEmocional para compatibilidade
      const sadness = input.sadness ?? input.estadoEmocional ?? 5;
      const joy =
        input.joy ?? (input.estadoEmocional ? 10 - input.estadoEmocional : 5);
      const anger = input.anger ?? 0;
      const fear = input.fear ?? 0;
      const surprise = input.surprise ?? 0;

      // Validação
      if (
        sadness < 0 ||
        sadness > 10 ||
        joy < 0 ||
        joy > 10 ||
        anger < 0 ||
        anger > 10 ||
        fear < 0 ||
        fear > 10 ||
        surprise < 0 ||
        surprise > 10
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
        surprise,
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
      const response = await fetch(`${this.API_BASE}/ai/analyze`, {
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
          surprise,
          generoPreferido: input.generoPreferido,
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
      const fuzzyData = result.data.fuzzy_output;
      const emotionalData = result.data.emotional_state;

      const recommendation: EmotionalRecommendation = {
        id: `analysis_${Date.now()}`,
        fuzzyAnalysis: {
          intencao: fuzzyData.recommendation || "Neutro",
          confianca: fuzzyData.confidence || 0.5,
          descricao: result.message || "Análise realizada",
          valorIntencao: fuzzyData.intensity || 0.5,
          graus: {
            triste: emotionalData.sadness || 0,
            ansioso: emotionalData.fear || 0,
            neutro: 5,
            alegre: emotionalData.joy || 0,
          },
        },
        // USAR PLAYLIST DIRETAMENTE DO BACKEND COM TODOS OS CAMPOS
        playlist:
          fuzzyData.playlist?.map((track: any, idx: number) => ({
            id: track.id || `track_${idx}`,
            spotifyId: track.spotifyId || "",
            spotify_uri: track.spotify_uri, // Campo crítico para playback!
            name: track.name,
            artist: track.artist,
            duration: 180000,
            genre: track.genre || "Rock",
            position: track.position || idx + 1,
            scores: {
              sadness: emotionalData.sadness || 0,
              joy: emotionalData.joy || 0,
              anger: emotionalData.anger || 0,
              fear: emotionalData.fear || 0,
              surprise: emotionalData.surprise || 0,
            },
            audioFeatures: {
              energy: fuzzyData.intensity || 0.5,
              valence: fuzzyData.intensity || 0.5,
              danceability: 0.5,
              acousticness: 0.3,
            },
          })) || [],
        stats: {
          totalMusicas:
            fuzzyData.playlist?.length || fuzzyData.top_tracks?.length || 0,
          duracaoMinutos:
            (fuzzyData.playlist?.length || fuzzyData.top_tracks?.length || 0) *
            3,
          valenciaMedia: fuzzyData.intensity || 0.5,
          energiaMedia: fuzzyData.intensity || 0.5,
          tristezaMedia: emotionalData.sadness || 0,
          alegriaMedia: emotionalData.joy || 0,
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
