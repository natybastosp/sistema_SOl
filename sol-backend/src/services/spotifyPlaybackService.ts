import axios from "axios";
import { SpotifyAuthService } from "./spotifyAuthService";

const SPOTIFY_API_URL = "https://api.spotify.com/v1";

export class SpotifyPlaybackService {
  /**
   * Inicia a reprodução de uma música específica
   */
  static async playTrack(
    userId: number,
    spotifyUri: string,
    deviceId?: string
  ) {
    const token = await SpotifyAuthService.getValidToken(userId);

    try {
      const url = deviceId
        ? `${SPOTIFY_API_URL}/me/player/play?device_id=${deviceId}`
        : `${SPOTIFY_API_URL}/me/player/play`;

      await axios.put(
        url,
        {
          uris: [spotifyUri], // Ex: "spotify:track:4u7EnebtmKWzUH433cf5Qv"
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return { success: true, message: "Reprodução iniciada" };
    } catch (error: any) {
      // Se não houver dispositivo ativo, retorna erro específico
      if (error.response?.status === 404) {
        return {
          success: false,
          error: "NO_ACTIVE_DEVICE",
          message:
            "Nenhum dispositivo Spotify ativo encontrado. Abra o Spotify em algum dispositivo.",
        };
      }
      throw error;
    }
  }

  /**
   * Pausa a reprodução atual
   */
  static async pausePlayback(userId: number) {
    const token = await SpotifyAuthService.getValidToken(userId);

    await axios.put(
      `${SPOTIFY_API_URL}/me/player/pause`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { success: true, message: "Reprodução pausada" };
  }

  /**
   * Resume a reprodução
   */
  static async resumePlayback(userId: number) {
    const token = await SpotifyAuthService.getValidToken(userId);

    await axios.put(
      `${SPOTIFY_API_URL}/me/player/play`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { success: true, message: "Reprodução retomada" };
  }

  /**
   * Pula para a próxima música
   */
  static async skipToNext(userId: number) {
    const token = await SpotifyAuthService.getValidToken(userId);

    await axios.post(
      `${SPOTIFY_API_URL}/me/player/next`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { success: true, message: "Próxima música" };
  }

  /**
   * Volta para a música anterior
   */
  static async skipToPrevious(userId: number) {
    const token = await SpotifyAuthService.getValidToken(userId);

    await axios.post(
      `${SPOTIFY_API_URL}/me/player/previous`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { success: true, message: "Música anterior" };
  }

  /**
   * Adiciona música à fila
   */
  static async addToQueue(userId: number, spotifyUri: string) {
    const token = await SpotifyAuthService.getValidToken(userId);

    await axios.post(
      `${SPOTIFY_API_URL}/me/player/queue?uri=${spotifyUri}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { success: true, message: "Música adicionada à fila" };
  }

  /**
   * Obtém o estado atual da reprodução
   */
  static async getCurrentPlayback(userId: number) {
    const token = await SpotifyAuthService.getValidToken(userId);

    const response = await axios.get(`${SPOTIFY_API_URL}/me/player`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  /**
   * Lista os dispositivos disponíveis do usuário
   */
  static async getAvailableDevices(userId: number) {
    const token = await SpotifyAuthService.getValidToken(userId);

    const response = await axios.get(`${SPOTIFY_API_URL}/me/player/devices`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.devices;
  }

  /**
   * Toca uma playlist inteira
   */
  static async playPlaylist(
    userId: number,
    trackUris: string[],
    deviceId?: string
  ) {
    const token = await SpotifyAuthService.getValidToken(userId);

    try {
      const url = deviceId
        ? `${SPOTIFY_API_URL}/me/player/play?device_id=${deviceId}`
        : `${SPOTIFY_API_URL}/me/player/play`;

      await axios.put(
        url,
        {
          uris: trackUris, // Array de URIs: ["spotify:track:xxx", "spotify:track:yyy"]
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return { success: true, message: "Playlist iniciada" };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return {
          success: false,
          error: "NO_ACTIVE_DEVICE",
          message: "Nenhum dispositivo Spotify ativo encontrado.",
        };
      }
      throw error;
    }
  }
}
