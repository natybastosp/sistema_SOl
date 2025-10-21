import { AuthService } from "./authService";
import * as React from "react";

export interface HistoryEntry {
  id: string;
  userId: string;
  estadoEmocional: number;
  generoPreferido?: string;
  intencaoPlaylist: string;
  totalMusicas: number;
  grauConfianca: number;
  createdAt: string;
}

export interface HistoryStats {
  totalAnalises: number;
  estadoEmocionalMedio: number;
  intencoesMaisComuns: Array<{
    intencao: string;
    quantidade: number;
  }>;
  generosFavoritos: Array<{
    genero: string;
    quantidade: number;
  }>;
  tendenciaEmocional?: {
    tendencia: "melhorando" | "piorando" | "estável";
    variacao: number;
  };
}

export interface EmotionalTrend {
  periodo: string;
  dataInicio: string;
  dataFim: string;
  totalAnalises: number;
  tendencia: Array<{
    data: string;
    estadoMedio: number;
    totalAnalises: number;
  }>;
}

export class HistoryService {
  private static readonly API_BASE =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000/api"
      : "/api";

  /**
   * 📋 Listar Histórico (com paginação)
   */
  static async getHistory(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    success: boolean;
    data?: {
      historico: HistoryEntry[];
      paginacao: {
        paginaAtual: number;
        totalPaginas: number;
        totalItens: number;
        itensPorPagina: number;
      };
    };
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

      console.log(`📋 Buscando histórico (página ${page})...`);

      const response = await fetch(
        `${this.API_BASE}/history?page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!result.success) {
        return {
          success: false,
          error: result.error || "Erro ao buscar histórico",
        };
      }

      console.log(
        `✅ Histórico carregado: ${result.data.historico.length} itens`
      );

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error("❌ Erro ao buscar histórico:", error);
      return {
        success: false,
        error: "Erro de conexão.",
      };
    }
  }

  /**
   * 📊 Obter Estatísticas
   */
  static async getStats(): Promise<{
    success: boolean;
    data?: HistoryStats;
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

      console.log("📊 Carregando estatísticas...");

      const response = await fetch(`${this.API_BASE}/history/stats`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!result.success) {
        return {
          success: false,
          error: result.error || "Erro ao buscar estatísticas",
        };
      }

      console.log("✅ Estatísticas carregadas!");

      return {
        success: true,
        data: result.stats,
      };
    } catch (error) {
      console.error("❌ Erro ao buscar estatísticas:", error);
      return {
        success: false,
        error: "Erro de conexão.",
      };
    }
  }

  /**
   * 📈 Tendência Emocional
   */
  static async getTrend(days: number = 30): Promise<{
    success: boolean;
    data?: EmotionalTrend;
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

      console.log(`📈 Buscando tendência dos últimos ${days} dias...`);

      const response = await fetch(
        `${this.API_BASE}/history/trend?days=${days}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!result.success) {
        return {
          success: false,
          error: result.error || "Erro ao buscar tendência",
        };
      }

      console.log("✅ Tendência carregada!");

      return {
        success: true,
        data: result.trend,
      };
    } catch (error) {
      console.error("❌ Erro ao buscar tendência:", error);
      return {
        success: false,
        error: "Erro de conexão.",
      };
    }
  }

  /**
   * 🔍 Detalhes de uma Análise Específica
   */
  static async getDetails(historyId: string): Promise<{
    success: boolean;
    data?: {
      analise: HistoryEntry;
      musicas: Array<{
        id: string;
        name: string;
        artist: string;
        album?: string;
        genre: string;
        durationMs: number;
      }>;
    };
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

      console.log(`🔍 Buscando detalhes da análise ${historyId}...`);

      const response = await fetch(`${this.API_BASE}/history/${historyId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!result.success) {
        return {
          success: false,
          error: result.error || "Erro ao buscar detalhes",
        };
      }

      console.log("✅ Detalhes carregados!");

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error("❌ Erro ao buscar detalhes:", error);
      return {
        success: false,
        error: "Erro de conexão.",
      };
    }
  }
}

// Hook React opcional
export function useHistory() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();

  const getHistory = React.useCallback(
    async (page: number = 1, limit: number = 10) => {
      setIsLoading(true);
      setError(undefined);

      try {
        const result = await HistoryService.getHistory(page, limit);
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

  const getStats = React.useCallback(async () => {
    setIsLoading(true);
    setError(undefined);

    try {
      const result = await HistoryService.getStats();
      if (!result.success) {
        setError(result.error);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTrend = React.useCallback(async (days: number = 30) => {
    setIsLoading(true);
    setError(undefined);

    try {
      const result = await HistoryService.getTrend(days);
      if (!result.success) {
        setError(result.error);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getDetails = React.useCallback(async (historyId: string) => {
    setIsLoading(true);
    setError(undefined);

    try {
      const result = await HistoryService.getDetails(historyId);
      if (!result.success) {
        setError(result.error);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getHistory,
    getStats,
    getTrend,
    getDetails,
    isLoading,
    error,
    clearError: () => setError(undefined),
  };
}
