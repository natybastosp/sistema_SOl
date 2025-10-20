import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { spotifyAuthService } from "@/lib/spotifyAuth";
import axios from "axios";

/**
 * GET /api/spotify/player/currently-playing
 *
 * Retorna informações sobre a música que está tocando atualmente.
 *
 * Útil para mostrar no frontend qual música está tocando,
 * a capa do álbum, progresso da reprodução, etc.
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Token inválido" },
        { status: 401 }
      );
    }

    const accessToken = await spotifyAuthService.getValidAccessToken(
      payload.userId
    );

    const response = await axios.get(
      "https://api.spotify.com/v1/me/player/currently-playing",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // Se não houver nada tocando, o Spotify retorna 204 No Content
    if (response.status === 204 || !response.data) {
      return NextResponse.json({
        success: true,
        isPlaying: false,
        message: "Nenhuma música tocando",
      });
    }

    // Extrair informações relevantes
    const track = response.data.item;
    const isPlaying = response.data.is_playing;
    const progress = response.data.progress_ms;

    return NextResponse.json({
      success: true,
      isPlaying,
      track: {
        id: track.id,
        name: track.name,
        artists: track.artists.map((a: any) => a.name).join(", "),
        album: track.album.name,
        albumCover: track.album.images[0]?.url,
        duration: track.duration_ms,
        progress,
        uri: track.uri,
      },
    });
  } catch (error: any) {
    console.error("❌ Erro ao buscar música atual:", error);

    // Se não houver player ativo, retornar status especial
    if (error.response?.status === 204) {
      return NextResponse.json({
        success: true,
        isPlaying: false,
        message: "Nenhum player ativo",
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Erro ao buscar música atual",
        message: error.response?.data?.error?.message || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
