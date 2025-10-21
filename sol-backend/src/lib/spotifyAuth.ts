import axios from "axios";
import { prisma } from "@/lib/prisma";

/**
 * SpotifyAuthService - Gerencia autenticação OAuth 2.0 para usuários
 *
 * Este serviço implementa o Authorization Code Flow do Spotify, que permite
 * que usuários autorizem nosso app a controlar o player deles.
 */
class SpotifyAuthService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;

  // URLs oficiais da API do Spotify
  private readonly ACCOUNTS_URL = "https://accounts.spotify.com";
  private readonly API_URL = "https://api.spotify.com/v1";

  constructor() {
    // Validar que todas as credenciais necessárias estão configuradas
    this.clientId = process.env.SPOTIFY_CLIENT_ID || "";
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET || "";
    this.redirectUri = process.env.SPOTIFY_REDIRECT_URI || "";

    if (!this.clientId || !this.clientSecret || !this.redirectUri) {
      throw new Error(
        "Credenciais do Spotify incompletas. Verifique SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET e SPOTIFY_REDIRECT_URI"
      );
    }
  }

  /**
   * Gera a URL para onde devemos redirecionar o usuário para autorizar o app
   *
   * O parâmetro 'state' é importante para segurança - ele permite verificar
   * que o callback veio realmente de uma requisição nossa, prevenindo ataques CSRF
   */
  getAuthorizationUrl(state: string): string {
    const scopes = [
      "streaming", // Permite streaming de música
      "user-read-email", // Ler email do usuário
      "user-read-private", // Ler informações básicas do perfil
      "user-modify-playback-state", // Controlar o player (play, pause, skip)
      "user-read-playback-state", // Ver o que está tocando
      "user-read-currently-playing", // Ver música atual em tempo real
    ];

    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: "code", // Queremos receber um código de autorização
      redirect_uri: this.redirectUri,
      scope: scopes.join(" "), // Escopos separados por espaço
      state: state, // Token de segurança CSRF
      show_dialog: "false", // Não mostrar diálogo se já autorizado
    });

    return `${this.ACCOUNTS_URL}/authorize?${params.toString()}`;
  }

  /**
   * Troca o código de autorização por tokens de acesso
   *
   * Depois que o usuário autoriza o app, o Spotify nos dá um código temporário.
   * Este método troca esse código por tokens que podemos usar para fazer requisições.
   * O access_token dura 1 hora, mas o refresh_token dura para sempre e permite
   * pegar novos access_tokens.
   */
  async exchangeCodeForTokens(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    try {
      // Preparar credenciais em formato Base64 (padrão OAuth 2.0)
      const auth = Buffer.from(
        `${this.clientId}:${this.clientSecret}`
      ).toString("base64");

      const response = await axios.post(
        `${this.ACCOUNTS_URL}/api/token`,
        new URLSearchParams({
          grant_type: "authorization_code",
          code: code,
          redirect_uri: this.redirectUri,
        }),
        {
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in, // Geralmente 3600 segundos (1 hora)
      };
    } catch (error: any) {
      console.error("Erro ao trocar código por tokens:", error.response?.data);
      throw new Error("Falha na troca de código por tokens");
    }
  }

  /**
   * Renova um access token expirado usando o refresh token
   *
   * Como os access tokens expiram a cada hora, precisamos renová-los.
   * Felizmente, não precisamos pedir autorização do usuário novamente,
   * basta usar o refresh token.
   */
  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    expiresIn: number;
  }> {
    try {
      const auth = Buffer.from(
        `${this.clientId}:${this.clientSecret}`
      ).toString("base64");

      const response = await axios.post(
        `${this.ACCOUNTS_URL}/api/token`,
        new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
        {
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      return {
        accessToken: response.data.access_token,
        expiresIn: response.data.expires_in,
      };
    } catch (error: any) {
      console.error("Erro ao renovar token:", error.response?.data);
      throw new Error("Falha ao renovar access token");
    }
  }

  /**
   * Pega informações do perfil do usuário no Spotify
   *
   * Útil para confirmar que a autenticação funcionou e para guardar
   * o ID do usuário no Spotify no nosso banco de dados.
   */
  async getUserProfile(accessToken: string): Promise<{
    id: string;
    email: string;
    displayName: string;
    product: string; // "premium" ou "free"
  }> {
    try {
      const response = await axios.get(`${this.API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return {
        id: response.data.id,
        email: response.data.email,
        displayName: response.data.display_name,
        product: response.data.product,
      };
    } catch (error: any) {
      console.error("Erro ao buscar perfil:", error.response?.data);
      throw new Error("Falha ao buscar perfil do usuário");
    }
  }

  /**
   * Salva ou atualiza os tokens do Spotify no banco de dados
   *
   * Mantém os tokens sincronizados com o banco para que possamos
   * usá-los em requisições futuras sem pedir autorização novamente.
   */
  async saveUserTokens(
    userId: string,
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
    spotifyUserId: string
  ): Promise<void> {
    // Calcular quando o token vai expirar
    const expiryDate = new Date();
    expiryDate.setSeconds(expiryDate.getSeconds() + expiresIn);

    await prisma.user.update({
      where: { id: userId },
      data: {
        spotifyAccessToken: accessToken,
        spotifyRefreshToken: refreshToken,
        spotifyTokenExpiry: expiryDate,
        spotifyUserId: spotifyUserId,
      },
    });
  }

  /**
   * Pega um access token válido para o usuário
   *
   * Este método é inteligente: primeiro verifica se o token atual ainda é válido.
   * Se estiver expirado, automaticamente renova usando o refresh token.
   * Assim você sempre tem um token válido para usar.
   */
  async getValidAccessToken(userId: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        spotifyAccessToken: true,
        spotifyRefreshToken: true,
        spotifyTokenExpiry: true,
      },
    });

    if (!user?.spotifyRefreshToken) {
      throw new Error("Usuário não autenticou com Spotify ainda");
    }

    // Verificar se o token ainda é válido (com margem de 5 minutos)
    const now = new Date();
    const expiryWithMargin = new Date(user.spotifyTokenExpiry!);
    expiryWithMargin.setMinutes(expiryWithMargin.getMinutes() - 5);

    if (now < expiryWithMargin && user.spotifyAccessToken) {
      // Token ainda válido, retornar direto
      return user.spotifyAccessToken;
    }

    // Token expirado, precisamos renovar
    console.log(`🔄 Renovando token do Spotify para usuário ${userId}`);
    const { accessToken, expiresIn } = await this.refreshAccessToken(
      user.spotifyRefreshToken
    );

    // Salvar novo token no banco
    const newExpiryDate = new Date();
    newExpiryDate.setSeconds(newExpiryDate.getSeconds() + expiresIn);

    await prisma.user.update({
      where: { id: userId },
      data: {
        spotifyAccessToken: accessToken,
        spotifyTokenExpiry: newExpiryDate,
      },
    });

    return accessToken;
  }
}

export const spotifyAuthService = new SpotifyAuthService();
