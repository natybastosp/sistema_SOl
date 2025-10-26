import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Pegar token JWT do localStorage (ajuste conforme seu sistema de auth)
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Headers padrão com autenticação
const getHeaders = () => ({
  'Authorization': `Bearer ${getAuthToken()}`,
  'Content-Type': 'application/json',
});

/**
 * Serviço de comunicação com a API do Spotify
 */
export const spotifyService = {
  /**
   * Iniciar processo de conexão com Spotify
   * Retorna a URL para onde o usuário deve ser redirecionado
   */
  async connectSpotify(): Promise<{ authUrl: string; stateToken: string }> {
    try {
      const response = await axios.post(
        `${API_URL}/api/spotify/auth/login`,
        {},
        { headers: getHeaders() }
      );

      return {
        authUrl: response.data.authUrl,
        stateToken: response.data.stateToken,
      };
    } catch (error: any) {
      console.error('Erro ao conectar Spotify:', error);
      throw new Error(error.response?.data?.message || 'Erro ao conectar');
    }
  },

  /**
   * Verificar se o usuário já conectou o Spotify
   */
  async getStatus(): Promise<{
    connected: boolean;
    spotifyUserId: string | null;
    tokenValid: boolean;
  }> {
    try {
      const response = await axios.get(
        `${API_URL}/api/spotify/auth/status`,
        { headers: getHeaders() }
      );

      return response.data;
    } catch (error: any) {
      console.error('Erro ao verificar status:', error);
      return { connected: false, spotifyUserId: null, tokenValid: false };
    }
  },

  /**
   * Desconectar conta Spotify
   */
  async disconnect(): Promise<void> {
    try {
      await axios.post(
        `${API_URL}/api/spotify/auth/disconnect`,
        {},
        { headers: getHeaders() }
      );
    } catch (error: any) {
      console.error('Erro ao desconectar:', error);
      throw new Error(error.response?.data?.message || 'Erro ao desconectar');
    }
  },

  /**
   * Obter token de acesso para o Web Playback SDK
   */
  async getPlayerToken(): Promise<string> {
    try {
      const response = await axios.get(
        `${API_URL}/api/spotify/player/token`,
        { headers: getHeaders() }
      );

      return response.data.accessToken;
    } catch (error: any) {
      console.error('Erro ao obter token:', error);
      throw new Error(error.response?.data?.message || 'Erro ao obter token');
    }
  },

  /**
   * Tocar músicas no Spotify
   * @param uris Array de URIs do Spotify (ex: ["spotify:track:xxx"])
   * @param deviceId ID do dispositivo (opcional)
   */
  async play(uris: string[], deviceId?: string): Promise<void> {
    try {
      await axios.post(
        `${API_URL}/api/spotify/player/play`,
        { uris, device_id: deviceId },
        { headers: getHeaders() }
      );
    } catch (error: any) {
      console.error('Erro ao tocar música:', error);
      throw new Error(error.response?.data?.message || 'Erro ao tocar música');
    }
  },

  /**
   * Pausar reprodução
   */
  async pause(): Promise<void> {
    try {
      await axios.put(
        `${API_URL}/api/spotify/player/pause`,
        {},
        { headers: getHeaders() }
      );
    } catch (error: any) {
      console.error('Erro ao pausar:', error);
      throw new Error(error.response?.data?.message || 'Erro ao pausar');
    }
  },

  /**
   * Obter informações da música tocando atualmente
   */
  async getCurrentlyPlaying(): Promise<{
    isPlaying: boolean;
    track?: any;
  }> {
    try {
      const response = await axios.get(
        `${API_URL}/api/spotify/player/currently-playing`,
        { headers: getHeaders() }
      );

      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar música atual:', error);
      return { isPlaying: false };
    }
  },
};