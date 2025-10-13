
export interface EmotionalAnalysisRequest {
  estadoEmocional: number;
  generoPreferido?: string;
}

export interface Recommendation {
  playlist: string[];
  intensity: number;
  genre: string;
  mood: string;
}

export interface EmotionalHistoryItem {
  id: string;
  emotionalState: number;
  recommendation: Recommendation;
  timestamp: string;
}

export class EmotionalAnalysisService {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  }

  private getHeaders(): HeadersInit {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }

  async analyzeEmotion(data: EmotionalAnalysisRequest): Promise<Recommendation> {
    try {
      const response = await fetch(`${this.baseURL}/emotions/analyze`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha na análise emocional');
      }

      const result = await response.json();
      return result.recommendation;

    } catch (error: any) {
      console.error('Erro ao analisar emoção:', error);
      throw new Error(error.message || 'Erro ao conectar com o servidor');
    }
  }

  async getHistory(): Promise<EmotionalHistoryItem[]> {
    try {
      const response = await fetch(`${this.baseURL}/emotions/history`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao buscar histórico');
      }

      const result = await response.json();
      return result.history;

    } catch (error: any) {
      console.error('Erro ao buscar histórico:', error);
      throw new Error(error.message || 'Erro ao conectar com o servidor');
    }
  }
}

export const emotionalService = new EmotionalAnalysisService();
