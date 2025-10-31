import { Logger } from "./logger";

/**
 * Serviço para interagir com a API do Spotify
 */
export class SpotifyService {
  private static readonly BASE_URL = "https://api.spotify.com/v1";

  /**
   * Busca músicas no Spotify
   */
  static async searchTracks(
    query: string,
    accessToken: string,
    limit: number = 20
  ): Promise<any[]> {
    try {
      const params = new URLSearchParams({
        q: query,
        type: "track",
        limit: Math.min(limit, 50).toString(),
      });

      const response = await fetch(
        `${this.BASE_URL}/search?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status}`);
      }

      const data = await response.json();

      Logger.debug(`🔍 ${data.tracks.items.length} tracks encontradas`);

      return data.tracks.items.map((track: any) => ({
        id: track.id,
        spotifyId: track.id,
        title: track.name,
        artist: track.artists.map((a: any) => a.name).join(", "),
        album: track.album.name,
        albumArt: track.album.images[0]?.url,
        duration: track.duration_ms,
        previewUrl: track.preview_url,
        externalUrl: track.external_urls.spotify,
        uri: track.uri,
      }));
    } catch (error) {
      Logger.error("❌ Erro ao buscar tracks no Spotify", error);
      throw error;
    }
  }

  /**
   * Obter características de áudio (energia, valência, etc)
   */
  static async getAudioFeatures(
    trackIds: string[],
    accessToken: string
  ): Promise<any[]> {
    try {
      // Spotify permite max 100 IDs por requisição
      if (trackIds.length > 100) {
        Logger.warn(
          "⚠️ Mais de 100 tracks, vai precisar fazer múltiplas requisições"
        );
      }

      const ids = trackIds.slice(0, 100).join(",");
      const response = await fetch(
        `${this.BASE_URL}/audio-features?ids=${ids}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status}`);
      }

      const data = await response.json();

      Logger.debug(`🎵 ${data.audio_features.length} features obtidas`);

      return data.audio_features;
    } catch (error) {
      Logger.error("❌ Erro ao buscar audio features", error);
      throw error;
    }
  }

  /**
   * Buscar perfil do usuário
   */
  static async getUserProfile(accessToken: string): Promise<any> {
    try {
      const response = await fetch(`${this.BASE_URL}/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status}`);
      }

      const data = await response.json();

      Logger.debug("👤 Perfil obtido:", data.display_name);

      return {
        id: data.id,
        name: data.display_name,
        email: data.email,
        image: data.images[0]?.url,
        country: data.country,
        externalUrl: data.external_urls.spotify,
      };
    } catch (error) {
      Logger.error("❌ Erro ao buscar perfil", error);
      throw error;
    }
  }

  /**
   * Cria uma playlist no Spotify
   */
  static async createPlaylist(
    userId: string,
    name: string,
    description: string,
    isPublic: boolean,
    accessToken: string
  ): Promise<any> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/users/${userId}/playlists`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name,
            description: description,
            public: isPublic,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status}`);
      }

      const data = await response.json();

      Logger.debug("📝 Playlist criada:", data.id);

      return {
        id: data.id,
        name: data.name,
        uri: data.uri,
        externalUrl: data.external_urls.spotify,
        image: data.images[0]?.url,
      };
    } catch (error) {
      Logger.error("❌ Erro ao criar playlist", error);
      throw error;
    }
  }

  /**
   * Adiciona tracks a uma playlist
   */
  static async addTracksToPlaylist(
    playlistId: string,
    trackUris: string[],
    accessToken: string
  ): Promise<void> {
    try {
      // Spotify permite max 100 tracks por requisição
      const chunks = [];
      for (let i = 0; i < trackUris.length; i += 100) {
        chunks.push(trackUris.slice(i, i + 100));
      }

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];

        const response = await fetch(
          `${this.BASE_URL}/playlists/${playlistId}/tracks`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              uris: chunk,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Spotify API error: ${response.status}`);
        }

        Logger.debug(
          `🎵 Batch ${i + 1}/${chunks.length}: ${
            chunk.length
          } tracks adicionadas`
        );
      }

      Logger.debug(`✅ Total ${trackUris.length} tracks adicionadas`);
    } catch (error) {
      Logger.error("❌ Erro ao adicionar tracks", error);
      throw error;
    }
  }

  /**
   * Busca recomendações baseado em seed
   */
  static async getRecommendations(
    seedTrackIds: string[],
    seedArtistIds: string[],
    seedGenres: string[],
    accessToken: string,
    limit: number = 20
  ): Promise<any[]> {
    try {
      const params = new URLSearchParams({
        seed_tracks: seedTrackIds.slice(0, 5).join(","),
        seed_artists: seedArtistIds.slice(0, 5).join(","),
        seed_genres: seedGenres.slice(0, 5).join(","),
        limit: Math.min(limit, 100).toString(),
        market: "BR",
      });

      const response = await fetch(
        `${this.BASE_URL}/recommendations?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status}`);
      }

      const data = await response.json();

      Logger.debug(`🎯 ${data.tracks.length} recomendações obtidas`);

      return data.tracks;
    } catch (error) {
      Logger.error("❌ Erro ao buscar recomendações", error);
      throw error;
    }
  }

  /**
   * Busca top tracks do usuário
   */
  static async getTopTracks(
    accessToken: string,
    limit: number = 20,
    timeRange: "short_term" | "medium_term" | "long_term" = "medium_term"
  ): Promise<any[]> {
    try {
      const params = new URLSearchParams({
        limit: Math.min(limit, 50).toString(),
        time_range: timeRange,
      });

      const response = await fetch(
        `${this.BASE_URL}/me/top/tracks?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status}`);
      }

      const data = await response.json();

      Logger.debug(`🔝 ${data.items.length} top tracks obtidas`);

      return data.items;
    } catch (error) {
      Logger.error("❌ Erro ao buscar top tracks", error);
      throw error;
    }
  }

  /**
   * Busca categorias de gêneros
   */
  static async getCategories(accessToken: string): Promise<any[]> {
    try {
      const params = new URLSearchParams({
        limit: "50",
        country: "BR",
      });

      const response = await fetch(
        `${this.BASE_URL}/browse/categories?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status}`);
      }

      const data = await response.json();

      Logger.debug(`📚 ${data.categories.items.length} categorias obtidas`);

      return data.categories.items;
    } catch (error) {
      Logger.error("❌ Erro ao buscar categorias", error);
      throw error;
    }
  }
}
