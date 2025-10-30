import { AuthService } from "./authService";

export interface EmotionalInput {
  estadoEmocional: number; // 0-10
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
      // Validação
      if (input.estadoEmocional < 0 || input.estadoEmocional > 10) {
        return {
          success: false,
          error: "Estado emocional deve estar entre 0 e 10",
        };
      }

      console.log("🧠 Iniciando análise...", input);

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
          estadoEmocional: input.estadoEmocional,
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

      if (!result.success || !result.recommendation) {
        return {
          success: false,
          error: result.error || "Erro na análise",
        };
      }

      console.log("✅ Análise completa!");
      console.log(
        `   Intenção: ${result.recommendation.fuzzyAnalysis.intencao}`
      );
      console.log(`   Músicas: ${result.recommendation.playlist.length}`);

      return {
        success: true,
        data: result.recommendation,
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
