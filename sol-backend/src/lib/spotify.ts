import axios from "axios";

// Interface para definir a estrutura de uma música do Spotify
interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string; id: string }>;
  album: {
    name: string;
    id: string;
    release_date: string;
  };
  duration_ms: number;
  popularity: number;
  preview_url: string | null;
  uri: string;
  external_urls: {
    spotify: string;
  };
}

// Interface para características de áudio (essencial para recomendações emocionais)
interface AudioFeatures {
  danceability: number; // 0.0 - 1.0 (quão dançante)
  energy: number; // 0.0 - 1.0 (energia/intensidade)
  valence: number; // 0.0 - 1.0 (positividade emocional)
  acousticness: number; // 0.0 - 1.0 (quão acústica)
  instrumentalness: number; // 0.0 - 1.0 (instrumental vs vocal)
  speechiness: number; // 0.0 - 1.0 (falada vs cantada)
  liveness: number; // 0.0 - 1.0 (gravação ao vivo)
  loudness: number; // Volume em dB
  tempo: number; // BPM (batidas por minuto)
  time_signature: number; // Assinatura de tempo
}

// Resultado de busca estruturado
interface SearchResult {
  found: boolean;
  track?: SpotifyTrack;
  audioFeatures?: AudioFeatures;
  error?: string;
}

class SpotifyService {
  private token: string | null = null;
  private tokenExpiry: number = 0;

  // URLs da API do Spotify
  private readonly ACCOUNTS_URL = "https://accounts.spotify.com/api/token";
  private readonly API_URL = "https://api.spotify.com/v1";

  constructor() {
    // Verificar se as credenciais estão configuradas
    if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
      console.warn(
        "⚠️  Credenciais do Spotify não configuradas. Algumas funcionalidades estarão limitadas."
      );
    }
  }

  /**
   * Obtém token de acesso do Spotify usando Client Credentials Flow
   * Este método é automaticamente chamado quando necessário
   */
  private async getAccessToken(): Promise<string> {
    // Se já temos um token válido, reutilizar (otimização)
    const now = Date.now();
    if (this.token && this.tokenExpiry > now) {
      return this.token;
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("Credenciais do Spotify não configuradas");
    }

    try {
      // Encode das credenciais em Base64 (padrão OAuth2)
      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString(
        "base64"
      );

      const response = await axios.post(
        this.ACCOUNTS_URL,
        "grant_type=client_credentials",
        {
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      this.token = response.data.access_token;
      // Configurar expiração com margem de segurança (5 minutos antes)
      this.tokenExpiry = now + (response.data.expires_in - 300) * 1000;

      return this.token;
    } catch (error: any) {
      console.error(
        "Erro ao obter token do Spotify:",
        error.response?.data || error.message
      );
      throw new Error("Falha na autenticação com Spotify");
    }
  }

  /**
   * Busca uma música específica no Spotify
   * @param trackName Nome da música
   * @param artistName Nome do artista
   * @param includeAudioFeatures Se deve incluir características de áudio
   */
  async searchTrack(
    trackName: string,
    artistName: string,
    includeAudioFeatures: boolean = true
  ): Promise<SearchResult> {
    try {
      const token = await this.getAccessToken();

      // Construir query otimizada para busca precisa
      const query = `track:"${trackName}" artist:"${artistName}"`;

      const response = await axios.get(`${this.API_URL}/search`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          q: query,
          type: "track",
          limit: 1,
          market: "BR", // Mercado brasileiro
        },
      });

      const tracks = response.data.tracks.items;

      if (tracks.length === 0) {
        return { found: false };
      }

      const track = tracks[0];
      const result: SearchResult = {
        found: true,
        track,
      };

      // Se solicitado, buscar características de áudio
      if (includeAudioFeatures) {
        result.audioFeatures = await this.getAudioFeatures(track.id);
      }

      return result;
    } catch (error: any) {
      console.error(
        "Erro na busca do Spotify:",
        error.response?.data || error.message
      );
      return {
        found: false,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }

  /**
   * Obtém características de áudio de uma música
   * Essencial para o algoritmo de recomendação emocional do SOL
   */
  async getAudioFeatures(spotifyId: string): Promise<AudioFeatures | null> {
    try {
      const token = await this.getAccessToken();

      const response = await axios.get(
        `${this.API_URL}/audio-features/${spotifyId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "Erro ao obter características de áudio:",
        error.response?.data || error.message
      );
      return null;
    }
  }

  /**
   * Busca múltiplas músicas em lote (otimizado para expansão do catálogo)
   * @param tracks Array de {trackName, artistName}
   * @param delayMs Delay entre requisições para respeitar rate limits
   */
  async searchMultipleTracks(
    tracks: Array<{ trackName: string; artistName: string }>,
    delayMs: number = 100
  ): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    for (const track of tracks) {
      const result = await this.searchTrack(track.trackName, track.artistName);
      results.push(result);

      // Respeitar rate limits do Spotify
      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    return results;
  }

  /**
   * Analisa emocionalmente uma música baseada em suas características
   * Esta é uma interpretação simplificada - você pode expandir com sua lógica fuzzy
   */
  analyzeEmotionalProfile(audioFeatures: AudioFeatures): {
    mood: string;
    energyLevel: string;
    therapeuticPotential: {
      anxiety: number; // 0-1 (potencial para reduzir ansiedade)
      depression: number; // 0-1 (potencial para ajudar com depressão)
      relaxation: number; // 0-1 (potencial relaxante)
      motivation: number; // 0-1 (potencial motivacional)
    };
  } {
    const { valence, energy, acousticness, danceability, tempo } =
      audioFeatures;

    // Determinar humor geral
    let mood = "neutral";
    if (valence > 0.6 && energy > 0.6) mood = "happy-energetic";
    else if (valence > 0.6 && energy < 0.4) mood = "happy-calm";
    else if (valence < 0.4 && energy < 0.4) mood = "sad-calm";
    else if (valence < 0.4 && energy > 0.6) mood = "intense-emotional";

    // Determinar nível de energia
    let energyLevel = "medium";
    if (energy > 0.7) energyLevel = "high";
    else if (energy < 0.3) energyLevel = "low";

    // Calcular potencial terapêutico (algoritmo simplificado)
    const therapeuticPotential = {
      // Ansiedade: músicas calmas e positivas ajudam
      anxiety: Math.max(0, (1 - energy) * 0.7 + valence * 0.3),

      // Depressão: músicas positivas mas não necessariamente calmas
      depression: valence * 0.8 + (danceability > 0.5 ? 0.2 : 0),

      // Relaxamento: músicas calmas e acústicas
      relaxation:
        (1 - energy) * 0.5 + acousticness * 0.3 + (tempo < 100 ? 0.2 : 0),

      // Motivação: músicas energéticas e positivas
      motivation: energy * 0.6 + valence * 0.4,
    };

    return {
      mood,
      energyLevel,
      therapeuticPotential,
    };
  }
}

// Instância singleton para reutilização
export const spotifyService = new SpotifyService();

// Exportar tipos para uso em outras partes do sistema
export type { SpotifyTrack, AudioFeatures, SearchResult };
