import { AuthService } from "./authService";
import * as React from "react";

// Tipos para recomendações
export interface EmotionalInput {
  estadoEmocional: number; // 0-10
  generoPreferido?: string;
  limit?: number;
}

export interface FuzzyAnalysis {
  intencaoPlaylist: string;
  grauConfianca: number;
  descricao: string;
  detalhes: {
    valoresLinguisticos: Record<string, number>;
    criteriosEmocionais: Record<string, number>;
  };
}

export interface Music {
  id: string;
  name: string;
  artist: string;
  album?: string;
  genre: string;
  durationMs: number;
  spotifyUri?: string;
  previewUrl?: string;
  // Scores emocionais
  angerScore?: number;
  joyScore?: number;
  sadnessScore?: number;
  fearScore?: number;
  surpriseScore?: number;
  // Características Spotify
  valence?: number;
  energy?: number;
  danceability?: number;
  acousticness?: number;
  tempo?: number;
}

export interface PlaylistRecommendation {
  analysis: FuzzyAnalysis;
  playlist: Music[];
  metadata: {
    userId: string;
    totalMusicas: number;
    generoFiltrado?: string;
    timestamp: string;
  };
}

export class RecommendationService {
  private static readonly API_BASE =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000/api"
      : "/api";

  /**
   * 🎯 Gerar Recomendação Completa (Fuzzy + Playlist)
   */
  static async generateRecommendation(input: EmotionalInput): Promise<{
    success: boolean;
    data?: PlaylistRecommendation;
    error?: string;
  }> {
    try {
      const token = AuthService.getToken();

      if (!token) {
        return {
          success: false,
          error: "Usuário não autenticado",
        };
      }

      console.log("🎵 Gerando recomendação musical...", input);

      const response = await fetch(
        `${this.API_BASE}/recommendations/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            emotionalData: {
              estadoEmocional: input.estadoEmocional,
              generoPreferido: input.generoPreferido || "rock",
            },
            preferences: {
              maxSongs: input.limit || 10,
              includeSpotify: true,
            },
          }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        return {
          success: false,
          error: result.error || "Erro ao gerar recomendação",
        };
      }

      // A API retorna: { analise: {...}, playlist: { musicas: [...] } }
      // Precisamos normalizar para: { analysis: {...}, playlist: [...] }

      const normalizedData = {
        analysis: result.analise || result.analysis,
        playlist: result.playlist?.musicas || result.playlist || [],
        metadata: {
          userId: result.user?.id || "",
          totalMusicas:
            result.playlist?.total || result.playlist?.musicas?.length || 0,
          generoFiltrado: input.generoPreferido,
          timestamp: result.timestamp || new Date().toISOString(),
        },
      };

      console.log("✅ Recomendação gerada com sucesso!");
      console.log(`   Intenção: ${normalizedData.analysis.intencaoPlaylist}`);
      console.log(`   Confiança: ${normalizedData.analysis.grauConfianca}%`);
      console.log(`   Músicas: ${normalizedData.playlist.length}`);

      return {
        success: true,
        data: normalizedData,
      };
    } catch (error) {
      console.error("❌ Erro ao gerar recomendação:", error);
      return {
        success: false,
        error: "Erro de conexão. Verifique se o backend está rodando.",
      };
    }
  }

  /**
   * 🧠 Análise Emocional Fuzzy (sem buscar músicas)
   */
  static async analyzeEmotion(
    estadoEmocional: number,
    generoPreferido?: string
  ): Promise<{
    success: boolean;
    data?: FuzzyAnalysis;
    error?: string;
  }> {
    try {
      const token = AuthService.getToken();

      if (!token) {
        return {
          success: false,
          error: "Usuário não autenticado",
        };
      }

      console.log("🧠 Analisando estado emocional...", estadoEmocional);

      const response = await fetch(`${this.API_BASE}/emotional/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          estadoEmocional,
          generoPreferido,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        return {
          success: false,
          error: result.error || "Erro na análise emocional",
        };
      }

      console.log("✅ Análise emocional concluída!");

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error("❌ Erro na análise:", error);
      return {
        success: false,
        error: "Erro de conexão.",
      };
    }
  }

  /**
   * 📋 Buscar Gêneros Disponíveis
   */
  static async getAvailableGenres(): Promise<{
    success: boolean;
    data?: string[];
    error?: string;
  }> {
    try {
      const token = AuthService.getToken();

      if (!token) {
        return {
          success: false,
          error: "Usuário não autenticado",
        };
      }

      const response = await fetch(`${this.API_BASE}/music/genres`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!result.success) {
        return {
          success: false,
          error: result.error || "Erro ao buscar gêneros",
        };
      }

      return {
        success: true,
        data: result.data.genres,
      };
    } catch (error) {
      console.error("❌ Erro ao buscar gêneros:", error);
      return {
        success: false,
        error: "Erro de conexão.",
      };
    }
  }

  /**
   * 🎵 Buscar Músicas de um Gênero
   */
  static async getMusicsByGenre(
    genre: string,
    limit: number = 20
  ): Promise<{
    success: boolean;
    data?: Music[];
    error?: string;
  }> {
    try {
      const token = AuthService.getToken();

      if (!token) {
        return {
          success: false,
          error: "Usuário não autenticado",
        };
      }

      const response = await fetch(`${this.API_BASE}/music/genres`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          genre,
          limit,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        return {
          success: false,
          error: result.error || "Erro ao buscar músicas",
        };
      }

      return {
        success: true,
        data: result.data.musics,
      };
    } catch (error) {
      console.error("❌ Erro ao buscar músicas:", error);
      return {
        success: false,
        error: "Erro de conexão.",
      };
    }
  }
}

// Hook React opcional para usar o serviço
export function useRecommendation() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();

  const generate = React.useCallback(async (input: EmotionalInput) => {
    setIsLoading(true);
    setError(undefined);

    try {
      const result = await RecommendationService.generateRecommendation(input);
      if (!result.success) {
        setError(result.error);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const analyze = React.useCallback(
    async (estadoEmocional: number, generoPreferido?: string) => {
      setIsLoading(true);
      setError(undefined);

      try {
        const result = await RecommendationService.analyzeEmotion(
          estadoEmocional,
          generoPreferido
        );
        if (!result.success) {
          setError(result.error);
        }
        return result;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    generate,
    analyze,
    isLoading,
    error,
    clearError: () => setError(undefined),
  };
}
