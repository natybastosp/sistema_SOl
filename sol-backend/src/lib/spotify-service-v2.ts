/**
 * Serviço Spotify com 2 fluxos de autenticação:
 * 1. Client Credentials Flow (Backend) - para APIs
 * 2. Authorization Code Flow (Frontend) - para Web Playback SDK
 */

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

interface SpotifyUser {
  id: string;
  display_name: string;
  email?: string;
  external_urls: { spotify: string };
  followers: { href: null; total: number };
  href: string;
  images: Array<{ height?: number; url: string; width?: number }>;
  product?: string;
  type: string;
  uri: string;
}

interface SpotifyTrack {
  uri: string;
  id: string;
  name: string;
  artists: Array<{ name: string }>;
}

class SpotifyService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  private clientAccessToken: string | null = null;
  private clientTokenExpiry: number = 0;

  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID || "";
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET || "";
    this.redirectUri = process.env.SPOTIFY_REDIRECT_URI || "";

    if (!this.clientId || !this.clientSecret) {
      throw new Error("Missing Spotify credentials in environment variables");
    }
  }

  /**
   * 🔵 FLUXO 1: Client Credentials Flow
   * Backend obtém token sem intervenção do user
   * Usado para APIs do backend (buscar dados, etc)
   */
  async getClientAccessToken(): Promise<string> {
    const now = Date.now();

    // Retorna token em cache se ainda válido
    if (this.clientAccessToken && now < this.clientTokenExpiry) {
      return this.clientAccessToken;
    }

    const authString = Buffer.from(
      `${this.clientId}:${this.clientSecret}`
    ).toString("base64");

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${authString}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(
        `Failed to get Spotify client token: ${response.status} - ${errorData}`
      );
    }

    const data = (await response.json()) as SpotifyTokenResponse;

    this.clientAccessToken = data.access_token;
    // Guardar expiry com margem de 60 segundos antes de expirar
    this.clientTokenExpiry = now + (data.expires_in - 60) * 1000;

    return this.clientAccessToken;
  }

  /**
   * 🟢 FLUXO 2: Authorization Code Flow - Passo 1
   * Gera URL de autorização para o user fazer login no Spotify
   * Frontend será redirecionado para esta URL
   */
  getAuthorizationUrl(state: string): string {
    const scopes = [
      "streaming", // Para Web Playback SDK
      "user-read-email",
      "user-read-private",
      "user-read-playback-state",
      "user-modify-playback-state",
    ];

    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: "code",
      redirect_uri: this.redirectUri,
      state: state,
      scope: scopes.join(" "),
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  /**
   * 🟢 FLUXO 2: Authorization Code Flow - Passo 2
   * Troca o authorization code por access_token + refresh_token
   * Executado no callback após user autorizar
   */
  async exchangeCodeForTokens(code: string): Promise<SpotifyTokenResponse> {
    const authString = Buffer.from(
      `${this.clientId}:${this.clientSecret}`
    ).toString("base64");

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${authString}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: this.redirectUri,
      }).toString(),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(
        `Failed to exchange code for tokens: ${response.status} - ${errorData}`
      );
    }

    return (await response.json()) as SpotifyTokenResponse;
  }

  /**
   * 🟢 FLUXO 2: Authorization Code Flow - Renovar Token
   * Usa refresh_token para obter novo access_token
   */
  async refreshAccessToken(
    refreshToken: string
  ): Promise<SpotifyTokenResponse> {
    const authString = Buffer.from(
      `${this.clientId}:${this.clientSecret}`
    ).toString("base64");

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${authString}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }).toString(),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(
        `Failed to refresh token: ${response.status} - ${errorData}`
      );
    }

    return (await response.json()) as SpotifyTokenResponse;
  }

  /**
   * Obter perfil do user usando access_token (user token)
   */
  async getUserProfile(userAccessToken: string): Promise<SpotifyUser> {
    const response = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${userAccessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(
        `Failed to get user profile: ${response.status} - ${errorData}`
      );
    }

    return (await response.json()) as SpotifyUser;
  }

  /**
   * Buscar track no Spotify usando Client Credentials
   */
  async searchTrack(query: string): Promise<SpotifyTrack | null> {
    const clientToken = await this.getClientAccessToken();

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        query
      )}&type=track&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${clientToken}`,
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      tracks: { items: SpotifyTrack[] };
    };
    return data.tracks?.items?.[0] || null;
  }

  /**
   * Reproduzir track em um device específico (requer user token)
   */
  async playTrack(
    userAccessToken: string,
    deviceId: string,
    spotifyUri: string
  ): Promise<boolean> {
    const response = await fetch("https://api.spotify.com/v1/me/player/play", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${userAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        device_ids: [deviceId],
        uris: [spotifyUri],
      }),
    });

    return response.ok || response.status === 204;
  }

  /**
   * Pausar reprodução (requer user token)
   */
  async pause(userAccessToken: string, deviceId?: string): Promise<boolean> {
    const url = new URL("https://api.spotify.com/v1/me/player/pause");
    if (deviceId) {
      url.searchParams.set("device_id", deviceId);
    }

    const response = await fetch(url.toString(), {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${userAccessToken}`,
      },
    });

    return response.ok || response.status === 204;
  }

  /**
   * Próxima faixa (requer user token)
   */
  async next(userAccessToken: string, deviceId?: string): Promise<boolean> {
    const url = new URL("https://api.spotify.com/v1/me/player/next");
    if (deviceId) {
      url.searchParams.set("device_id", deviceId);
    }

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userAccessToken}`,
      },
    });

    return response.ok || response.status === 204;
  }

  /**
   * Faixa anterior (requer user token)
   */
  async previous(userAccessToken: string, deviceId?: string): Promise<boolean> {
    const url = new URL("https://api.spotify.com/v1/me/player/previous");
    if (deviceId) {
      url.searchParams.set("device_id", deviceId);
    }

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userAccessToken}`,
      },
    });

    return response.ok || response.status === 204;
  }
}

// Exportar singleton
export const spotifyService = new SpotifyService();
