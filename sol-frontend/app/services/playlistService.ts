import { AuthService } from "./authService";

/**
 * 🎵 Playlist Service
 * Gerenciamento de playlists salvas do usuário
 */

export interface PlaylistEmotion {
  sadness: number;
  joy: number;
  anger: number;
  fear: number;
  surprise: number;
}

export interface SavedPlaylist {
  id: string;
  name: string;
  description: string;
  date: string;
  musicCount: number;
  duration: string;
  likes: number;
  cover: string;
  emotions: PlaylistEmotion;
  spotifyPlaylistId?: string;
}

export interface PlaylistMusic {
  id: string;
  name: string;
  artist: string;
  album?: string;
  duration?: number;
  spotifyId?: string;
  spotifyUri?: string;
}

export interface PlaylistDetail extends SavedPlaylist {
  musics: PlaylistMusic[];
}

export class PlaylistService {
  private static readonly API_BASE =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000/api"
      : "/api";

  /**
   * 📋 Listar todas as playlists do usuário
   */
  static async getPlaylists(): Promise<{
    success: boolean;
    data?: SavedPlaylist[];
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

      console.log("🔍 Buscando playlists...");

      const response = await fetch(`${this.API_BASE}/playlists`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!result.success) {
        return {
          success: false,
          error: result.error || "Erro ao buscar playlists",
        };
      }

      console.log(`✅ ${result.data?.length || 0} playlists encontradas`);

      return {
        success: true,
        data: result.data || [],
      };
    } catch (error) {
      console.error("❌ Erro ao buscar playlists:", error);
      return {
        success: false,
        error: "Erro de conexão com o servidor",
      };
    }
  }

  /**
   * 🔍 Buscar uma playlist específica
   */
  static async getPlaylist(id: string): Promise<{
    success: boolean;
    data?: PlaylistDetail;
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

      console.log(`🔍 Buscando playlist ${id}...`);

      const response = await fetch(`${this.API_BASE}/playlists/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!result.success) {
        return {
          success: false,
          error: result.error || "Erro ao buscar playlist",
        };
      }

      console.log(`✅ Playlist encontrada: ${result.data?.name}`);

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error("❌ Erro ao buscar playlist:", error);
      return {
        success: false,
        error: "Erro de conexão com o servidor",
      };
    }
  }

  /**
   * 🗑️ Deletar uma playlist
   */
  static async deletePlaylist(id: string): Promise<{
    success: boolean;
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

      console.log(`🗑️ Deletando playlist ${id}...`);

      const response = await fetch(`${this.API_BASE}/playlists/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!result.success) {
        return {
          success: false,
          error: result.error || "Erro ao deletar playlist",
        };
      }

      console.log("✅ Playlist deletada com sucesso");

      return {
        success: true,
      };
    } catch (error) {
      console.error("❌ Erro ao deletar playlist:", error);
      return {
        success: false,
        error: "Erro de conexão com o servidor",
      };
    }
  }

  /**
   * ❤️ Curtir/Descurtir uma playlist (incrementa o contador de likes)
   */
  static async likePlaylist(
    id: string,
    currentLikes: number
  ): Promise<{
    success: boolean;
    data?: { likes: number };
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

      console.log(`❤️ Curtindo playlist ${id}...`);

      const newLikes = currentLikes + 1;

      const response = await fetch(`${this.API_BASE}/playlists/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          likes: newLikes,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        return {
          success: false,
          error: result.error || "Erro ao curtir playlist",
        };
      }

      console.log("✅ Playlist curtida com sucesso");

      return {
        success: true,
        data: { likes: result.data?.likes || newLikes },
      };
    } catch (error) {
      console.error("❌ Erro ao curtir playlist:", error);
      return {
        success: false,
        error: "Erro de conexão com o servidor",
      };
    }
  }

  /**
   * ✏️ Atualizar informações da playlist
   */
  static async updatePlaylist(
    id: string,
    updates: {
      name?: string;
      description?: string;
      cover?: string;
    }
  ): Promise<{
    success: boolean;
    data?: PlaylistDetail;
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

      console.log(`✏️ Atualizando playlist ${id}...`);

      const response = await fetch(`${this.API_BASE}/playlists/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      const result = await response.json();

      if (!result.success) {
        return {
          success: false,
          error: result.error || "Erro ao atualizar playlist",
        };
      }

      console.log("✅ Playlist atualizada com sucesso");

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error("❌ Erro ao atualizar playlist:", error);
      return {
        success: false,
        error: "Erro de conexão com o servidor",
      };
    }
  }

  /**
   * 📊 Estatísticas das playlists
   */
  static async getPlaylistStats(): Promise<{
    success: boolean;
    data?: {
      total: number;
      totalMusics: number;
      totalLikes: number;
      averageDuration: string;
    };
    error?: string;
  }> {
    try {
      const playlistsResponse = await this.getPlaylists();

      if (!playlistsResponse.success || !playlistsResponse.data) {
        return {
          success: false,
          error: playlistsResponse.error,
        };
      }

      const playlists = playlistsResponse.data;

      const total = playlists.length;
      const totalMusics = playlists.reduce(
        (sum: number, p: SavedPlaylist) => sum + p.musicCount,
        0
      );
      const totalLikes = playlists.reduce(
        (sum: number, p: SavedPlaylist) => sum + p.likes,
        0
      );

      // Calcular duração média
      const totalDurationMinutes = playlists.reduce(
        (sum: number, p: SavedPlaylist) => {
          const [mins, secs] = p.duration.split(":").map(Number);
          return sum + mins + secs / 60;
        },
        0
      );

      const avgMinutes = Math.floor(totalDurationMinutes / (total || 1));
      const avgSeconds = Math.floor(
        ((totalDurationMinutes / (total || 1)) % 1) * 60
      );
      const averageDuration = `${avgMinutes}:${avgSeconds.toString().padStart(2, "0")}`;

      return {
        success: true,
        data: {
          total,
          totalMusics,
          totalLikes,
          averageDuration: isNaN(avgMinutes) ? "0:00" : averageDuration,
        },
      };
    } catch (error) {
      console.error("❌ Erro ao calcular estatísticas:", error);
      return {
        success: false,
        error: "Erro ao calcular estatísticas",
      };
    }
  }
}
