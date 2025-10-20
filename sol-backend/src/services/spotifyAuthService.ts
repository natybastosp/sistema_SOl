import axios from 'axios';
import { prisma } from '../lib/prisma';

const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_URL = 'https://api.spotify.com/v1';

// Escopos necessários para tocar música
const SCOPES = [
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'streaming',
  'user-read-email',
  'user-read-private'
].join(' ');

export class SpotifyAuthService {
  
  /**
   * Gera a URL de autorização do Spotify
   * O usuário será redirecionado para esta URL para autorizar o app
   */
  static getAuthorizationUrl(userId: number): string {
    const params = new URLSearchParams({
      client_id: process.env.SPOTIFY_CLIENT_ID!,
      response_type: 'code',
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
      scope: SCOPES,
      state: userId.toString(), // Importante para identificar o usuário depois
      show_dialog: 'false'
    });

    return `${SPOTIFY_AUTH_URL}?${params.toString()}`;
  }

  /**
   * Troca o código de autorização por tokens de acesso
   * Chamado no callback após o usuário autorizar
   */
  static async exchangeCodeForTokens(code: string, userId: number) {
    try {
      const response = await axios.post(
        SPOTIFY_TOKEN_URL,
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
          client_id: process.env.SPOTIFY_CLIENT_ID!,
          client_secret: process.env.SPOTIFY_CLIENT_SECRET!
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const { access_token, refresh_token, expires_in } = response.data;
      
      // Salva os tokens no banco de dados
      await prisma.user.update({
        where: { id: userId },
        data: {
          spotifyAccessToken: access_token,
          spotifyRefreshToken: refresh_token,
          spotifyTokenExpiry: new Date(Date.now() + expires_in * 1000),
          spotifyConnected: true
        }
      });

      return { access_token, refresh_token };
    } catch (error) {
      console.error('Erro ao trocar código por tokens:', error);
      throw new Error('Falha na autenticação com Spotify');
    }
  }

  /**
   * Atualiza o token de acesso usando o refresh token
   * Tokens expiram após 1 hora, então isso é essencial
   */
  static async refreshAccessToken(userId: number): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { spotifyRefreshToken: true }
    });

    if (!user?.spotifyRefreshToken) {
      throw new Error('Usuário não conectado ao Spotify');
    }

    try {
      const response = await axios.post(
        SPOTIFY_TOKEN_URL,
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: user.spotifyRefreshToken,
          client_id: process.env.SPOTIFY_CLIENT_ID!,
          client_secret: process.env.SPOTIFY_CLIENT_SECRET!
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const { access_token, expires_in } = response.data;

      // Atualiza o token no banco
      await prisma.user.update({
        where: { id: userId },
        data: {
          spotifyAccessToken: access_token,
          spotifyTokenExpiry: new Date(Date.now() + expires_in * 1000)
        }
      });

      return access_token;
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      throw new Error('Falha ao renovar token do Spotify');
    }
  }

  /**
   * Obtém um token válido, renovando se necessário
   * Use este método antes de cada chamada à API do Spotify
   */
  static async getValidToken(userId: number): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        spotifyAccessToken: true,
        spotifyTokenExpiry: true,
        spotifyConnected: true
      }
    });

    if (!user?.spotifyConnected) {
      throw new Error('Usuário não conectado ao Spotify');
    }

    // Se o token está para expirar em menos de 5 minutos, renova
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
    
    if (!user.spotifyTokenExpiry || user.spotifyTokenExpiry < fiveMinutesFromNow) {
      return await this.refreshAccessToken(userId);
    }

    return user.spotifyAccessToken!;
  }
}